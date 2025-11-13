import paypal from '@paypal/checkout-server-sdk';

// PayPal environment configuration
function environment() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  const mode = process.env.PAYPAL_MODE || 'sandbox';

  if (mode === 'production') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  } else {
    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
  }
}

// PayPal client
export function paypalClient() {
  return new paypal.core.PayPalHttpClient(environment());
}

// Create an order
export async function createOrder(amount: number, currency: string = 'USD') {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: currency,
          value: amount.toFixed(2),
        },
      },
    ],
  });

  try {
    const response = await paypalClient().execute(request);
    return response.result;
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw error;
  }
}

// Capture an order
export async function captureOrder(orderId: string) {
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const response = await paypalClient().execute(request);
    return response.result;
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    throw error;
  }
}

// Get order details
export async function getOrderDetails(orderId: string) {
  const request = new paypal.orders.OrdersGetRequest(orderId);

  try {
    const response = await paypalClient().execute(request);
    return response.result;
  } catch (error) {
    console.error('Error getting PayPal order details:', error);
    throw error;
  }
}
