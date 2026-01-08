# Yoco Payment Integration Guide

## Overview
The MISHTEH platform now supports both **PayPal** and **Yoco** payment methods for donations. Yoco is a South African payment gateway that supports card payments and Apple Pay.

## Features
- ✅ Card payments (Visa, Mastercard)
- ✅ Apple Pay support
- ✅ Opens in new tab (as per Yoco requirements)
- ✅ ZAR (South African Rand) support
- ✅ Test mode enabled for development

## Environment Variables

Your `.env` file has been updated with the following Yoco credentials:

```env
# Yoco Payments (Test Keys)
NEXT_PUBLIC_YOCO_PUBLIC_KEY="pk_test_8fce2bc2JvYZ1lr8f744"
YOCO_SECRET_KEY="sk_test_041e2f9aQ4oOzEla96b4d49afe15"
YOCO_MODE="test"
```

### Test Card Details
For testing Yoco payments, use:
- **Card Number:** 4111 1111 1111 1111
- **Expiry:** 12/25
- **CVV:** 123

## How It Works

### For Donors
1. Select a request to donate to
2. Choose payment method (PayPal or Yoco)
3. Enter donation amount
4. Click "Pay with Yoco"
5. Payment page opens in new tab
6. Complete payment with card or Apple Pay
7. Redirected to success page

### Payment Flow
```
User selects Yoco → API creates checkout → New tab opens → 
User pays → Yoco processes → Redirects to success/failure page
```

## API Endpoints

### POST `/api/yoco`
Creates a Yoco checkout session for a donation.

**Request Body:**
```json
{
  "amount": 100.00,
  "requestId": "request-uuid",
  "isAnonymous": false
}
```

**Response:**
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.yoco.com/...",
  "donationId": "donation-uuid"
}
```

### GET `/api/yoco?checkoutId=xxx&donationId=xxx`
Verifies a Yoco payment and updates donation status.

## Files Created/Updated

### New Files
- `src/lib/yoco.ts` - Yoco payment functions
- `src/app/api/yoco/route.ts` - Yoco API endpoints
- `src/app/donations/success/page.tsx` - Success page
- `src/app/donations/failed/page.tsx` - Failure page

### Updated Files
- `src/components/DonationForm.tsx` - Added payment method selector
- `.env` - Added Yoco credentials

## Switching to Production

When ready for production:

1. Get production keys from Yoco dashboard
2. Update `.env`:
```env
NEXT_PUBLIC_YOCO_PUBLIC_KEY="pk_live_xxxxx"
YOCO_SECRET_KEY="sk_live_xxxxx"
YOCO_MODE="live"
```

3. Update your URLs in Yoco dashboard:
   - Success URL: `https://yourdomain.com/donations/success`
   - Cancel URL: `https://yourdomain.com/requests/{requestId}?cancelled=true`
   - Failure URL: `https://yourdomain.com/donations/failed`

## Payment Methods Available

### PayPal
- Global payment support
- Multiple currencies (USD, EUR, GBP, ZAR, NGN)
- Credit cards, PayPal balance
- Instant processing

### Yoco
- South Africa focused
- ZAR payments
- Card payments (Visa, Mastercard)
- Apple Pay support
- Opens in new tab

## Testing

### Test Yoco Payment
1. Go to any request page
2. Click "Donate"
3. Select "Yoco" payment method
4. Enter amount (e.g., R100)
5. Click "Pay with Yoco"
6. New tab opens with Yoco checkout
7. Use test card: 4111 1111 1111 1111
8. Complete payment
9. Verify success page shows

### Test PayPal Payment
1. Go to any request page
2. Click "Donate"
3. Select "PayPal" payment method
4. Enter amount
5. Click "Continue to PayPal"
6. Complete PayPal sandbox payment

## Webhooks (Future Enhancement)

For automatic payment verification, you can set up Yoco webhooks:

1. Go to Yoco Dashboard → Developers → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/yoco/webhook`
3. Select events: `payment.succeeded`, `payment.failed`
4. Implement webhook handler in `src/app/api/yoco/webhook/route.ts`

## Troubleshooting

### Yoco checkout not opening
- Check browser popup blocker
- Verify `NEXT_PUBLIC_YOCO_PUBLIC_KEY` is set
- Check console for errors

### Payment not recording
- Verify `YOCO_SECRET_KEY` is set correctly
- Check database connection
- Review API logs

### Apple Pay not showing
- Apple Pay only shows on Safari/iOS
- Requires HTTPS in production
- Domain must be verified with Apple

## Support

- **Yoco Documentation:** https://developer.yoco.com/
- **Yoco Support:** support@yoco.com
- **Test Dashboard:** https://portal.yoco.com/

## Security Notes

⚠️ **Important:**
- Never commit `.env` file to version control
- Keep `YOCO_SECRET_KEY` private
- Use test keys for development
- Validate all payments server-side
- Implement webhook signature verification for production
