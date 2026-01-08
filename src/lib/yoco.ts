// Yoco Payment Gateway Integration
// Documentation: https://developer.yoco.com/online/resources/integration-docs/

/**
 * Yoco Payment Configuration
 * 
 * Environment Variables Required:
 * - NEXT_PUBLIC_YOCO_PUBLIC_KEY: Public key for client-side integration
 * - YOCO_SECRET_KEY: Secret key for server-side API calls (keep secure!)
 * - YOCO_MODE: 'test' or 'live' (default: 'test')
 */

// Yoco API base URLs
const YOCO_API_BASE = {
  test: 'https://online.yoco.com/v1',
  live: 'https://online.yoco.com/v1',
};

// Get Yoco environment configuration
export function getYocoConfig() {
  const publicKey = process.env.NEXT_PUBLIC_YOCO_PUBLIC_KEY;
  const secretKey = process.env.YOCO_SECRET_KEY;
  const mode = (process.env.YOCO_MODE || 'test') as 'test' | 'live';

  if (!publicKey) {
    console.warn('Yoco public key is not configured');
  }

  if (!secretKey) {
    console.warn('Yoco secret key is not configured');
  }

  return {
    publicKey,
    secretKey,
    mode,
    apiBaseUrl: YOCO_API_BASE[mode],
  };
}

// Yoco payment types
export interface YocoPaymentRequest {
  amount: number; // Amount in cents (e.g., 10000 = R100.00)
  currency: string; // 'ZAR' for South African Rand
  metadata?: {
    requestId?: string;
    donorName?: string;
    donorEmail?: string;
    [key: string]: any;
  };
  cancelUrl?: string;
  successUrl?: string;
  failureUrl?: string;
}

export interface YocoPaymentResponse {
  id: string;
  status: 'created' | 'succeeded' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  metadata?: any;
  createdDate: string;
}

/**
 * Create a Yoco checkout session
 * This generates a payment link that users can be redirected to
 */
export async function createYocoCheckout(
  paymentRequest: YocoPaymentRequest
): Promise<{ checkoutUrl: string; checkoutId: string }> {
  const config = getYocoConfig();

  if (!config.secretKey) {
    throw new Error('Yoco secret key is not configured');
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}/checkouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: paymentRequest.amount,
        currency: paymentRequest.currency || 'ZAR',
        cancelUrl: paymentRequest.cancelUrl,
        successUrl: paymentRequest.successUrl,
        failureUrl: paymentRequest.failureUrl,
        metadata: paymentRequest.metadata,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Yoco checkout creation failed:', error);
      throw new Error(error.message || 'Failed to create Yoco checkout');
    }

    const data = await response.json();
    return {
      checkoutUrl: data.redirectUrl,
      checkoutId: data.id,
    };
  } catch (error) {
    console.error('Error creating Yoco checkout:', error);
    throw error;
  }
}

/**
 * Process a direct Yoco payment using a token
 * (for when you collect card details on your site)
 */
export async function processYocoPayment(
  token: string,
  amount: number,
  currency: string = 'ZAR',
  metadata?: any
): Promise<YocoPaymentResponse> {
  const config = getYocoConfig();

  if (!config.secretKey) {
    throw new Error('Yoco secret key is not configured');
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}/charges`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        amountInCents: amount,
        currency,
        metadata,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Yoco payment processing failed:', error);
      throw new Error(error.message || 'Failed to process Yoco payment');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error processing Yoco payment:', error);
    throw error;
  }
}

/**
 * Get payment details by checkout ID
 */
export async function getYocoPaymentDetails(
  checkoutId: string
): Promise<YocoPaymentResponse> {
  const config = getYocoConfig();

  if (!config.secretKey) {
    throw new Error('Yoco secret key is not configured');
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}/checkouts/${checkoutId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Failed to get Yoco payment details:', error);
      throw new Error(error.message || 'Failed to get payment details');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting Yoco payment details:', error);
    throw error;
  }
}

/**
 * Refund a Yoco payment
 */
export async function refundYocoPayment(
  chargeId: string,
  amount?: number // Optional: partial refund amount in cents
): Promise<any> {
  const config = getYocoConfig();

  if (!config.secretKey) {
    throw new Error('Yoco secret key is not configured');
  }

  try {
    const response = await fetch(`${config.apiBaseUrl}/refunds`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chargeId,
        ...(amount && { amountInCents: amount }),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Yoco refund failed:', error);
      throw new Error(error.message || 'Failed to refund payment');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error refunding Yoco payment:', error);
    throw error;
  }
}

/**
 * Verify webhook signature (for webhook security)
 */
export function verifyYocoWebhook(
  payload: string,
  signature: string,
  webhookSecret: string
): boolean {
  // Yoco uses HMAC SHA256 for webhook signatures
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', webhookSecret);
  const digest = hmac.update(payload).digest('hex');
  return digest === signature;
}
