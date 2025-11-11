-- Create admin user (run this after creating a regular user account)
-- Replace 'your-admin-email@example.com' with your actual admin email

-- Option 1: Update existing user to admin
UPDATE "User" 
SET "userType" = 'ADMIN' 
WHERE email = 'admin@example.com';

-- Option 2: Create new admin user (with hashed password for 'admin123')
-- Note: In production, use NextAuth registration then update the role
INSERT INTO "User" (id, email, password, "fullName", "userType", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY4Y93Gz8t7oHJu', -- password: admin123
  'Admin User',
  'ADMIN',
  NOW(),
  NOW()
);

-- Create sample requests (optional)
INSERT INTO "Request" (id, "userId", title, description, category, urgency, location, "targetAmount", "currentAmount", status, verified, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  (SELECT id FROM "User" WHERE "userType" = 'REQUESTER' LIMIT 1),
  'Help with Rent for This Month',
  'I recently lost my job and need assistance with this month''s rent. I have two children and am actively looking for work.',
  'RENT',
  'HIGH',
  'Los Angeles, CA',
  1200.00,
  0,
  'ACTIVE',
  true,
  NOW(),
  NOW()
WHERE EXISTS (SELECT 1 FROM "User" WHERE "userType" = 'REQUESTER');

-- Create sample donation (optional)
INSERT INTO "Donation" (id, "donorId", "requestId", amount, message, status, anonymous, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  (SELECT id FROM "User" WHERE "userType" = 'DONOR' LIMIT 1),
  (SELECT id FROM "Request" LIMIT 1),
  50.00,
  'Hope this helps! Stay strong!',
  'COMPLETED',
  false,
  NOW(),
  NOW()
WHERE EXISTS (SELECT 1 FROM "User" WHERE "userType" = 'DONOR')
  AND EXISTS (SELECT 1 FROM "Request");

-- Update request current amount after donation
UPDATE "Request" 
SET "currentAmount" = "currentAmount" + 50.00,
    status = 'PARTIALLY_FUNDED'
WHERE id = (SELECT id FROM "Request" LIMIT 1);

-- Create donor preferences
INSERT INTO "DonorPreference" (id, "userId", "preferredCategories", "preferredLocations", "emailNotifications", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  id,
  ARRAY['FOOD', 'RENT']::text[],
  ARRAY['Los Angeles, CA', 'New York, NY']::text[],
  true,
  NOW(),
  NOW()
FROM "User" 
WHERE "userType" = 'DONOR'
  AND NOT EXISTS (
    SELECT 1 FROM "DonorPreference" WHERE "userId" = "User".id
  );

-- View statistics
SELECT 
  'Total Users' as metric,
  COUNT(*) as value
FROM "User"
UNION ALL
SELECT 
  'Total Requests',
  COUNT(*)
FROM "Request"
UNION ALL
SELECT 
  'Total Donations',
  COUNT(*)
FROM "Donation"
UNION ALL
SELECT 
  'Total Funds Raised',
  COALESCE(SUM(amount), 0)
FROM "Donation"
WHERE status = 'COMPLETED';
