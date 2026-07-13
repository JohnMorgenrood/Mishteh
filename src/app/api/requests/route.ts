import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// All valid categories (legacy + new)
const ALL_CATEGORIES = [
  // Legacy categories
  'FOOD', 'RENT', 'BILLS', 'FAMILY_SUPPORT', 'JOB_ASSISTANCE', 'MEDICAL', 'EDUCATION', 'OTHER',
  // New categories
  'FOOD_GROCERIES', 'RENT_HOUSING', 'UTILITIES', 'CLOTHING_ESSENTIALS', 'TRANSPORTATION',
  'SINGLE_PARENTS', 'CHILDCARE_SCHOOL', 'NEWBORN_BABY', 'ADOPTION_FOSTER', 'FAMILY_EMERGENCY',
  'MEDICAL_BILLS', 'PRESCRIPTION_MEDS', 'DISABILITY_SUPPORT', 'MENTAL_HEALTH', 'THERAPY_REHAB',
  'TUITION_FEES', 'BOOKS_SUPPLIES', 'VOCATIONAL_TRAINING', 'TECHNOLOGY_LEARNING',
  'RETIREMENT_SUPPORT', 'MOBILITY_EQUIPMENT', 'HOME_CARE', 'SENIOR_SOCIAL_SUPPORT',
  'NATURAL_DISASTER', 'ACCIDENT_INJURY', 'DOMESTIC_VIOLENCE', 'FUNERAL_SUPPORT', 'LEGAL_AID_CRISIS',
  'NEIGHBORHOOD_PROJECT', 'COMMUNITY_FOOD_DRIVE', 'YOUTH_PROGRAMS', 'CULTURAL_RELIGIOUS', 'VOLUNTEER_NONPROFIT',
  'PET_FOOD_SUPPLIES', 'EMERGENCY_VET_CARE', 'ANIMAL_RESCUE', 'FARM_ANIMAL_AID',
  'ADAPTIVE_EQUIPMENT', 'HOME_MODIFICATIONS', 'DISABLED_TRANSPORT', 'SUPPORT_ANIMALS',
  'VETERAN_HOUSING', 'PTSD_COUNSELING', 'VETERAN_JOB_PLACEMENT', 'VETERAN_FAMILY_AID',
  'STARTUP_GRANT', 'BUSINESS_TOOLS', 'BUSINESS_LICENSING', 'BUSINESS_TRAINING',
  'EMERGENCY_SHELTER', 'HOME_REPAIRS', 'MOVING_ASSISTANCE', 'EVICTION_PREVENTION',
  'RELOCATION_COSTS', 'LEGAL_DOCUMENTATION', 'LANGUAGE_INTEGRATION', 'REFUGEE_EMERGENCY',
  'JOB_LOSS_HARDSHIP', 'TRAVEL_EMERGENCY', 'UNEXPECTED_EXPENSES',
] as const;

// Validation schema for creating requests
const createRequestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum(ALL_CATEGORIES),
  customCategory: z.string().optional(),
  urgency: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  location: z.string().min(2, 'Location is required'),
  targetAmount: z.number().positive().optional(),
  isAnonymous: z.boolean().optional(),
  expiresAt: z.string().optional(),
});

// GET - Fetch all requests with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const urgency = searchParams.get('urgency');
    const location = searchParams.get('location');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build filter object
    const where: any = {};
    
    if (category) where.category = category;
    if (urgency) where.urgency = urgency;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    const publicStatuses = ['ACTIVE', 'PARTIALLY_FUNDED'];
    if (status && publicStatuses.includes(status)) where.status = status;
    
    // Pending, rejected, and withdrawn requests are never returned publicly.
    if (!where.status) {
      where.status = { in: publicStatuses };
    }

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              location: true,
              image: true,
              instagramUrl: true,
              facebookUrl: true,
              twitterUrl: true,
            },
          },
          _count: {
            select: {
              donations: true,
              likes: true,
              comments: true,
            },
          },
          likes: {
            select: {
              userId: true,
            },
          },
        },
        orderBy: [
          { urgency: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.request.count({ where }),
    ]);

    return NextResponse.json({
      requests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}

// POST - Create a new request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const requester = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        userType: true,
        fullName: true,
        phone: true,
        location: true,
        bio: true,
        image: true,
        idDocumentUrl: true,
        selfieUrl: true,
        ficaVerified: true,
        isSuspicious: true,
      },
    });

    // Check the database record, not user-controlled client state or a stale session.
    if (!requester || requester.userType !== 'REQUESTER') {
      return NextResponse.json(
        { error: 'Only requesters can create help requests' },
        { status: 403 }
      );
    }

    const missingProfileFields = [
      !requester.fullName?.trim() && 'full name',
      !requester.phone?.trim() && 'phone number',
      !requester.location?.trim() && 'location',
      !requester.bio?.trim() && 'bio',
      !requester.image?.trim() && 'profile photo',
      !requester.idDocumentUrl?.trim() && 'identity document',
      !requester.selfieUrl?.trim() && 'selfie with ID',
    ].filter(Boolean);

    if (missingProfileFields.length > 0) {
      return NextResponse.json(
        {
          error: `Complete your profile before posting. Missing: ${missingProfileFields.join(', ')}`,
          code: 'PROFILE_INCOMPLETE',
        },
        { status: 403 }
      );
    }

    if (!requester.ficaVerified || requester.isSuspicious) {
      return NextResponse.json(
        {
          error: requester.isSuspicious
            ? 'Your account requires a security review before you can post.'
            : 'Your identity must be approved by an administrator before you can post.',
          code: 'ACCOUNT_APPROVAL_REQUIRED',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = createRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Create the request
    const newRequest = await prisma.request.create({
      data: {
        userId: session.user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        customCategory: data.category === 'OTHER' ? data.customCategory : null,
        urgency: data.urgency,
        location: data.location,
        targetAmount: data.targetAmount,
        isAnonymous: data.isAnonymous || false,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        status: 'PENDING', // Starts as pending until verified
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Create notification for admins (simplified - in production, notify all admins)
    // This is a placeholder for notification logic

    return NextResponse.json(
      { 
        message: 'Request created successfully. It will be reviewed by our team.',
        request: newRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    );
  }
}
