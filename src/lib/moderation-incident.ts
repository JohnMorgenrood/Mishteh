import { prisma } from '@/lib/prisma';

export async function flagModerationIncident(userId: string, reason: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, fullName: true },
  });

  if (!user) return;

  const admins = await prisma.user.findMany({
    where: { userType: 'ADMIN' },
    select: { id: true },
  });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        isSuspicious: true,
        suspiciousReason: `Content moderation: ${reason}`.slice(0, 500),
        ficaVerified: false,
        ficaVerifiedAt: null,
        ficaVerifiedBy: null,
      },
    }),
    prisma.request.updateMany({
      where: { userId, status: { in: ['ACTIVE', 'PARTIALLY_FUNDED'] } },
      data: { status: 'PENDING', verified: false },
    }),
    prisma.securityLog.create({
      data: {
        eventType: 'CONTENT_MODERATION_BLOCK',
        userId,
        email: user.email,
        details: reason.slice(0, 500),
      },
    }),
    ...admins.map((admin) =>
      prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'Urgent content moderation alert',
          message: `${user.fullName} (${user.email}) was blocked and requires review: ${reason}`.slice(0, 1000),
          type: 'SECURITY_ALERT',
          link: `/admin/users/${userId}`,
        },
      })
    ),
  ]);
}
