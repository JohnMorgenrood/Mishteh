-- Create a sample request for testing
-- Run this in your Neon database

-- First, let's see what categories are available and create a test request

-- Insert a sample request (you need to replace 'YOUR_USER_ID' with your actual user ID)
-- You can find your user ID by running: SELECT id, email FROM "User" WHERE email = 'golearnx@gmail.com';

-- Get your user ID first:
-- SELECT id, email FROM "User" WHERE email = 'golearnx@gmail.com';

-- Then create request (replace the userId value):
INSERT INTO "Request" (
  "id",
  "userId",
  "title",
  "description",
  "category",
  "urgency",
  "location",
  "targetAmount",
  "currentAmount",
  "status",
  "verified",
  "views",
  "featured",
  "isAnonymous",
  "createdAt",
  "updatedAt"
) VALUES (
  'test-request-001',
  (SELECT id FROM "User" WHERE email = 'golearnx@gmail.com' LIMIT 1),
  'Help with School Supplies for Local Children',
  'We are collecting school supplies for underprivileged children in our community. Many families cannot afford basic items like notebooks, pens, pencils, and backpacks. Your donation will help ensure every child has the tools they need to succeed in school. We are partnering with local schools to identify children in need and distribute supplies directly to them.',
  'EDUCATION',
  'MEDIUM',
  'Johannesburg, South Africa',
  5000.00,
  0.00,
  'ACTIVE',
  true,
  0,
  false,
  false,
  NOW(),
  NOW()
);

-- Create another request with different category
INSERT INTO "Request" (
  "id",
  "userId",
  "title",
  "description",
  "category",
  "urgency",
  "location",
  "targetAmount",
  "currentAmount",
  "status",
  "verified",
  "views",
  "featured",
  "isAnonymous",
  "createdAt",
  "updatedAt"
) VALUES (
  'test-request-002',
  (SELECT id FROM "User" WHERE email = 'golearnx@gmail.com' LIMIT 1),
  'Emergency Food Parcels for Families',
  'Several families in our area have been affected by recent job losses and are struggling to put food on the table. We are organizing emergency food parcels containing essential items like rice, maize meal, cooking oil, and canned goods. Each parcel can feed a family of 4 for one week. Help us reach our goal of providing 50 food parcels this month.',
  'FOOD_GROCERIES',
  'HIGH',
  'Cape Town, South Africa',
  10000.00,
  250.00,
  'ACTIVE',
  true,
  15,
  true,
  false,
  NOW(),
  NOW()
);

SELECT 'Test requests created successfully!' as message;
