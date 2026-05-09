-- 001-init.sql
-- CompassMe initial schema
-- Created: May 2026

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities
CREATE TYPE activity_type AS ENUM ('ROUTINE', 'ONE_TIME', 'OPTIONAL');

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type activity_type NOT NULL DEFAULT 'ROUTINE',
  weight NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  recurrence VARCHAR(50), -- 'DAILY', 'WEEKLY', 'MONTHLY', null for one-time
  scheduled_date DATE,
  deadline_time TIME,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Completions (daily tracking)
CREATE TABLE IF NOT EXISTS activity_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  completed_at TIMESTAMPTZ,
  skipped BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(activity_id, completed_date)
);

-- Daily Progress
CREATE TABLE IF NOT EXISTS daily_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_activities INTEGER NOT NULL DEFAULT 0,
  completed_count INTEGER NOT NULL DEFAULT 0,
  skipped_count INTEGER NOT NULL DEFAULT 0,
  daily_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  progress_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Aura History
CREATE TABLE IF NOT EXISTS aura_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  aura_delta INTEGER NOT NULL DEFAULT 0,
  aura_total INTEGER NOT NULL DEFAULT 0,
  reason VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Goals
CREATE TYPE goal_period AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period goal_period NOT NULL,
  target_percentage NUMERIC(5,2) NOT NULL DEFAULT 80.0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_scheduled_date ON activities(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_completions_user_date ON activity_completions(user_id, completed_date);
CREATE INDEX IF NOT EXISTS idx_completions_activity ON activity_completions(activity_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_user_date ON daily_progress(user_id, date);
CREATE INDEX IF NOT EXISTS idx_aura_user_date ON aura_history(user_id, date);
CREATE INDEX IF NOT EXISTS idx_goals_user_period ON goals(user_id, period);
