import { VK_APP_URL } from './config';

/**
 * Parse QR payload to extract user ID
 * Supports two formats:
 * 1. Deep link: https://vk.com/app...?qr=P001
 * 2. Legacy: plain ID like P001, C001, A001
 */
export function parseQrPayload(text: string): string | null {
  const trimmed = text.trim();
  
  // Case 1: Deep link with VK_APP_URL
  if (trimmed.startsWith(VK_APP_URL)) {
    try {
      const url = new URL(trimmed);
      const qrParam = url.searchParams.get('qr');
      if (qrParam) {
        return qrParam;
      }
    } catch {
      // Invalid URL, continue to next case
    }
  }
  
  // Case 2: Legacy plain ID format [PCA]\d{3}
  if (/^[PCA]\d{3}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  
  // Case 3: Unknown format
  return null;
}
