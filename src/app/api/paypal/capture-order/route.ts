import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { captureOrder, getOrderDetails } from '@/lib/paypal';
import { prisma } from '@/lib/prisma';
import { convertCurrency, Currency } from '@/lib/currency';
import { calculatePayPalBreakdown } from '@/lib/payment-fees';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, requestId, message, anonymous, originalAmount, originalCurrency } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    if (!requestId) return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    // Check again immediately before capture so a request that was suspended
    // after checkout creation cannot receive money.
    const approvedRequest = await prisma.request.findFirst({
      where: {
        id: requestId,
        status: { in: ['ACTIVE', 'PARTIALLY_FUNDED'] },
        donationsEnabled: true,
        user: { isSuspicious: false },
      },
      select: { id: true },
    });
    if (!approvedRequest) return NextResponse.json({ error: 'This request is no longer approved to receive donations.' }, { status: 409 });

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
    const totalAmount = parseFloat(orderDetails.purchase_units[0].amount.value); // Total paid by donor (in USD)
    const currency = orderDetails.purchase_units[0].amount.currency_code;

    // Get payer info
    const payerId = captureResult.payer?.payer_id || null;
    const payerEmail = captureResult.payer?.email_address || null;
    const payerName = captureResult.payer?.name
      ? `${captureResult.payer.name.given_name} ${captureResult.payer.name.surname}`
      : null;

    const localCurrency = (originalCurrency || currency || 'USD') as Currency;
    const grossAmount = originalAmount && typeof originalAmount === 'number'
      ? originalAmount
      : totalAmount;
    const feeBreakdown = calculatePayPalBreakdown(grossAmount, localCurrency);
    const donationAmount = feeBreakdown.netAmount;
    const mishtehFee = feeBreakdown.platformFee;
    const paypalFee = feeBreakdown.processingFee;

    // Get request details if provided
    let request_details = null;
    let recipientId = null;
    let recipientName = null;
    let recipientEmail = null;

    if (requestId) {
      request_details = await prisma.request.findUnique({
        where: { id: requestId },
        include: { user: true },
      });

      if (request_details) {
        recipientId = request_details.userId;
        recipientName = request_details.user.fullName;
        recipientEmail = request_details.user.email;
        
        // Update request's current amount
        await prisma.request.update({
          where: { id: requestId },
          data: {
            currentAmount: {
              increment: donationAmount,
            },
          },
        });
      }
    }

    // Create donation record (stores the donation amount to recipient)
    const donation = await prisma.donation.create({
      data: {
        requestId: requestId || null,
        donorId: session.user.id,
        amount: donationAmount,
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
        amount: grossAmount,
        feeAmount: feeBreakdown.totalFees,
        netAmount: donationAmount,
        currency: localCurrency,
        paymentGateway: 'PAYPAL',
        paymentId: orderId,
        payerId,
        gatewayResponse: JSON.stringify(captureResult),
        gatewayFee: paypalFee,
        donorId: session.user.id,
        donorName: anonymous ? 'Anonymous' : session.user.name || 'Anonymous',
        donorEmail: session.user.email || null,
        recipientId,
        recipientName,
        recipientEmail,
        requestId: requestId || null,
        requestTitle: request_details?.title || null,
        completedAt: new Date(),
      },
    });

    // Create a separate transaction for the Mishteh platform fee (1% revenue for platform)
    await prisma.transaction.create({
      data: {
        type: 'FEE',
        status: 'COMPLETED',
        amount: mishtehFee,
        feeAmount: 0,
        netAmount: mishtehFee,
        currency: localCurrency,
        paymentGateway: 'PAYPAL',
        paymentId: `${orderId}-mishteh-fee`,
        donorId: session.user.id,
        donorName: session.user.name || 'Anonymous',
        donorEmail: session.user.email || null,
        requestId: requestId || null,
        requestTitle: request_details?.title || null,
        completedAt: new Date(),
        adminNotes: `Mishteh 1% platform fee. Donor paid: ${localCurrency} ${grossAmount.toFixed(2)}, PayPal fee: ${localCurrency} ${paypalFee.toFixed(2)}, Mishteh fee: ${localCurrency} ${mishtehFee.toFixed(2)}, requester receives: ${localCurrency} ${donationAmount.toFixed(2)}. PayPal capture total: ${currency} ${totalAmount.toFixed(2)}.`,
      },
    });

    // Send notification to request owner if applicable
    if (request_details && !anonymous) {
      await prisma.notification.create({
        data: {
          userId: request_details.userId,
          type: 'DONATION_RECEIVED',
          title: 'New Donation Received',
          message: `${session.user.name} donated ${localCurrency} ${donationAmount.toFixed(2)} to your request "${request_details.title}"`,
          read: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      donation,
      transaction,
      captureResult,
      fees: {
        paypalFee,
        mishtehFee,
        totalFee: feeBreakdown.totalFees,
        donationAmount,
        totalPaid: grossAmount,
      },
    });
  } catch (error: any) {
    console.error('Error capturing PayPal payment:', error);
    const details = error?.message || error?.statusCode || error?.name || 'Unknown PayPal error';
    return NextResponse.json(
      { error: details || 'Failed to capture PayPal payment' },
      { status: 500 }
    );
  }
}
