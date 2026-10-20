-- Миграция: добавление колонки vk_id для привязки VK ID
-- Выполнить в Supabase SQL Editor

-- Добавляем колонку vk_id (bigint для хранения VK user ID)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS vk_id BIGINT;

-- Создаём индекс для быстрого поиска по vk_id
CREATE INDEX IF NOT EXISTS users_vk_id_idx ON public.users (vk_id);

-- Комментарий: эта миграция идемпотентна, можно запускать повторно
