-- Cloud progress schema for cross-device sync.
-- Rows are scoped per user and protected by Row Level Security.

CREATE TABLE IF NOT EXISTS public.user_algorithm_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  algorithm_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('NOT_STARTED', 'LEARNING', 'PRACTICED', 'MASTERED')
  ),
  practice_count INTEGER NOT NULL DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  mastered_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, algorithm_id)
);

ALTER TABLE public.user_algorithm_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own progress"
  ON public.user_algorithm_progress;

CREATE POLICY "Users can manage own progress"
  ON public.user_algorithm_progress
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
