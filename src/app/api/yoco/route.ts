import { NextResponse } from 'next/server';
import { createYocoCheckout, getYocoPaymentDetails } from '@/lib/yoco';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/yoco/create-checkout
 * Create a Yoco checkout session for a donation
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be logged in to make a donation' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, requestId, isAnonymous } = body;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid donation amount' },
        { status: 400 }
      );
    }

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Verify the request exists
    const helpRequest = await prisma.request.findUnique({
      where: { id: requestId },
      include: { user: true },
    });

    if (!helpRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Create donation record with PLEDGED status
    const donation = await prisma.donation.create({
      data: {
        amount,
        status: 'PLEDGED',
        paymentMethod: 'YOCO',
        paymentStatus: 'PENDING',
        anonymous: isAnonymous || false,
        donorId: session.user.id,
        requestId: requestId,
      },
    });

    // Convert amount to cents for Yoco (ZAR)
    const amountInCents = Math.round(amount * 100);

    // Create Yoco checkout
    const { checkoutUrl, checkoutId } = await createYocoCheckout({
      amount: amountInCents,
      currency: 'ZAR',
      metadata: {
        donationId: donation.id,
        requestId: requestId,
        donorName: isAnonymous ? 'Anonymous' : session.user.name,
        donorEmail: session.user.email,
      },
      successUrl: `${process.env.NEXTAUTH_URL}/donations/success?donationId=${donation.id}`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/requests/${requestId}?cancelled=true`,
      failureUrl: `${process.env.NEXTAUTH_URL}/donations/failed?donationId=${donation.id}`,
    });

    // Update donation with Yoco checkout ID
    await prisma.donation.update({
      where: { id: donation.id },
      data: { 
        paymentIntentId: checkoutId,
        paymentStatus: 'PROCESSING',
      },
    });

    return NextResponse.json({
      success: true,
      checkoutUrl,
      donationId: donation.id,
    });
  } catch (error: any) {
    console.error('Yoco checkout creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Yoco checkout' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/yoco/verify-payment
 * Verify a Yoco payment and update donation status
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkoutId = searchParams.get('checkoutId');
    const donationId = searchParams.get('donationId');

    if (!checkoutId || !donationId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get donation record
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: { request: true },
    });

    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }

    // Get payment details from Yoco
    const paymentDetails = await getYocoPaymentDetails(checkoutId);

    // Update donation status based on payment status
    let status: 'PLEDGED' | 'COMPLETED' | 'REFUNDED' = 'PLEDGED';
    let paymentStatus = 'PENDING';
    
    if (paymentDetails.status === 'succeeded') {
      status = 'COMPLETED';
      paymentStatus = 'COMPLETED';
      
      // Update request current amount
      await prisma.request.update({
        where: { id: donation.requestId },
        data: {
          currentAmount: {
            increment: donation.amount,
          },
        },
      });
    } else if (paymentDetails.status === 'failed' || paymentDetails.status === 'cancelled') {
      status = 'REFUNDED';
      paymentStatus = 'FAILED';
    }

    // Update donation
    await prisma.donation.update({
      where: { id: donationId },
      data: {
        status,
        paymentStatus,
        paymentIntentId: checkoutId,
      },
    });

    return NextResponse.json({
      success: true,
      status,
      paymentDetails,
    });
  } catch (error: any) {
    console.error('Yoco payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
