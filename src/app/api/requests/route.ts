import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating requests
const createRequestSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.enum(['FOOD', 'RENT', 'BILLS', 'FAMILY_SUPPORT', 'JOB_ASSISTANCE', 'MEDICAL', 'EDUCATION', 'OTHER']),
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
    if (status) where.status = status;
    
    // Default to showing only active requests for public view
    if (!status) {
      where.status = { in: ['ACTIVE', 'PARTIALLY_FUNDED'] };
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
            },
          },
          _count: {
            select: {
              donations: true,
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

    // Only requesters can create requests
    if (session.user.userType !== 'REQUESTER') {
      return NextResponse.json(
        { error: 'Only requesters can create help requests' },
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
