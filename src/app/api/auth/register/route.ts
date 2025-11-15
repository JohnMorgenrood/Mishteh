import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const userType = formData.get('userType') as string;
    const phone = formData.get('phone') as string | null;
    const location = formData.get('location') as string | null;
    
    // FICA fields for REQUESTER users
    const idNumber = formData.get('idNumber') as string | null;
    const dateOfBirth = formData.get('dateOfBirth') as string | null;
    const idDocumentType = formData.get('idDocumentType') as string | null;
    const address = formData.get('address') as string | null;
    const facebookUrl = formData.get('facebookUrl') as string | null;
    const twitterUrl = formData.get('twitterUrl') as string | null;
    const instagramUrl = formData.get('instagramUrl') as string | null;
    
    // Validate required fields
    if (!fullName || !email || !password || !userType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Handle file uploads for REQUESTER users
    let profilePhotoUrl = null;
    let idDocumentUrl = null;
    let selfieUrl = null;

    if (userType === 'REQUESTER') {
      const profilePhoto = formData.get('profilePhoto') as File | null;
      const idDocument = formData.get('idDocument') as File | null;
      const selfieWithId = formData.get('selfieWithId') as File | null;

      // Validate required FICA documents
      if (!profilePhoto || !idDocument || !selfieWithId) {
        return NextResponse.json(
          { error: 'Profile photo, ID document, and selfie with ID are required for help seekers' },
          { status: 400 }
        );
      }

      if (!idNumber || !dateOfBirth) {
        return NextResponse.json(
          { error: 'ID number and date of birth are required for help seekers' },
          { status: 400 }
        );
      }

      // Create upload directory
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'fica');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Helper function to save file
      const saveFile = async (file: File, prefix: string): Promise<string> => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const timestamp = Date.now();
        const filename = `${prefix}_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);
        return `/uploads/fica/${filename}`;
      };

      // Save all files
      profilePhotoUrl = await saveFile(profilePhoto, 'profile');
      idDocumentUrl = await saveFile(idDocument, 'id');
      selfieUrl = await saveFile(selfieWithId, 'selfie');
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashedPassword,
        userType: userType as any,
        phone,
        location,
        image: profilePhotoUrl,
        idDocumentUrl,
        idDocumentType,
        idNumber,
        address,
        facebookUrl,
        twitterUrl,
        instagramUrl,
        selfieUrl,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        userType: true,
      },
    });

    // If user is a donor, create default preferences
    if (userType === 'DONOR') {
      await prisma.donorPreference.create({
        data: {
          userId: user.id,
          preferredCategories: [],
          preferredLocations: [],
          emailNotifications: true,
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
