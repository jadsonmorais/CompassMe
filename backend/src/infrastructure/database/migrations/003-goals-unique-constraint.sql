-- 003-goals-unique-constraint.sql
-- Adiciona constraint UNIQUE(user_id, period) na tabela goals para suportar ON CONFLICT

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'goals_user_period_unique'
  ) THEN
    ALTER TABLE goals ADD CONSTRAINT goals_user_period_unique UNIQUE (user_id, period);
  END IF;
END $$;
