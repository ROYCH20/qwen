// Конфигурация приложения
export const VK_APP_URL = import.meta.env.VITE_VK_APP_URL ?? 'https://vk.com/app000000';

export const buildUserQr = (id: string): string => {
  return `${VK_APP_URL}?qr=${encodeURIComponent(id)}`;
};
