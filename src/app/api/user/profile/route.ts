import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const PROFILE_PHOTO_TYPES = ['image/jpeg', 'image/png'];
const ID_DOCUMENT_TYPES = [...PROFILE_PHOTO_TYPES, 'application/pdf'];

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        userType: true,
        phone: true,
        location: true,
        bio: true,
        image: true,
        idDocumentUrl: true,
        idDocumentType: true,
        idNumber: true,
        address: true,
        facebookUrl: true,
        twitterUrl: true,
        instagramUrl: true,
        tiktokUrl: true,
        websiteUrl: true,
        selfieUrl: true,
        dateOfBirth: true,
        ficaVerified: true,
        ficaVerifiedAt: true,
        createdAt: true,
        preferences: true,
        paypalEmail: true,
        paypalVerified: true,
        paypalVerifiedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile with file uploads
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    
    // Extract form fields
    const fullName = formData.get('fullName') as string;
    const phone = formData.get('phone') as string | null;
    const location = formData.get('location') as string | null;
    const bio = formData.get('bio') as string | null;
    const paypalEmail = formData.get('paypalEmail') as string | null;
    const address = formData.get('address') as string | null;
    const facebookUrl = formData.get('facebookUrl') as string | null;
    const twitterUrl = formData.get('twitterUrl') as string | null;
    const instagramUrl = formData.get('instagramUrl') as string | null;
    const tiktokUrl = formData.get('tiktokUrl') as string | null;
    const websiteUrl = formData.get('websiteUrl') as string | null;
    const showDonorNamePublicValue = formData.get('showDonorNamePublic');
    const showDonorNamePublic = showDonorNamePublicValue === 'true';

    // Extract files
    const profilePhoto = formData.get('profilePhoto') as File | null;
    const idDocument = formData.get('idDocument') as File | null;
    const selfieWithId = formData.get('selfieWithId') as File | null;

    // Prepare update data - include all values (allow empty strings to clear fields)
    const updateData: any = {
      fullName: fullName || undefined,
      phone: phone || null,
      location: location || null,
      bio: bio || null,
      paypalEmail: paypalEmail || null,
      address: address || null,
      facebookUrl: facebookUrl || null,
      twitterUrl: twitterUrl || null,
      instagramUrl: instagramUrl || null,
      tiktokUrl: tiktokUrl || null,
      websiteUrl: websiteUrl || null,
    };
    
    // Remove undefined values (keep null to clear fields)
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    // Handle file uploads if provided
    if (profilePhoto || idDocument || selfieWithId) {
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'fica');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const saveFile = async (file: File, prefix: string, allowedTypes: string[]): Promise<string> => {
        if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
          throw new Error('Each upload must be a non-empty file no larger than 5MB');
        }
        if (!allowedTypes.includes(file.type)) {
          throw new Error('Unsupported upload type');
        }
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const timestamp = Date.now();
        const filename = `${prefix}_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);
        return `/uploads/fica/${filename}`;
      };

      if (profilePhoto) {
        updateData.image = await saveFile(profilePhoto, 'profile', PROFILE_PHOTO_TYPES);
      }
      if (idDocument) {
        updateData.idDocumentUrl = await saveFile(idDocument, 'id', ID_DOCUMENT_TYPES);
        // If FICA documents are updated, reset verification status
        updateData.ficaVerified = false;
        updateData.ficaVerifiedAt = null;
      }
      if (selfieWithId) {
        updateData.selfieUrl = await saveFile(selfieWithId, 'selfie', PROFILE_PHOTO_TYPES);
        updateData.ficaVerified = false;
        updateData.ficaVerifiedAt = null;
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        userType: true,
        phone: true,
        location: true,
        bio: true,
        image: true,
        ficaVerified: true,
      },
    });

    if (session.user.userType === 'DONOR' || session.user.userType === 'SPONSOR') {
      await prisma.donorPreference.upsert({
        where: { userId: session.user.id },
        update: {
          showDonorNamePublic,
        },
        create: {
          userId: session.user.id,
          preferredCategories: [],
          preferredLocations: [],
          emailNotifications: true,
          showDonorNamePublic,
        },
      });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}

// PATCH - Update user profile (legacy support for JSON updates)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fullName, phone, location, bio } = body;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        fullName,
        phone,
        location,
        bio,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        userType: true,
        phone: true,
        location: true,
        bio: true,
        image: true,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}
