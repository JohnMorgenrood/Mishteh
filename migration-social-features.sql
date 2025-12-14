-- Migration: Add Social Features (Likes, Comments, Activity Feed)
-- Run this migration to add the new social features tables

-- Add new social link columns to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "tiktokUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "websiteUrl" TEXT;

-- Create Like table for request likes
CREATE TABLE IF NOT EXISTS "Like" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on userId + requestId
CREATE UNIQUE INDEX IF NOT EXISTS "Like_userId_requestId_key" ON "Like"("userId", "requestId");

-- Create indexes for Like table
CREATE INDEX IF NOT EXISTS "Like_requestId_idx" ON "Like"("requestId");
CREATE INDEX IF NOT EXISTS "Like_userId_idx" ON "Like"("userId");

-- Add foreign key constraints for Like
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Like" ADD CONSTRAINT "Like_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create Comment table
CREATE TABLE IF NOT EXISTS "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- Create indexes for Comment table
CREATE INDEX IF NOT EXISTS "Comment_requestId_idx" ON "Comment"("requestId");
CREATE INDEX IF NOT EXISTS "Comment_userId_idx" ON "Comment"("userId");
CREATE INDEX IF NOT EXISTS "Comment_createdAt_idx" ON "Comment"("createdAt" DESC);

-- Add foreign key constraints for Comment
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create ActivityType enum
DO $$ BEGIN
    CREATE TYPE "ActivityType" AS ENUM ('LIKE', 'COMMENT', 'DONATION', 'NEW_REQUEST', 'REQUEST_FUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Activity table for feed
CREATE TABLE IF NOT EXISTS "Activity" (
    "id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "userId" TEXT,
    "requestId" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- Create indexes for Activity table
CREATE INDEX IF NOT EXISTS "Activity_type_idx" ON "Activity"("type");
CREATE INDEX IF NOT EXISTS "Activity_createdAt_idx" ON "Activity"("createdAt" DESC);

-- Success message
SELECT 'Social features migration completed successfully!' as message;
