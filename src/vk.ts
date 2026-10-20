import bridge from '@vkontakte/vk-bridge';

/**
 * Получает ID текущего пользователя VK
 * @returns Promise<number | null> - ID пользователя или null если вне VK
 */
export async function getVkUserId(): Promise<number | null> {
  try {
    const response = await bridge.send('VKWebAppGetUserInfo');
    return response?.id ?? null;
  } catch (error) {
    // Вне VK-клиента или ошибка получения данных
    return null;
  }
}

/**
 * Инициализирует VK Bridge
 * Вызывать один раз при старте приложения
 */
export function initVkBridge(): void {
  try {
    bridge.send('VKWebAppInit');
    bridge.send('VKWebAppSetViewSettings', {
      status_bar_style: 'light',
      action_bar_color: '#120F38',
      navigation_bar_color: '#120F38'
    });
  } catch (error) {
    // Игнорируем ошибки инициализации вне VK
  }
}
