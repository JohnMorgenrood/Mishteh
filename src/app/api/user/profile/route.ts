import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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
        proofOfAddressUrl: true,
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
    
    // Extract files
    const profilePhoto = formData.get('profilePhoto') as File | null;
    const idDocument = formData.get('idDocument') as File | null;
    const proofOfAddress = formData.get('proofOfAddress') as File | null;
    const selfieWithId = formData.get('selfieWithId') as File | null;

    // Prepare update data
    const updateData: any = {
      fullName,
      phone,
      location,
      bio,
      paypalEmail,
    };

    // Handle file uploads if provided
    if (profilePhoto || idDocument || proofOfAddress || selfieWithId) {
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'fica');
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const saveFile = async (file: File, prefix: string): Promise<string> => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const timestamp = Date.now();
        const filename = `${prefix}_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);
        return `/uploads/fica/${filename}`;
      };

      if (profilePhoto) {
        updateData.image = await saveFile(profilePhoto, 'profile');
      }
      if (idDocument) {
        updateData.idDocumentUrl = await saveFile(idDocument, 'id');
        // If FICA documents are updated, reset verification status
        updateData.ficaVerified = false;
        updateData.ficaVerifiedAt = null;
      }
      if (proofOfAddress) {
        updateData.proofOfAddressUrl = await saveFile(proofOfAddress, 'address');
        updateData.ficaVerified = false;
        updateData.ficaVerifiedAt = null;
      }
      if (selfieWithId) {
        updateData.selfieUrl = await saveFile(selfieWithId, 'selfie');
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
    const { fullName, phone, location, bio, image } = body;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        fullName,
        phone,
        location,
        bio,
        image,
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
