import { NextResponse } from 'next/server';
import { createYocoCheckout, getYocoPaymentDetails, isYocoPaymentSuccessful } from '@/lib/yoco';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateYocoBreakdown } from '@/lib/payment-fees';

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
    const { amount, totalAmount, requestId, isAnonymous } = body;

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

    const feeBreakdown = calculateYocoBreakdown(amount);
    const calculatedTotal = totalAmount || feeBreakdown.grossAmount;

    // Store the net amount that will be available to the requester after fees.
    const donation = await prisma.donation.create({
      data: {
        amount: feeBreakdown.netAmount,
        status: 'PLEDGED',
        paymentMethod: 'YOCO',
        paymentStatus: 'PENDING',
        anonymous: isAnonymous || false,
        donorId: session.user.id,
        requestId: requestId,
      },
    });

    // Convert total amount (with fees) to cents for Yoco (ZAR)
    const amountInCents = Math.round(calculatedTotal * 100);

    // Create Yoco checkout
    const { checkoutUrl, checkoutId } = await createYocoCheckout({
      amount: amountInCents,
      currency: 'ZAR',
      metadata: {
        donationId: donation.id,
        requestId: requestId,
        donorName: isAnonymous ? 'Anonymous' : session.user.name,
        donorEmail: session.user.email,
        originalAmount: feeBreakdown.grossAmount,
        totalWithFees: calculatedTotal,
        mishtehFee: feeBreakdown.platformFee,
        yocoFee: feeBreakdown.processingFee,
        recipientAmount: feeBreakdown.netAmount,
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
    const checkoutIdParam = searchParams.get('checkoutId');
    const donationId = searchParams.get('donationId');

    if (!donationId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Get donation record
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: {
        donor: true,
        request: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      );
    }

    const checkoutId = checkoutIdParam || donation.paymentIntentId;

    if (!checkoutId) {
      return NextResponse.json(
        { error: 'Checkout ID not found for donation' },
        { status: 400 }
      );
    }

    // Get payment details from Yoco
    const paymentDetails = await getYocoPaymentDetails(checkoutId);

    // Update donation status based on payment status
    let status: 'PLEDGED' | 'COMPLETED' | 'REFUNDED' = 'PLEDGED';
    let paymentStatus = 'PENDING';
    
    if (isYocoPaymentSuccessful(paymentDetails.status) && donation.status !== 'COMPLETED') {
      status = 'COMPLETED';
      paymentStatus = 'COMPLETED';
      
      // Update request current amount with the net payout amount.
      await prisma.request.update({
        where: { id: donation.requestId },
        data: {
          currentAmount: {
            increment: donation.amount,
          },
        },
      });
      const totalPaid = typeof paymentDetails.amount === 'number'
        ? paymentDetails.amount / 100
        : Math.round((donation.amount / 0.964) * 100) / 100;
      const feeBreakdown = calculateYocoBreakdown(totalPaid);
      const existingDonationTransaction = await prisma.transaction.findFirst({
        where: {
          paymentId: checkoutId,
          type: 'DONATION',
        },
      });

      if (!existingDonationTransaction) {
        await prisma.transaction.create({
          data: {
            type: 'DONATION',
            status: 'COMPLETED',
            amount: totalPaid,
            feeAmount: feeBreakdown.totalFees,
            netAmount: donation.amount,
            currency: paymentDetails.currency || 'ZAR',
            paymentGateway: 'YOCO',
            paymentId: checkoutId,
            gatewayResponse: JSON.stringify(paymentDetails),
            donorId: donation.donorId,
            donorName: donation.anonymous ? 'Anonymous' : donation.donor.fullName,
            donorEmail: donation.donor.email,
            recipientId: donation.request.userId,
            recipientName: donation.request.user.fullName,
            recipientEmail: donation.request.user.email,
            requestId: donation.requestId,
            requestTitle: donation.request.title,
            completedAt: new Date(),
            gatewayFee: feeBreakdown.processingFee,
            adminNotes: `Yoco donation. Donor paid: R${totalPaid.toFixed(2)}, requester receives: R${donation.amount.toFixed(2)}, Yoco fee: R${feeBreakdown.processingFee.toFixed(2)}, Mishteh fee: R${feeBreakdown.platformFee.toFixed(2)}.`,
          },
        });

        await prisma.transaction.create({
          data: {
            type: 'FEE',
            status: 'COMPLETED',
            amount: feeBreakdown.platformFee,
            feeAmount: 0,
            netAmount: feeBreakdown.platformFee,
            currency: paymentDetails.currency || 'ZAR',
            paymentGateway: 'YOCO',
            paymentId: `${checkoutId}-mishteh-fee`,
            donorId: donation.donorId,
            donorName: donation.donor.fullName,
            donorEmail: donation.donor.email,
            recipientId: donation.request.userId,
            recipientName: donation.request.user.fullName,
            recipientEmail: donation.request.user.email,
            requestId: donation.requestId,
            requestTitle: donation.request.title,
            completedAt: new Date(),
            adminNotes: `Mishteh 1% platform fee on Yoco donation ${checkoutId}.`,
          },
        });
      }
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
