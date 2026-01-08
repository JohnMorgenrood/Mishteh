-- Security Enhancement Migration
-- Run this in your Neon database dashboard

-- Add security tracking fields to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "signupIp" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "signupCountry" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "signupCity" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginIp" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "securityQuestion" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "securityAnswer" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isSuspicious" BOOLEAN DEFAULT FALSE;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "suspiciousReason" TEXT;

-- Create Security Log table for tracking all security events
CREATE TABLE IF NOT EXISTS "SecurityLog" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "ipAddress" TEXT,
    "country" TEXT,
    "countryCode" TEXT,
    "city" TEXT,
    "region" TEXT,
    "timezone" TEXT,
    "isp" TEXT,
    "isVpn" BOOLEAN DEFAULT FALSE,
    "isProxy" BOOLEAN DEFAULT FALSE,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "userAgent" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SecurityLog_pkey" PRIMARY KEY ("id")
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS "SecurityLog_email_idx" ON "SecurityLog"("email");
CREATE INDEX IF NOT EXISTS "SecurityLog_ipAddress_idx" ON "SecurityLog"("ipAddress");
CREATE INDEX IF NOT EXISTS "SecurityLog_eventType_idx" ON "SecurityLog"("eventType");
CREATE INDEX IF NOT EXISTS "SecurityLog_createdAt_idx" ON "SecurityLog"("createdAt");
CREATE INDEX IF NOT EXISTS "SecurityLog_country_idx" ON "SecurityLog"("country");
CREATE INDEX IF NOT EXISTS "User_signupCountry_idx" ON "User"("signupCountry");
CREATE INDEX IF NOT EXISTS "User_isSuspicious_idx" ON "User"("isSuspicious");

-- Add foreign key (optional - allows NULL for events before user creation)
ALTER TABLE "SecurityLog" 
ADD CONSTRAINT "SecurityLog_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Show completion message
SELECT 'Security tables created successfully!' as message;
