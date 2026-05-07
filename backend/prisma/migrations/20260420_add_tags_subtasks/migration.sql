-- Add tags array and subtasks JSONB columns to Task
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "subtasks" JSONB NOT NULL DEFAULT '[]';
