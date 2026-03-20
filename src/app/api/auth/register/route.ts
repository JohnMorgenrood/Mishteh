import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { getClientIP, getGeoLocation, logSecurityEvent, checkSuspiciousActivity, getUserAgent, updateUserSecurityInfo } from '@/lib/security';
import { validateEmail } from '@/lib/email-validation';

export async function POST(request: NextRequest) {
  try {
    // Capture security info FIRST
    const ip = getClientIP(request);
    const userAgent = getUserAgent(request);
    const geoLocation = await getGeoLocation(ip);
    
    const formData = await request.formData();
    
    // Extract form fields
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const userType = formData.get('userType') as string;
    const phone = formData.get('phone') as string | null;
    const location = formData.get('location') as string | null;
    
    // Extract sponsor-specific fields
    const sponsorType = formData.get('sponsorType') as string | null;
    const companyName = formData.get('companyName') as string | null;
    const industry = formData.get('industry') as string | null;
    
    // FICA fields for REQUESTER users
    const idNumber = formData.get('idNumber') as string | null;
    const dateOfBirth = formData.get('dateOfBirth') as string | null;
    const idDocumentType = formData.get('idDocumentType') as string | null;
    
    // Validate required fields
    if (!fullName || !email || !password || !userType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate location is required
    if (!location || location.trim() === '') {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Block fake/disposable emails
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      // Log attempted fake email signup
      await logSecurityEvent(
        'SUSPICIOUS_ACTIVITY',
        null,
        email,
        ip,
        geoLocation,
        userAgent,
        `Blocked fake email signup attempt: ${emailValidation.reason}`
      );
      return NextResponse.json(
        { error: emailValidation.reason },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check for suspicious activity
    const suspiciousCheck = await checkSuspiciousActivity(email, ip, geoLocation);

    // Create new user with security tracking
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        userType: userType as any,
        phone,
        location,
        sponsorType: sponsorType as any,
        companyName,
        industry,
        // Security tracking
        signupIp: ip,
        signupCountry: geoLocation.country,
        signupCity: geoLocation.city,
        isSuspicious: suspiciousCheck.suspicious,
        suspiciousReason: suspiciousCheck.reasons.join('; ') || null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        userType: true,
        sponsorType: true,
        companyName: true,
      },
    });

    // Log the security event
    await logSecurityEvent(
      'SIGNUP_CREDENTIALS',
      user.id,
      email,
      ip,
      geoLocation,
      userAgent,
      suspiciousCheck.suspicious ? `SUSPICIOUS: ${suspiciousCheck.reasons.join(', ')}` : 'Normal signup'
    );

    // If user is a donor or sponsor, create default preferences
    if (userType === 'DONOR' || userType === 'SPONSOR') {
      await prisma.donorPreference.create({
        data: {
          userId: user.id,
          preferredCategories: [],
          preferredLocations: [],
          emailNotifications: true,
          showDonorNamePublic: false,
        },
      });
    }

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
