-- 002-add-user-multiplier.sql
-- Adiciona coluna de multiplicador diário ativo no perfil do usuário

ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.0;
