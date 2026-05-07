-- CreateTable: Note
CREATE TABLE "Note" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "title"     TEXT NOT NULL,
    "content"   TEXT NOT NULL DEFAULT '',
    "mood"      TEXT,
    "color"     TEXT NOT NULL DEFAULT '#6366f1',
    "pinned"    BOOLEAN NOT NULL DEFAULT false,
    "tags"      TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Goal
CREATE TABLE "Goal" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "description" TEXT,
    "category"    TEXT NOT NULL DEFAULT 'personal',
    "target"      DOUBLE PRECISION NOT NULL DEFAULT 100,
    "current"     DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit"        TEXT NOT NULL DEFAULT '%',
    "deadline"    TIMESTAMP(3),
    "completed"   BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "color"       TEXT NOT NULL DEFAULT '#6366f1',
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable: FocusSession
CREATE TABLE "FocusSession" (
    "id"          TEXT NOT NULL,
    "userId"      TEXT NOT NULL,
    "phase"       TEXT NOT NULL DEFAULT 'focus',
    "taskTitle"   TEXT,
    "durationMin" INTEGER NOT NULL DEFAULT 25,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FocusSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FocusSession" ADD CONSTRAINT "FocusSession_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Note_userId_idx" ON "Note"("userId");
CREATE INDEX "Note_userId_pinned_idx" ON "Note"("userId", "pinned");
CREATE INDEX "Goal_userId_idx" ON "Goal"("userId");
CREATE INDEX "Goal_userId_completed_idx" ON "Goal"("userId", "completed");
CREATE INDEX "FocusSession_userId_idx" ON "FocusSession"("userId");
CREATE INDEX "FocusSession_userId_completedAt_idx" ON "FocusSession"("userId", "completedAt");
