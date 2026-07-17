import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireActiveMembership } from '@/lib/membership';
import { moderateSupportiveContent } from '@/lib/content-moderation';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const [received, sent] = await Promise.all([
    prisma.contactDetailRequest.findMany({ where: { recipientId: session.user.id }, include: { requester: { select: { fullName: true, image: true } } }, orderBy: { createdAt: 'desc' }, take: 30 }),
    prisma.contactDetailRequest.findMany({ where: { requesterId: session.user.id }, include: { recipient: { select: { fullName: true, phone: true } } }, orderBy: { createdAt: 'desc' }, take: 30 }),
  ]);
  return NextResponse.json({
    received,
    sent: sent.map((item) => ({ ...item, recipient: { fullName: item.recipient.fullName, phone: item.status === 'APPROVED' ? item.recipient.phone : null } })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const inactive = await requireActiveMembership(session.user.id, session.user.userType);
  if (inactive) return NextResponse.json({ error: 'An active MISHTEH membership is required.', membershipRequired: true }, { status: 402 });
  const body = await request.json();
  const recipientId = String(body.recipientId || '');
  const requestId = String(body.requestId || '');
  const message = String(body.message || '').trim();
  if (!recipientId || !requestId || recipientId === session.user.id || message.length < 10 || message.length > 500) return NextResponse.json({ error: 'Write a respectful reason between 10 and 500 characters.' }, { status: 400 });
  const moderation = moderateSupportiveContent(message);
  if (!moderation.allowed) return NextResponse.json({ error: moderation.reason }, { status: 422 });
  const recipient = await prisma.user.findUnique({ where: { id: recipientId }, select: { id: true } });
  if (!recipient) return NextResponse.json({ error: 'Recipient not found.' }, { status: 404 });
  const contactRequest = await prisma.contactDetailRequest.upsert({
    where: { requesterId_recipientId_requestId: { requesterId: session.user.id, recipientId, requestId } },
    update: { message, status: 'PENDING', respondedAt: null },
    create: { requesterId: session.user.id, recipientId, requestId, message },
  });
  await prisma.notification.create({ data: { userId: recipientId, title: 'Contact details requested', message: `${session.user.name || 'A MISHTEH member'} is asking if you are willing to share your phone number: “${message.slice(0, 140)}”`, type: 'CONTACT_REQUEST', link: '/dashboard#contact-requests' } });
  return NextResponse.json({ message: 'Request sent. Your contact details remain private until they approve.', contactRequest }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const body = await request.json();
  const status = body.status === 'APPROVED' ? 'APPROVED' : body.status === 'DECLINED' ? 'DECLINED' : null;
  if (!status) return NextResponse.json({ error: 'Invalid response.' }, { status: 400 });
  const existing = await prisma.contactDetailRequest.findFirst({ where: { id: String(body.id), recipientId: session.user.id }, include: { recipient: { select: { fullName: true } } } });
  if (!existing) return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
  const updated = await prisma.contactDetailRequest.update({ where: { id: existing.id }, data: { status, respondedAt: new Date() } });
  await prisma.notification.create({ data: { userId: existing.requesterId, title: `Contact request ${status.toLowerCase()}`, message: status === 'APPROVED' ? `${existing.recipient.fullName} approved your request. Their phone number is now visible in your contact requests.` : `${existing.recipient.fullName} chose not to share their contact details.`, type: 'CONTACT_RESPONSE', link: '/dashboard#contact-requests' } });
  return NextResponse.json({ updated });
}
