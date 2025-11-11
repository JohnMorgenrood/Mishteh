import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for creating donations
const createDonationSchema = z.object({
  requestId: z.string(),
  amount: z.number().positive('Amount must be greater than 0'),
  message: z.string().optional(),
  anonymous: z.boolean().default(false),
});

// GET - Fetch donations (for donor's history)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const donations = await prisma.donation.findMany({
      where: {
        donorId: session.user.id,
      },
      include: {
        request: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ donations });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}

// POST - Create a new donation/pledge
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only donors can make donations
    if (session.user.userType !== 'DONOR') {
      return NextResponse.json(
        { error: 'Only donors can make donations' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validationResult = createDonationSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { requestId, amount, message, anonymous } = validationResult.data;

    // Check if request exists and is active
    const helpRequest = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!helpRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    if (helpRequest.status === 'WITHDRAWN' || helpRequest.status === 'REJECTED') {
      return NextResponse.json(
        { error: 'This request is no longer active' },
        { status: 400 }
      );
    }

    // Create the donation
    const donation = await prisma.donation.create({
      data: {
        donorId: session.user.id,
        requestId,
        amount,
        message,
        anonymous,
        status: 'PLEDGED',
      },
    });

    // Update request's current amount
    const updatedAmount = helpRequest.currentAmount + amount;
    const newStatus = helpRequest.targetAmount && updatedAmount >= helpRequest.targetAmount
      ? 'FUNDED'
      : 'PARTIALLY_FUNDED';

    await prisma.request.update({
      where: { id: requestId },
      data: {
        currentAmount: updatedAmount,
        status: newStatus,
      },
    });

    // Create notification for requester
    await prisma.notification.create({
      data: {
        userId: helpRequest.userId,
        title: 'New Donation Received!',
        message: anonymous
          ? `You received a donation of $${amount} from an anonymous donor.`
          : `You received a donation of $${amount}.`,
        type: 'donation_received',
        link: `/dashboard/requests/${requestId}`,
      },
    });

    return NextResponse.json(
      { 
        message: 'Donation created successfully',
        donation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating donation:', error);
    return NextResponse.json(
      { error: 'Failed to create donation' },
      { status: 500 }
    );
  }
}
