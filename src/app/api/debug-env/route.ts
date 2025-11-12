import { NextResponse } from 'next/server';

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || 'NOT SET';
  
  // Mask the password for security
  const maskedUrl = dbUrl.replace(/:([^@]+)@/, ':****@');
  
  return NextResponse.json({
    DATABASE_URL: maskedUrl,
    username: dbUrl.split('://')[1]?.split(':')[0] || 'unknown',
  });
}
