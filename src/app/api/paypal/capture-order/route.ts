import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { captureOrder, getOrderDetails } from '@/lib/paypal';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, requestId, message, anonymous } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Capture the PayPal payment
    const captureResult = await captureOrder(orderId);

    if (captureResult.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment was not completed' },
        { status: 400 }
      );
    }

    // Get order details
    const orderDetails = await getOrderDetails(orderId);
    const amount = parseFloat(orderDetails.purchase_units[0].amount.value);
    const currency = orderDetails.purchase_units[0].amount.currency_code;

    // Get payer info
    const payerId = captureResult.payer?.payer_id || null;
    const payerEmail = captureResult.payer?.email_address || null;
    const payerName = captureResult.payer?.name
      ? `${captureResult.payer.name.given_name} ${captureResult.payer.name.surname}`
      : null;

    // Calculate platform fee (e.g., 2 ZAR + 3%)
    const feeAmount = 2 + (amount * 0.03);
    const netAmount = amount - feeAmount;

    // Get request details if provided
    let request_details = null;
    let recipientId = null;
    let recipientName = null;

    if (requestId) {
      request_details = await prisma.request.findUnique({
        where: { id: requestId },
        include: { user: true },
      });

      if (request_details) {
        recipientId = request_details.userId;
        recipientName = request_details.user.fullName;
      }
    }

    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        requestId: requestId || null,
        donorId: session.user.id,
        amount,
        message: message || null,
        anonymous: anonymous || false,
        paymentMethod: 'PAYPAL',
        paymentStatus: 'COMPLETED',
        status: 'COMPLETED',
      },
    });

    // Create transaction record for the donation
    const transaction = await prisma.transaction.create({
      data: {
        type: 'DONATION',
        status: 'COMPLETED',
        amount,
        feeAmount,
        netAmount,
        currency,
        paymentGateway: 'PAYPAL',
        paymentId: orderId,
        payerId,
        gatewayResponse: captureResult,
        donorId: session.user.id,
        donorName: anonymous ? 'Anonymous' : session.user.name || 'Anonymous',
        donorEmail: session.user.email || null,
        recipientId,
        recipientName,
        requestId: requestId || null,
        requestTitle: request_details?.title || null,
        completedAt: new Date(),
      },
    });

    // Create a separate transaction for the platform fee
    await prisma.transaction.create({
      data: {
        type: 'FEE',
        status: 'COMPLETED',
        amount: feeAmount,
        feeAmount: 0,
        netAmount: feeAmount,
        currency,
        paymentGateway: 'PAYPAL',
        paymentId: `${orderId}-fee`,
        donorId: session.user.id,
        donorName: session.user.name || 'Anonymous',
        donorEmail: session.user.email || null,
        requestId: requestId || null,
        requestTitle: request_details?.title || null,
        completedAt: new Date(),
      },
    });

    // Send notification to request owner if applicable
    if (request_details && !anonymous) {
      await prisma.notification.create({
        data: {
          userId: request_details.userId,
          type: 'DONATION_RECEIVED',
          title: 'New Donation Received',
          message: `${session.user.name} donated $${amount.toFixed(2)} to your request "${request_details.title}"`,
          read: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      donation,
      transaction,
      captureResult,
    });
  } catch (error: any) {
    console.error('Error capturing PayPal payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to capture PayPal payment' },
      { status: 500 }
    );
  }
}
