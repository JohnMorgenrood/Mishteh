import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        userType: true,
        phone: true,
        location: true,
        address: true,
        bio: true,
        dateOfBirth: true,
        idDocumentType: true,
        idDocumentUrl: true,
        selfieUrl: true,
        createdAt: true,
        ficaVerified: true,
        image: true,
        sponsorType: true,
        companyName: true,
        industry: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update a specific user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      location,
      address,
      bio,
      dateOfBirth,
      userType,
      ficaVerified,
      sponsorType,
      companyName,
      industry,
    } = body;

    if (ficaVerified) {
      const existingUser = await prisma.user.findUnique({
        where: { id },
        select: {
          bio: true,
          image: true,
          idDocumentUrl: true,
          selfieUrl: true,
          isSuspicious: true,
        },
      });

      const missing = [
        !fullName?.trim() && 'full name',
        !phone?.trim() && 'phone number',
        !location?.trim() && 'location',
        !bio?.trim() && 'bio',
        !existingUser?.image?.trim() && 'approved profile photo',
        !existingUser?.idDocumentUrl?.trim() && 'ID document',
        !existingUser?.selfieUrl?.trim() && 'selfie with ID',
      ].filter(Boolean);

      if (missing.length > 0 || existingUser?.isSuspicious) {
        return NextResponse.json(
          {
            error: existingUser?.isSuspicious
              ? 'Clear the security flag after completing your review before approving this account.'
              : `Cannot approve yet. Missing: ${missing.join(', ')}`,
          },
          { status: 409 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        email,
        phone: phone || null,
        location: location || null,
        address: address || null,
        bio: bio || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        userType,
        ficaVerified,
        sponsorType: sponsorType || null,
        companyName: companyName || null,
        industry: industry || null,
        ficaVerifiedAt: ficaVerified ? new Date() : null,
        ficaVerifiedBy: ficaVerified ? session.user.email : null,
      },
    });

    return NextResponse.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete a specific user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete related records first (cascade delete)
    // Delete user's requests
    await prisma.request.deleteMany({
      where: { userId: id },
    });

    // Delete user's transactions (donations made by this user or to this user)
    await prisma.transaction.deleteMany({
      where: {
        OR: [
          { donorId: id },
          { recipientId: id },
        ],
      },
    });

    // Delete user's documents
    await prisma.document.deleteMany({
      where: { userId: id },
    });

    // Finally, delete the user
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
