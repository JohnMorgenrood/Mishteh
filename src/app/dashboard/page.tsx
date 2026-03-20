import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  Plus,
  Heart,
  FileText,
  TrendingUp,
  ArrowRight,
  Wallet,
  Clock3,
  HandCoins,
  ShieldCheck,
} from 'lucide-react';

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

async function getDashboardData(userId: string, userType: string) {
  if (userType === 'DONOR') {
    const [donations, donationSummary] = await Promise.all([
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
    ]);

    const completedDonations = donations.filter((donation) => donation.status === 'COMPLETED');
    const uniqueRecipients = new Set(
      completedDonations.map((donation) => donation.request.userId)
    ).size;

    return {
      donations,
      totals: {
        totalSent: donationSummary._sum.amount || 0,
        donationCount: donationSummary._count,
        completedCount: completedDonations.length,
        uniqueRecipients,
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
  const fundedRequests = requests.filter((request) => request.status === 'FUNDED').length;

  return {
    requests,
    receivedDonations,
    totals: {
      totalReceived: receivedSummary._sum.amount || 0,
      receivedDonationCount: receivedSummary._count,
      activeRequests: activeRequests.length,
      fundedRequests,
      totalRequests: requests.length,
    },
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const data: any = await getDashboardData(session.user.id, session.user.userType);
  const isDonor = session.user.userType === 'DONOR';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-primary-700 via-primary-600 to-secondary-600 p-8 text-white shadow-soft-lg">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-100">
                {isDonor ? 'Donor Dashboard' : 'Requester Dashboard'}
              </p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                Welcome back, {session.user.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-primary-50 md:text-base">
                {isDonor
                  ? 'Track every gift you have sent, monitor completed support, and see the difference your giving is making.'
                  : 'Monitor money received, track request progress, and stay on top of incoming support from the community.'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link
                href={isDonor ? '/requests' : '/dashboard/requests/new'}
                className="rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-primary-700 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                {isDonor ? 'Browse Requests to Support' : 'Create a New Request'}
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {isDonor ? (
            <>
              <div className="rounded-2xl bg-white p-6 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Total Sent</span>
                  <Wallet className="h-5 w-5 text-primary-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatMoney(data.totals.totalSent)}</p>
                <p className="mt-2 text-sm text-gray-500">Across all donations you have made</p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Completed Gifts</span>
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{data.totals.completedCount}</p>
                <p className="mt-2 text-sm text-gray-500">Successful donations already processed</p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">People Helped</span>
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{data.totals.uniqueRecipients}</p>
                <p className="mt-2 text-sm text-gray-500">Unique recipients you have supported</p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-soft">
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
              <div className="rounded-2xl bg-white p-6 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Total Received</span>
                  <HandCoins className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{formatMoney(data.totals.totalReceived)}</p>
                <p className="mt-2 text-sm text-gray-500">Completed donations received from supporters</p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Incoming Support</span>
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{data.totals.receivedDonationCount}</p>
                <p className="mt-2 text-sm text-gray-500">Completed donations across your requests</p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-soft">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Active Requests</span>
                  <Clock3 className="h-5 w-5 text-amber-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{data.totals.activeRequests}</p>
                <p className="mt-2 text-sm text-gray-500">Requests currently open or under review</p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-soft">
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
                        <div key={donation.id} className="rounded-2xl border border-gray-200 p-5 transition hover:border-primary-200 hover:bg-gray-50/60">
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex-1">
                              <Link
                                href={`/requests/${donation.request.id}`}
                                className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                              >
                                {donation.request.title}
                              </Link>
                              <p className="mt-1 text-sm text-gray-500">
                                Helped {donation.request.user.fullName} • {donation.request.category.replace(/_/g, ' ')} • {new Date(donation.createdAt).toLocaleDateString()}
                              </p>
                              {donation.message && (
                                <p className="mt-3 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                                  {donation.message}
                                </p>
                              )}
                            </div>
                            <div className="min-w-[170px] text-left md:text-right">
                              <p className="text-2xl font-bold text-primary-600">{formatMoney(donation.amount)}</p>
                              <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                donation.status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-700'
                                  : donation.status === 'PLEDGED'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-gray-100 text-gray-700'
                              }`}>
                                {donation.status}
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
                      <Link href="/requests" className="mt-4 inline-flex text-sm font-semibold text-primary-600 hover:text-primary-700">
                        Browse requests <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  )
                ) : data.requests?.length > 0 ? (
                  <div className="space-y-4">
                    {data.requests.map((request: any) => (
                      <div key={request.id} className="rounded-2xl border border-gray-200 p-5 transition hover:border-primary-200 hover:bg-gray-50/60">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="flex-1">
                            <Link
                              href={`/requests/${request.id}`}
                              className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                            >
                              {request.title}
                            </Link>
                            <p className="mt-1 text-sm text-gray-500">
                              {request.category.replace(/_/g, ' ')} • {request.urgency} • Posted {new Date(request.createdAt).toLocaleDateString()}
                            </p>
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
                            <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              request.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-700'
                                : request.status === 'PARTIALLY_FUNDED'
                                  ? 'bg-blue-100 text-blue-700'
                                  : request.status === 'FUNDED'
                                    ? 'bg-purple-100 text-purple-700'
                                    : request.status === 'PENDING'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-gray-100 text-gray-700'
                            }`}>
                              {request.status.replace(/_/g, ' ')}
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
                    ))}
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
            <div className="rounded-2xl bg-white p-6 shadow-soft">
              <h2 className="text-lg font-bold text-gray-900">Dashboard Focus</h2>
              <p className="mt-2 text-sm text-gray-600">
                {isDonor
                  ? 'Your donor dashboard now emphasizes money sent, completed support, and the people you have helped.'
                  : 'Your requester dashboard now emphasizes money received, active requests, and incoming community support.'}
              </p>
            </div>

            {!isDonor && (
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
            )}

            {isDonor && (
              <div className="rounded-2xl bg-white shadow-soft">
                <div className="border-b border-gray-100 px-6 py-5">
                  <h2 className="text-lg font-bold text-gray-900">Donor Reminders</h2>
                  <p className="mt-1 text-sm text-gray-500">Privacy and tracking tips for your giving.</p>
                </div>
                <div className="space-y-3 p-6 text-sm text-gray-600">
                  <div className="rounded-xl bg-gray-50 p-4">Donor names remain private by default unless you choose otherwise in profile settings.</div>
                  <div className="rounded-xl bg-gray-50 p-4">Use Yoco for smaller South African payments and PayPal for larger international donations.</div>
                  <div className="rounded-xl bg-gray-50 p-4">Every completed donation now feeds the admin ledger for clearer finance tracking.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
