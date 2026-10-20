/**
 * v17.6: Устойчивый парсер QR-payload (принцип qrcoder.ru - не зависеть от окружения).
 * Поддерживает форматы:
 * 1. Голый ID (старые распечатанные коды): P001 / C001 / A001
 * 2. Любая http(s)-ссылка с query-параметром qr= - хост НЕ сверяется
 *    (снимает рассинхрон VITE_VK_APP_URL между средой генерации QrCard
 *    и средой сканирования)
 * 3. Fallback: regex-вытягивание ?qr=XXX из произвольной строки
 */
export function parseQrPayload(text: string): string | null {
  const raw = text.trim();
  if (!raw) return null;

  // 1) Голый ID (старые распечатанные коды): /^[PCA]\d{3}$/i
  if (/^[PCA]\d{3}$/i.test(raw)) return raw.toUpperCase();

  // 2) Любая http(s)-ссылка с query-параметром qr= - НЕ сверяем хост/APP_ID,
  //    берем значение параметра. Это снимает рассинхрон VITE_VK_APP_URL
  //    между средой генерации QrCard и средой сканирования.
  try {
    const u = new URL(raw);
    const qr = u.searchParams.get('qr');
    if (qr && /^[PCA]\d{3}$/i.test(qr.trim())) return qr.trim().toUpperCase();
  } catch {}

  // 3) Fallback: regex-вытягивание ?qr=XXX из произвольной строки
  const m = raw.match(/[?&]qr=([A-Za-z]{1}\d{3})/);
  if (m) return m[1].toUpperCase();

  return null;
}
