import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import {
  ArrowRight,
  Clock3,
  FileText,
  HandCoins,
  Heart,
  Plus,
  ShieldCheck,
  TrendingUp,
  Wallet,
  PlayCircle,
  MessageCircle,
  MapPin,
} from 'lucide-react';
import { authOptions } from '@/lib/auth';
import { formatCurrency } from '@/lib/currency';
import { prisma } from '@/lib/prisma';
import RequesterGratitudePrompt from '@/components/RequesterGratitudePrompt';

function formatMoney(amount: number) {
  return formatCurrency(amount, 'ZAR');
}

function formatLabel(value: string) {
  return value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function getProgress(currentAmount: number, targetAmount?: number | null) {
  if (!targetAmount || targetAmount <= 0) {
    return null;
  }

  return Math.min((currentAmount / targetAmount) * 100, 100);
}

async function getDashboardData(userId: string, userType: string) {
  if (userType === 'DONOR') {
    const [donations, donationSummary, requests] = await Promise.all([
      prisma.donation.findMany({
        where: { donorId: userId },
        include: {
          request: {
            include: {
              user: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
      }),
      prisma.donation.aggregate({
        where: { donorId: userId },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.request.findMany({
        where: { userId },
        select: { id: true, title: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const completedDonations = donations.filter((donation) => donation.status === 'COMPLETED');
    const pendingDonations = donations.filter((donation) => donation.status === 'PLEDGED');
    const uniqueRecipients = new Set(
      completedDonations.map((donation) => donation.request.userId)
    ).size;

    return {
      donations,
      requests,
      totals: {
        totalSent: donationSummary._sum.amount || 0,
        donationCount: donationSummary._count,
        completedCount: completedDonations.length,
        pendingCount: pendingDonations.length,
        uniqueRecipients,
        completedValue: completedDonations.reduce((sum, donation) => sum + donation.amount, 0),
      },
    };
  }

  const [requests, receivedDonations, receivedSummary] = await Promise.all([
    prisma.request.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            donations: true,
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.donation.findMany({
      where: {
        request: {
          userId,
        },
        status: 'COMPLETED',
      },
      include: {
        request: {
          select: {
            id: true,
            title: true,
          },
        },
        donor: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.donation.aggregate({
      where: {
        request: {
          userId,
        },
        status: 'COMPLETED',
      },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  const activeRequests = requests.filter((request) =>
    ['ACTIVE', 'PARTIALLY_FUNDED', 'PENDING'].includes(request.status)
  );
  const completedDonationRequestIds = new Set(receivedDonations.map((donation) => donation.request.id));
  const fundedRequests = requests.filter((request) => request.status === 'FUNDED').length;
  const openGoalAmount = activeRequests.reduce(
    (sum, request) => sum + Math.max((request.targetAmount || 0) - request.currentAmount, 0),
    0
  );
  const gratitudeRequests = requests
    .filter((request) => completedDonationRequestIds.has(request.id) && !request.gratitudePostedAt)
    .map((request) => ({
      id: request.id,
      title: request.title,
      currentAmount: request.currentAmount,
      targetAmount: request.targetAmount,
    }));

  return {
    requests,
    receivedDonations,
    gratitudeRequests,
    totals: {
      totalReceived: receivedSummary._sum.amount || 0,
      receivedDonationCount: receivedSummary._count,
      activeRequests: activeRequests.length,
      fundedRequests,
      totalRequests: requests.length,
      openGoalAmount,
    },
  };
}

async function getRecommendedFeed(userId: string) {
  const [preferences, interactions, requests, videos, comments] = await Promise.all([
    prisma.donorPreference.findUnique({ where: { userId } }),
    prisma.request.findMany({
      where: { OR: [{ likes: { some: { userId } } }, { comments: { some: { userId } } }, { donations: { some: { donorId: userId } } }] },
      select: { category: true, location: true }, take: 30,
    }),
    prisma.request.findMany({
      where: { status: { in: ['ACTIVE', 'PARTIALLY_FUNDED'] } },
      include: { user: { select: { fullName: true, location: true } }, _count: { select: { donations: true, likes: true, comments: true } } },
      orderBy: { createdAt: 'desc' }, take: 30,
    }),
    prisma.communityVideo.findMany({ where: { published: true }, orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }], take: 6 }),
    prisma.comment.findMany({
      where: { request: { status: { in: ['ACTIVE', 'PARTIALLY_FUNDED'] } }, userId: { not: userId } },
      include: { user: { select: { fullName: true } }, request: { select: { id: true, title: true, category: true } } },
      orderBy: { createdAt: 'desc' }, take: 8,
    }),
  ]);

  const categoryInterests = new Set([...(preferences?.preferredCategories || []), ...interactions.map((item) => item.category)]);
  const locationInterests = [...(preferences?.preferredLocations || []), ...interactions.map((item) => item.location)].filter(Boolean).map((item) => item.toLowerCase());
  const scoreRequest = (request: any) => (categoryInterests.has(request.category) ? 5 : 0) + (locationInterests.some((location) => request.location.toLowerCase().includes(location) || location.includes(request.location.toLowerCase())) ? 3 : 0);
  const day = 24 * 60 * 60 * 1000;

  return [
    ...requests.slice().sort((a, b) => scoreRequest(b) - scoreRequest(a)).slice(0, 7).map((request) => ({ kind: 'request', id: request.id, date: request.createdAt, rank: request.createdAt.getTime() + scoreRequest(request) * 7 * day, data: request })),
    ...videos.slice(0, 3).map((video) => ({ kind: 'video', id: video.id, date: video.createdAt, rank: video.createdAt.getTime() + (video.featured ? 3 * day : 0), data: video })),
    ...comments.slice(0, 4).map((comment) => ({ kind: 'comment', id: comment.id, date: comment.createdAt, rank: comment.createdAt.getTime() + (categoryInterests.has(comment.request.category) ? 4 * day : 0), data: comment })),
  ].sort((a, b) => b.rank - a.rank).slice(0, 12);
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const [data, recommendedFeed]: [any, any[]] = await Promise.all([getDashboardData(session.user.id, session.user.userType), getRecommendedFeed(session.user.id)]);
  const isDonor = session.user.userType === 'DONOR';
  const isAdmin = session.user.userType === 'ADMIN';
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl bg-gray-800 p-8 text-white shadow-soft-lg">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-300">
                {isDonor ? 'Donor Dashboard' : isAdmin ? 'Admin Community Dashboard' : 'Requester Dashboard'}
              </p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                Welcome back, {session.user.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-gray-200 md:text-base">
                {isDonor
                  ? 'Track every gift you have sent, monitor completed support, and see the difference your giving is making.'
                  : isAdmin
                    ? 'Support community requests or create a reviewed request on behalf of a verified person.'
                    : 'Monitor money received, track request progress, and stay on top of incoming support from the community.'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Link
                href="/requests"
                className="rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-primary-700 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                Browse Requests to Support
              </Link>
              <Link
                href="/dashboard/requests/new"
                className="rounded-2xl border border-white/30 bg-white/10 px-5 py-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                {isAdmin ? 'Create Request on Behalf' : 'Request Help for Yourself'}
              </Link>
              <Link
                href="/activity"
                className="rounded-2xl border border-white/30 bg-white/10 px-5 py-4 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                Open Community Feed
              </Link>
            </div>
          </div>
        </div>

        {isDonor && data.requests?.length > 0 && (
          <div className="mb-8 rounded-2xl border border-primary-100 bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Your Help Requests</h2>
                <p className="mt-1 text-sm text-gray-500">Donating never prevents you from asking the community for help.</p>
              </div>
              <Link href="/dashboard/requests/new" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600">
                <Plus className="h-4 w-4" /> New Request
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {data.requests.map((request: any) => (
                <div key={request.id} className="flex flex-col gap-2 rounded-xl bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{request.title}</p>
                    <p className="text-xs text-gray-500">Submitted {new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700">{formatLabel(request.status)}</span>
                    <Link href={`/dashboard/requests/${request.id}/edit`} className="text-sm font-semibold text-primary-600">Manage</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <section className="mb-6 rounded-2xl bg-white p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <div><h2 className="text-xl font-bold text-gray-900">For You Today</h2><p className="text-sm text-gray-500">A fresh mix of community stories, inspiring videos, and conversations selected for you.</p></div>
            <Link href="/activity" className="text-sm font-semibold text-primary-600">See all</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendedFeed.map((item) => item.kind === 'request' ? (
              <Link key={`request-${item.id}`} href={`/requests/${item.id}`} className="rounded-xl border border-gray-200 p-4 transition hover:border-primary-300 hover:bg-primary-50/40">
                <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wide text-primary-600">Request</span><span className="text-xs text-gray-400">{new Date(item.date).toLocaleDateString()}</span></div>
                <h3 className="mt-2 line-clamp-2 font-bold text-gray-900">{item.data.title}</h3>
                <p className="mt-2 flex items-center gap-1 text-xs text-gray-500"><MapPin className="h-3.5 w-3.5" />{item.data.location}</p>
                <p className="mt-3 text-xs text-gray-500">{item.data._count.likes} likes · {item.data._count.comments} comments · {item.data._count.donations} gifts</p>
              </Link>
            ) : item.kind === 'video' ? (
              <Link key={`video-${item.id}`} href="/community-videos" className="overflow-hidden rounded-xl border border-gray-200 transition hover:border-red-300">
                <img src={`https://i.ytimg.com/vi/${item.data.youtubeId}/hqdefault.jpg`} alt="" className="aspect-video w-full object-cover" />
                <div className="p-4"><p className="flex items-center gap-1 text-xs font-bold uppercase text-red-600"><PlayCircle className="h-4 w-4" /> Video</p><h3 className="mt-2 line-clamp-2 font-bold text-gray-900">{item.data.title}</h3></div>
              </Link>
            ) : (
              <Link key={`comment-${item.id}`} href={`/requests/${item.data.request.id}`} className="rounded-xl border border-gray-200 p-4 transition hover:border-blue-300 hover:bg-blue-50/30">
                <p className="flex items-center gap-1 text-xs font-bold uppercase text-blue-600"><MessageCircle className="h-4 w-4" /> Community comment</p>
                <p className="mt-3 line-clamp-3 text-sm text-gray-700">“{item.data.content}”</p>
                <p className="mt-3 text-xs text-gray-500">{item.data.user.fullName} on <span className="font-semibold">{item.data.request.title}</span></p>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {isDonor ? (
            <>
              <div className="rounded-xl bg-white p-4 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Total Sent</span>
                  <Wallet className="h-5 w-5 text-primary-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatMoney(data.totals.totalSent)}</p>
                <p className="mt-2 text-sm text-gray-500">Across all donations you have made</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Completed Gifts</span>
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{data.totals.completedCount}</p>
                <p className="mt-2 text-sm text-gray-500">Successful donations already processed</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">People Helped</span>
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{data.totals.uniqueRecipients}</p>
                <p className="mt-2 text-sm text-gray-500">Unique recipients you have supported</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Donations Made</span>
                  <TrendingUp className="h-5 w-5 text-primary-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{data.totals.donationCount}</p>
                <p className="mt-2 text-sm text-gray-500">Including pending and completed donations</p>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-xl bg-white p-4 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Total Received</span>
                  <HandCoins className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatMoney(data.totals.totalReceived)}</p>
                <p className="mt-2 text-sm text-gray-500">Completed donations received from supporters</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Incoming Support</span>
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{data.totals.receivedDonationCount}</p>
                <p className="mt-2 text-sm text-gray-500">Completed donations across your requests</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Active Requests</span>
                  <Clock3 className="h-5 w-5 text-amber-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{data.totals.activeRequests}</p>
                <p className="mt-2 text-sm text-gray-500">Requests currently open or under review</p>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Funded Requests</span>
                  <TrendingUp className="h-5 w-5 text-primary-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{data.totals.fundedRequests}</p>
                <p className="mt-2 text-sm text-gray-500">Requests that reached their funding goal</p>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-3">
          <div className="space-y-8 xl:col-span-2">
            <div className="rounded-2xl bg-white shadow-soft">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {isDonor ? 'Recent Donations' : 'Your Requests'}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {isDonor
                      ? 'A clear view of how much you have sent and where it went.'
                      : 'Track each request, its progress, and community engagement.'}
                  </p>
                </div>
                {!isDonor && (
                  <Link
                    href="/dashboard/requests/new"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700"
                  >
                    <Plus className="h-4 w-4" />
                    New Request
                  </Link>
                )}
              </div>

              <div className="p-6">
                {isDonor ? (
                  data.donations?.length > 0 ? (
                    <div className="space-y-4">
                      {data.donations.map((donation: any) => (
                        <div
                          key={donation.id}
                          className="rounded-2xl border border-gray-200 p-5 transition hover:border-primary-200 hover:bg-gray-50/60"
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex-1">
                              <Link
                                href={`/requests/${donation.request.id}`}
                                className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                              >
                                {donation.request.title}
                              </Link>
                              <p className="mt-1 text-sm text-gray-500">
                                Helped {donation.request.user.fullName} • {formatLabel(donation.request.category)} • {new Date(donation.createdAt).toLocaleDateString()}
                              </p>
                              {donation.message && (
                                <p className="mt-3 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                                  {donation.message}
                                </p>
                              )}
                            </div>
                            <div className="min-w-[170px] text-left md:text-right">
                              <p className="text-2xl font-bold text-primary-600">{formatMoney(donation.amount)}</p>
                              <span
                                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                  donation.status === 'COMPLETED'
                                    ? 'bg-green-100 text-green-700'
                                    : donation.status === 'PLEDGED'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {formatLabel(donation.status)}
                              </span>
                              <p className="mt-2 text-xs text-gray-500">
                                {donation.anonymous ? 'Private donation' : 'Visible donation'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-14 text-center">
                      <Heart className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                      <p className="text-gray-600">You have not made any donations yet.</p>
                      <Link
                        href="/requests"
                        className="mt-4 inline-flex text-sm font-semibold text-primary-600 hover:text-primary-700"
                      >
                        Browse requests <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  )
                ) : data.requests?.length > 0 ? (
                  <div className="space-y-4">
                    {data.requests.map((request: any) => {
                      const progress = getProgress(request.currentAmount, request.targetAmount);

                      return (
                        <div
                          key={request.id}
                          className="rounded-2xl border border-gray-200 p-5 transition hover:border-primary-200 hover:bg-gray-50/60"
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex-1">
                              <Link
                                href={`/requests/${request.id}`}
                                className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                              >
                                {request.title}
                              </Link>
                              <p className="mt-1 text-sm text-gray-500">
                                {formatLabel(request.category)} • {formatLabel(request.urgency)} • Posted {new Date(request.createdAt).toLocaleDateString()}
                              </p>
                              <div className="mt-4">
                                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-500">
                                  <span>Funding progress</span>
                                  <span>{progress !== null ? `${progress.toFixed(0)}% funded` : 'Flexible target'}</span>
                                </div>
                                <div className="h-2 rounded-full bg-gray-100">
                                  <div
                                    className="h-2 rounded-full bg-primary-600 transition-all"
                                    style={{ width: `${progress || 0}%` }}
                                  />
                                </div>
                              </div>
                              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                                  <span className="font-semibold text-gray-900">{request._count.donations}</span> donations
                                </div>
                                <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                                  <span className="font-semibold text-gray-900">{request._count.likes}</span> likes
                                </div>
                                <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                                  <span className="font-semibold text-gray-900">{request._count.comments}</span> comments
                                </div>
                              </div>
                            </div>
                            <div className="min-w-[190px] text-left md:text-right">
                              <p className="text-2xl font-bold text-primary-600">{formatMoney(request.currentAmount)}</p>
                              <p className="mt-1 text-xs text-gray-500">
                                {request.targetAmount ? `of ${formatMoney(request.targetAmount)}` : 'Flexible target'}
                              </p>
                              <span
                                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                  request.status === 'ACTIVE'
                                    ? 'bg-green-100 text-green-700'
                                    : request.status === 'PARTIALLY_FUNDED'
                                      ? 'bg-blue-100 text-blue-700'
                                      : request.status === 'FUNDED'
                                        ? 'bg-purple-100 text-purple-700'
                                        : request.status === 'PENDING'
                                          ? 'bg-amber-100 text-amber-700'
                                          : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {formatLabel(request.status)}
                              </span>
                              <div className="mt-3">
                                <Link
                                  href={`/dashboard/requests/${request.id}/edit`}
                                  className="text-sm font-semibold text-primary-600 hover:text-primary-700"
                                >
                                  Manage request
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-14 text-center">
                    <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                    <p className="text-gray-600">You have not created any requests yet.</p>
                    <Link
                      href="/dashboard/requests/new"
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
                    >
                      <Plus className="h-4 w-4" />
                      Create Your First Request
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {!isDonor && (
              <>
                <RequesterGratitudePrompt requests={data.gratitudeRequests || []} />

              <div className="rounded-2xl bg-white shadow-soft">
                <div className="border-b border-gray-100 px-6 py-5">
                  <h2 className="text-lg font-bold text-gray-900">Recent Support Received</h2>
                  <p className="mt-1 text-sm text-gray-500">Latest completed donations across your requests.</p>
                </div>
                <div className="p-6">
                  {data.receivedDonations?.length > 0 ? (
                    <div className="space-y-4">
                      {data.receivedDonations.map((donation: any) => (
                        <div key={donation.id} className="rounded-2xl border border-gray-200 p-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {donation.anonymous ? 'Private Donor' : donation.donor.fullName}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">{donation.request.title}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-500">{new Date(donation.createdAt).toLocaleDateString()}</span>
                            <span className="text-sm font-bold text-primary-600">{formatMoney(donation.amount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No completed donations received yet.</p>
                  )}
                </div>
              </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
