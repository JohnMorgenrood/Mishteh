import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Plus, Heart, FileText, TrendingUp } from 'lucide-react';

async function getDashboardData(userId: string, userType: string) {
  if (userType === 'DONOR') {
    const [donations, totalDonated] = await Promise.all([
      prisma.donation.findMany({
        where: { donorId: userId },
        include: {
          request: {
            select: {
              id: true,
              title: true,
              category: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.donation.aggregate({
        where: { donorId: userId, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    return { donations, totalDonated: totalDonated._sum.amount || 0 };
  } else {
    const [requests, totalReceived] = await Promise.all([
      prisma.request.findMany({
        where: { userId },
        include: {
          _count: {
            select: {
              donations: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.donation.aggregate({
        where: {
          request: {
            userId,
          },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }),
    ]);

    return { requests, totalReceived: totalReceived._sum.amount || 0 };
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const data = await getDashboardData(session.user.id, session.user.userType);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            {session.user.userType === 'DONOR' 
              ? 'View your donations and make a difference'
              : 'Manage your requests and connect with donors'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {session.user.userType === 'DONOR' ? (
            <>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Total Donated</h3>
                  <Heart className="w-5 h-5 text-primary-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${data.totalDonated?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Donations Made</h3>
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {data.donations.length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Lives Impacted</h3>
                  <Heart className="w-5 h-5 text-primary-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {data.donations.length}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Total Received</h3>
                  <Heart className="w-5 h-5 text-primary-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${data.totalReceived.toFixed(2)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Active Requests</h3>
                  <FileText className="w-5 h-5 text-primary-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {data.requests.filter(r => r.status === 'ACTIVE' || r.status === 'PARTIALLY_FUNDED').length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Total Requests</h3>
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {data.requests.length}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {session.user.userType === 'DONOR' ? 'Your Donations' : 'Your Requests'}
              </h2>
              {session.user.userType === 'REQUESTER' && (
                <Link
                  href="/dashboard/requests/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  New Request
                </Link>
              )}
            </div>
          </div>

          <div className="p-6">
            {session.user.userType === 'DONOR' ? (
              <div className="space-y-4">
                {data.donations.length > 0 ? (
                  data.donations.map((donation: any) => (
                    <div key={donation.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Link
                            href={`/requests/${donation.request.id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                          >
                            {donation.request.title}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            {donation.request.category.replace('_', ' ')} • {new Date(donation.createdAt).toLocaleDateString()}
                          </p>
                          {donation.message && (
                            <p className="text-sm text-gray-600 mt-2">{donation.message}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-lg font-bold text-primary-600">
                            ${donation.amount.toFixed(2)}
                          </p>
                          <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${
                            donation.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            donation.status === 'PLEDGED' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {donation.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">You haven't made any donations yet.</p>
                    <Link
                      href="/requests"
                      className="inline-block mt-4 text-primary-600 hover:text-primary-700 font-semibold"
                    >
                      Browse Requests
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {data.requests.length > 0 ? (
                  data.requests.map((request: any) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <Link
                            href={`/requests/${request.id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-primary-600"
                          >
                            {request.title}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            {request.category.replace('_', ' ')} • {request.urgency} • Posted {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600 mt-2">
                            {request._count.donations} donations • ${request.currentAmount.toFixed(2)} raised
                            {request.targetAmount && ` of $${request.targetAmount.toFixed(2)}`}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                            request.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            request.status === 'PARTIALLY_FUNDED' ? 'bg-blue-100 text-blue-800' :
                            request.status === 'FUNDED' ? 'bg-purple-100 text-purple-800' :
                            request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {request.status.replace('_', ' ')}
                          </span>
                          <div className="mt-2 flex gap-2">
                            <Link
                              href={`/dashboard/requests/${request.id}/edit`}
                              className="text-sm text-primary-600 hover:text-primary-700"
                            >
                              Edit
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">You haven't created any requests yet.</p>
                    <Link
                      href="/dashboard/requests/new"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Create Your First Request
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
