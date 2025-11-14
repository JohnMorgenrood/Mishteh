# Google Services Setup Guide

This guide explains how to set up Google OAuth (for "Sign in with Google") and Google Maps API (for address autocomplete).

## Google OAuth Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "MISHTEH")
4. Click "Create"

### 2. Enable OAuth Consent Screen

1. Navigate to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type
3. Fill in required fields:
   - App name: MISHTEH
   - User support email: your email
   - Developer contact: your email
4. Click "Save and Continue"
5. Skip scopes (click "Save and Continue")
6. Skip test users (click "Save and Continue")

### 3. Create OAuth 2.0 Credentials

1. Navigate to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Configure settings:
   - Name: MISHTEH Web Client
   - Authorized JavaScript origins:
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)
5. Click "Create"
6. Copy the **Client ID** and **Client Secret**

### 4. Add to Environment Variables

Add to your `.env.local` file:

```bash
GOOGLE_CLIENT_ID="your-client-id-here.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret-here"
```

## Google Maps API Setup

### 1. Enable Maps JavaScript API

1. In Google Cloud Console, navigate to "APIs & Services" → "Library"
2. Search for "Places API"
3. Click "Enable"

### 2. Create API Key

1. Navigate to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. Click "Restrict Key" (recommended)

### 3. Configure API Key Restrictions

#### Application Restrictions
- Select "HTTP referrers (web sites)"
- Add authorized domains:
  - `localhost:3000/*` (development)
  - `yourdomain.com/*` (production)

#### API Restrictions
- Select "Restrict key"
- Choose "Places API"

### 4. Add to Environment Variables

Add to your `.env.local` file:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-google-maps-api-key-here"
```

## Testing

### Test Google OAuth
1. Restart your Next.js dev server (`npm run dev`)
2. Go to `/auth/login` or `/auth/register`
3. Click "Sign in with Google" / "Sign up with Google"
4. You should see Google's consent screen

### Test Google Maps Autocomplete
1. Go to `/auth/register` as a REQUESTER
2. Or go to `/dashboard/profile` when logged in
3. Click on the "Location" field
4. Start typing an address
5. You should see autocomplete suggestions

## Billing

- **Google OAuth**: Free (unlimited)
- **Google Maps Places API**: 
  - First $200/month free (covers ~28,000 requests)
  - After that: $0.017 per request
  - [Pricing details](https://cloud.google.com/maps-platform/pricing)

## Security Notes

- Never commit `.env.local` to Git
- Use different API keys for development and production
- Restrict API keys to your domains only
- Regularly rotate OAuth secrets in production
- Enable billing alerts in Google Cloud Console

## Troubleshooting

### "Error 403: access_denied"
- Check OAuth consent screen is configured
- Verify redirect URIs match exactly (including protocol)
- Clear browser cookies and try again

### "This API key is not valid"
- Verify API key is correct in `.env.local`
- Check Places API is enabled
- Verify API key restrictions allow your domain

### Autocomplete not working
- Check browser console for errors
- Verify `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set (must start with `NEXT_PUBLIC_`)
- Restart dev server after adding environment variables
- Check billing is enabled (required even for free tier)

## Additional Resources

- [NextAuth.js Google Provider Docs](https://next-auth.js.org/providers/google)
- [Google Maps Places API Docs](https://developers.google.com/maps/documentation/places/web-service)
- [Google Cloud Console](https://console.cloud.google.com/)
