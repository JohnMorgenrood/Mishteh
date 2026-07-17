import { prisma } from '@/lib/prisma';

export const MEMBERSHIP_PRICE_ZAR = 10;
export const MEMBERSHIP_TRIAL_DAYS = 7;

export function trialEndFrom(start = new Date()) {
  const end = new Date(start);
  end.setDate(end.getDate() + MEMBERSHIP_TRIAL_DAYS);
  return end;
}

export function membershipEndFrom(start = new Date()) {
  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  return end;
}

export async function getMembershipStatus(userId: string, userType?: string) {
  if (userType === 'ADMIN') {
    return { active: true, status: 'ADMIN', trialEndsAt: null, membershipExpiresAt: null, daysRemaining: null };
  }

  let user = await prisma.user.findUnique({
    where: { id: userId },
    select: { membershipTrialEndsAt: true, membershipExpiresAt: true, createdAt: true, userType: true },
  });
  if (!user) return { active: false, status: 'INACTIVE', trialEndsAt: null, membershipExpiresAt: null, daysRemaining: 0 };
  if (user.userType === 'ADMIN') return { active: true, status: 'ADMIN', trialEndsAt: null, membershipExpiresAt: null, daysRemaining: null };

  if (!user.membershipTrialEndsAt) {
    const membershipTrialEndsAt = trialEndFrom();
    user = await prisma.user.update({
      where: { id: userId },
      data: { membershipTrialEndsAt },
      select: { membershipTrialEndsAt: true, membershipExpiresAt: true, createdAt: true, userType: true },
    });
  }

  const now = new Date();
  const subscribed = Boolean(user.membershipExpiresAt && user.membershipExpiresAt > now);
  const trial = Boolean(user.membershipTrialEndsAt && user.membershipTrialEndsAt > now);
  const endsAt = subscribed ? user.membershipExpiresAt : user.membershipTrialEndsAt;
  return {
    active: subscribed || trial,
    status: subscribed ? 'ACTIVE' : trial ? 'TRIAL' : 'EXPIRED',
    trialEndsAt: user.membershipTrialEndsAt,
    membershipExpiresAt: user.membershipExpiresAt,
    daysRemaining: endsAt ? Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / 86400000)) : 0,
  };
}

export async function requireActiveMembership(userId: string, userType?: string) {
  const status = await getMembershipStatus(userId, userType);
  return status.active ? null : status;
}

export async function createMembershipReminder(userId: string, status: Awaited<ReturnType<typeof getMembershipStatus>>) {
  if (status.status === 'ADMIN' || status.status === 'ACTIVE' && (status.daysRemaining ?? 99) > 3) return;
  if (status.status === 'TRIAL' && (status.daysRemaining ?? 99) > 3) return;
  const since = new Date(Date.now() - 7 * 86400000);
  const existing = await prisma.notification.findFirst({
    where: { userId, type: 'MEMBERSHIP', link: '/membership', createdAt: { gte: since } },
  });
  if (existing) return;
  const expired = status.status === 'EXPIRED';
  await prisma.notification.create({ data: {
    userId,
    type: 'MEMBERSHIP',
    title: expired ? 'Renew your MISHTEH membership' : 'Membership renewal reminder',
    message: expired
      ? 'Your membership has ended. Renew for R10 to keep donating, posting and requesting help.'
      : `Your ${status.status === 'TRIAL' ? 'free trial' : 'membership'} ends in ${status.daysRemaining} day${status.daysRemaining === 1 ? '' : 's'}.`,
    link: '/membership',
  } });
}
