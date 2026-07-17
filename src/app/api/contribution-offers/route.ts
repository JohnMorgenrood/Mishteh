import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireActiveMembership } from '@/lib/membership';
import { moderateSupportiveContent } from '@/lib/content-moderation';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const inactive = await requireActiveMembership(session.user.id, session.user.userType);
  if (inactive) return NextResponse.json({ error: 'An active MISHTEH membership is required.' }, { status: 402 });
  const body = await request.json(); const requestId = String(body.requestId || ''); const amount = Number(body.amount); const message = String(body.message || '').trim();
  if (!Number.isFinite(amount) || amount < 1 || amount > 1000000) return NextResponse.json({ error: 'Enter an amount between R1 and R1,000,000.' }, { status: 400 });
  if (message) { const moderation = moderateSupportiveContent(message); if (!moderation.allowed) return NextResponse.json({ error: moderation.reason }, { status: 422 }); }
  const helpRequest = await prisma.request.findUnique({ where: { id: requestId }, select: { id: true, userId: true, title: true } });
  if (!helpRequest || helpRequest.userId === session.user.id) return NextResponse.json({ error: 'This offer cannot be created.' }, { status: 400 });
  let conversation = await prisma.directConversation.findFirst({ where: { requestId, OR: [{ starterId: session.user.id, recipientId: helpRequest.userId }, { starterId: helpRequest.userId, recipientId: session.user.id }] } });
  if (!conversation) conversation = await prisma.directConversation.create({ data: { starterId: session.user.id, recipientId: helpRequest.userId, requestId } });
  const offer = await prisma.contributionOffer.create({ data: { conversationId: conversation.id, requestId, supporterId: session.user.id, recipientId: helpRequest.userId, amount, message: message || null } });
  await prisma.directMessage.create({ data: { conversationId: conversation.id, senderId: session.user.id, body: message || `I would like to contribute R${amount.toFixed(2)}.` } });
  await prisma.directConversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date() } });
  await prisma.notification.create({ data: { userId: helpRequest.userId, title: `${session.user.name || 'Someone'} offered R${amount.toFixed(2)}`, message: `Open the conversation to accept or decline this contribution for “${helpRequest.title}”.`, type: 'CONTRIBUTION_OFFER', link: `/messages?conversation=${conversation.id}` } });
  return NextResponse.json({ conversationId: conversation.id, offer }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions); if (!session?.user?.id) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const body = await request.json(); const decision = body.status === 'ACCEPTED' ? 'ACCEPTED' : body.status === 'DECLINED' ? 'DECLINED' : null;
  if (!decision) return NextResponse.json({ error: 'Invalid response.' }, { status: 400 });
  const offer = await prisma.contributionOffer.findFirst({ where: { id: String(body.id), recipientId: session.user.id }, include: { request: { select: { title: true, currentAmount: true, targetAmount: true, status: true } } } });
  if (!offer || offer.status !== 'PENDING') return NextResponse.json({ error: 'This offer was already answered.' }, { status: 409 });
  let donationId: string | null = null;
  if (decision === 'ACCEPTED') {
    const result = await prisma.$transaction(async (tx) => {
      const claimed = await tx.contributionOffer.updateMany({ where: { id: offer.id, status: 'PENDING' }, data: { status: 'ACCEPTED', respondedAt: new Date() } });
      if (!claimed.count) throw new Error('ALREADY_ANSWERED');
      const donation = await tx.donation.create({ data: { donorId: offer.supporterId, requestId: offer.requestId, amount: offer.amount, message: offer.message, status: 'COMPLETED', paymentMethod: 'DIRECT_ARRANGEMENT', paymentStatus: 'CONFIRMED' } });
      await tx.contributionOffer.update({ where: { id: offer.id }, data: { donationId: donation.id } });
      const newTotal = offer.request.currentAmount + offer.amount;
      const requestStatus = offer.request.targetAmount && newTotal >= offer.request.targetAmount ? 'FUNDED' : offer.request.status === 'ACTIVE' ? 'PARTIALLY_FUNDED' : offer.request.status;
      await tx.request.update({ where: { id: offer.requestId }, data: { currentAmount: { increment: offer.amount }, status: requestStatus } });
      return donation;
    }); donationId = result.id;
  } else await prisma.contributionOffer.update({ where: { id: offer.id }, data: { status: 'DECLINED', respondedAt: new Date() } });
  await prisma.directMessage.create({ data: { conversationId: offer.conversationId, senderId: session.user.id, body: decision === 'ACCEPTED' ? `Offer accepted. R${offer.amount.toFixed(2)} has been added to the request.` : `The R${offer.amount.toFixed(2)} offer was declined.` } });
  await prisma.notification.create({ data: { userId: offer.supporterId, title: `Contribution offer ${decision.toLowerCase()}`, message: decision === 'ACCEPTED' ? `Your R${offer.amount.toFixed(2)} contribution to “${offer.request.title}” is now confirmed. You earned Supporter status.` : `Your contribution offer for “${offer.request.title}” was declined.`, type: 'CONTRIBUTION_RESPONSE', link: `/messages?conversation=${offer.conversationId}` } });
  return NextResponse.json({ status: decision, donationId });
}
