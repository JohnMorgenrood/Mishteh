import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createOrder } from '@/lib/paypal';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, currency } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if ((currency || 'USD') === 'USD' && amount < 5) {
      return NextResponse.json(
        { error: 'PayPal is only available for totals of at least $5.00. Please use Yoco for smaller donations.' },
        { status: 400 }
      );
    }

    // Create PayPal order
    const order = await createOrder(amount, currency || 'USD');

    return NextResponse.json({
      id: order.id,
      status: order.status,
    });
  } catch (error: any) {
    console.error('Error creating PayPal order:', error);
    const details = error?.message || error?.statusCode || error?.name || 'Unknown PayPal error';
    return NextResponse.json(
      { error: details || 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}
