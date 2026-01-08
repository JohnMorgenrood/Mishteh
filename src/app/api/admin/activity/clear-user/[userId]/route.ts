import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const OWNER_EMAILS = ['mishteh144@gmail.com', 'golearnx@gmail.com'];

// DELETE /api/admin/activity/clear-user/[userId] - Clear all activity for a user
export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !OWNER_EMAILS.includes(session.user.email || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete all activities for this user
    await prisma.activity.deleteMany({
      where: { userId: params.userId },
    });

    // Also delete their likes and comments if desired
    await prisma.like.deleteMany({
      where: { userId: params.userId },
    });

    await prisma.comment.deleteMany({
      where: { userId: params.userId },
    });

    return NextResponse.json({ success: true, message: 'User activity cleared' });
  } catch (error) {
    console.error('Error clearing user activity:', error);
    return NextResponse.json({ error: 'Failed to clear user activity' }, { status: 500 });
  }
}
