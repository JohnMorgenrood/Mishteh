import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const OWNER_EMAILS = ['mishteh144@gmail.com', 'golearnx@gmail.com'];

// DELETE /api/admin/activity/clear-all - Clear ALL site activity
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || !OWNER_EMAILS.includes(session.user.email || '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete all activities
    await prisma.activity.deleteMany({});

    return NextResponse.json({ success: true, message: 'All activity cleared' });
  } catch (error) {
    console.error('Error clearing all activity:', error);
    return NextResponse.json({ error: 'Failed to clear activity' }, { status: 500 });
  }
}
