import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireActiveMembership } from '@/lib/membership';
import { moderateSupportiveContent } from '@/lib/content-moderation';

const person = { id: true, fullName: true, image: true, phone: true } as const;

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const conversationId = new URL(request.url).searchParams.get('conversationId');
  if (conversationId) {
    const conversation = await prisma.directConversation.findFirst({ where: { id: conversationId, OR: [{ starterId: session.user.id }, { recipientId: session.user.id }] }, include: { starter: { select: person }, recipient: { select: person }, messages: { include: { sender: { select: { id: true, fullName: true, image: true } } }, orderBy: { createdAt: 'asc' }, take: 200 }, offers: { orderBy: { createdAt: 'asc' } } } });
    if (!conversation) return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
    await prisma.directMessage.updateMany({ where: { conversationId, senderId: { not: session.user.id }, readAt: null }, data: { readAt: new Date() } });
    return NextResponse.json({ conversation });
  }
  const conversations = await prisma.directConversation.findMany({ where: { OR: [{ starterId: session.user.id }, { recipientId: session.user.id }] }, include: { starter: { select: person }, recipient: { select: person }, messages: { orderBy: { createdAt: 'desc' }, take: 1 }, _count: { select: { messages: { where: { senderId: { not: session.user.id }, readAt: null } } } } }, orderBy: { updatedAt: 'desc' } });
  return NextResponse.json({ conversations });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const inactive = await requireActiveMembership(session.user.id, session.user.userType);
  if (inactive) return NextResponse.json({ error: 'An active MISHTEH membership is required.', membershipRequired: true }, { status: 402 });
  const body = await request.json();
  const text = String(body.message || '').trim();
  if (!text || text.length > 1000) return NextResponse.json({ error: 'Write a message of up to 1,000 characters.' }, { status: 400 });
  const moderation = moderateSupportiveContent(text);
  if (!moderation.allowed) return NextResponse.json({ error: moderation.reason }, { status: 422 });
  let conversation;
  if (body.conversationId) {
    conversation = await prisma.directConversation.findFirst({ where: { id: String(body.conversationId), OR: [{ starterId: session.user.id }, { recipientId: session.user.id }] } });
  } else {
    const recipientId = String(body.recipientId || '');
    const requestId = body.requestId ? String(body.requestId) : null;
    if (!recipientId || recipientId === session.user.id) return NextResponse.json({ error: 'Recipient not found.' }, { status: 400 });
    conversation = await prisma.directConversation.findFirst({ where: { requestId, OR: [{ starterId: session.user.id, recipientId }, { starterId: recipientId, recipientId: session.user.id }] } });
    if (!conversation) conversation = await prisma.directConversation.create({ data: { starterId: session.user.id, recipientId, requestId } });
  }
  if (!conversation) return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
  const message = await prisma.directMessage.create({ data: { conversationId: conversation.id, senderId: session.user.id, body: text } });
  await prisma.directConversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });
  const otherId = conversation.starterId === session.user.id ? conversation.recipientId : conversation.starterId;
  await prisma.notification.create({ data: { userId: otherId, title: `New message from ${session.user.name || 'a MISHTEH member'}`, message: text.slice(0, 140), type: 'DIRECT_MESSAGE', link: `/messages?conversation=${conversation.id}` } });
  return NextResponse.json({ conversationId: conversation.id, message }, { status: 201 });
}
