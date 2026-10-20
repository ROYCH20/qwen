/**
 * Нормализация буквы Yo → E
 * Grafmassa не поддерживает Yo, рендерится фолбэк-глиф
 */
export const normalizeYo = (s: string): string =>
  s.replace(/Ё/g, 'Е').replace(/ё/g, 'е');
