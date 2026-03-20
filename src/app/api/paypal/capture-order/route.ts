import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { captureOrder, getOrderDetails } from '@/lib/paypal';
import { prisma } from '@/lib/prisma';
import { convertCurrency, Currency } from '@/lib/currency';

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

    // Calculate fees:
    // PayPal fee: 2.9% + $0.30
    // Mishteh fee: 1% of original donation
    // Total paid = donation + paypal fee + mishteh fee
    // We need to reverse-calculate what the donation amount was
    
    // If original amount was sent from client, use it
    // Otherwise, calculate: donation = (totalAmount - 0.30) / 1.039 (1 + 0.029 + 0.01)
    let donationAmount: number;
    let mishtehFee: number;
    let paypalFee: number;
    
    if (originalAmount && typeof originalAmount === 'number') {
      // Client sent the original donation amount
      donationAmount = originalAmount;
      mishtehFee = donationAmount * 0.01; // 1% Mishteh fee
      paypalFee = totalAmount - donationAmount - mishtehFee; // Remaining is PayPal fee
    } else {
      // Reverse calculate
      donationAmount = (totalAmount - 0.30) / 1.039;
      mishtehFee = donationAmount * 0.01;
      paypalFee = (donationAmount + mishtehFee) * 0.029 + 0.30;
    }

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
        amount: donationAmount, // Amount recipient receives
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
        amount: totalAmount, // Total amount donor paid
        feeAmount: paypalFee + mishtehFee, // Total fees
        netAmount: donationAmount, // Amount recipient receives
        currency,
        paymentGateway: 'PAYPAL',
        paymentId: orderId,
        payerId,
        gatewayResponse: JSON.stringify(captureResult),
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

    // Create a separate transaction for the Mishteh platform fee (1% revenue for platform)
    await prisma.transaction.create({
      data: {
        type: 'FEE',
        status: 'COMPLETED',
        amount: mishtehFee, // Mishteh's 1% revenue
        feeAmount: 0,
        netAmount: mishtehFee, // This goes to Mishteh
        currency,
        paymentGateway: 'PAYPAL',
        paymentId: `${orderId}-mishteh-fee`,
        donorId: session.user.id,
        donorName: session.user.name || 'Anonymous',
        donorEmail: session.user.email || null,
        requestId: requestId || null,
        requestTitle: request_details?.title || null,
        completedAt: new Date(),
        adminNotes: `Mishteh 1% platform fee. Donation: $${donationAmount.toFixed(2)}, PayPal fee: $${paypalFee.toFixed(2)}, Mishteh fee: $${mishtehFee.toFixed(2)}, Total paid: $${totalAmount.toFixed(2)} ${currency}`,
      },
    });

    // Send notification to request owner if applicable
    if (request_details && !anonymous) {
      await prisma.notification.create({
        data: {
          userId: request_details.userId,
          type: 'DONATION_RECEIVED',
          title: 'New Donation Received',
          message: `${session.user.name} donated $${donationAmount.toFixed(2)} ${currency} to your request "${request_details.title}"`,
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
        totalFee: paypalFee + mishtehFee,
        donationAmount,
        totalPaid: totalAmount,
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
