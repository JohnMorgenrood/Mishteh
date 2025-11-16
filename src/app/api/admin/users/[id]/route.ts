import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        userType: true,
        phone: true,
        location: true,
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
  { params }: { params: { id: string } }
) {
  try {
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
      userType,
      ficaVerified,
      sponsorType,
      companyName,
      industry,
    } = body;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        fullName,
        email,
        phone: phone || null,
        location: location || null,
        userType,
        ficaVerified,
        sponsorType: sponsorType || null,
        companyName: companyName || null,
        industry: industry || null,
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete related records first (cascade delete)
    // Delete user's requests
    await prisma.request.deleteMany({
      where: { userId: params.id },
    });

    // Delete user's transactions (donations made by this user or to this user)
    await prisma.transaction.deleteMany({
      where: {
        OR: [
          { donorId: params.id },
          { recipientId: params.id },
        ],
      },
    });

    // Delete user's documents
    await prisma.document.deleteMany({
      where: { userId: params.id },
    });

    // Finally, delete the user
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
