import { prisma } from '@/lib/prisma';
import RequestCard from '@/components/RequestCard';
import { Suspense } from 'react';

async function getRequest(id: string) {
  try {
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            location: true,
            bio: true,
          },
        },
        donations: {
          where: {
            anonymous: false,
          },
          select: {
            id: true,
            amount: true,
            message: true,
            createdAt: true,
            donor: {
              select: {
                fullName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            donations: true,
          },
        },
      },
    });

    // Increment view count
    if (request) {
      await prisma.request.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
    }

    return request;
  } catch (error) {
    console.error('Error fetching request:', error);
    return null;
  }
}

export default async function RequestDetailPage({ params }: { params: { id: string } }) {
  const request = await getRequest(params.id);

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Request Not Found</h1>
            <p className="text-gray-600">The request you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = request.targetAmount
    ? Math.min((request.currentAmount / request.targetAmount) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800 mb-2">
                    {request.category.replace('_', ' ')}
                  </span>
                  <h1 className="text-3xl font-bold text-gray-900">{request.title}</h1>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  request.urgency === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                  request.urgency === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                  request.urgency === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {request.urgency}
                </span>
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6 pb-6 border-b">
                <div>
                  <span className="font-semibold">Location:</span> {request.location}
                </div>
                <div>
                  <span className="font-semibold">Posted:</span> {new Date(request.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-semibold">Views:</span> {request.views}
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
              </div>

              {/* Requester Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About the Requester</h2>
                <div>
                  <p className="font-semibold text-gray-900">{request.user.fullName}</p>
                  {request.user.location && (
                    <p className="text-sm text-gray-600">{request.user.location}</p>
                  )}
                  {request.user.bio && (
                    <p className="text-gray-700 mt-2">{request.user.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Donations List */}
            {request.donations.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 mt-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Recent Donations ({request._count.donations})
                </h2>
                <div className="space-y-4">
                  {request.donations.slice(0, 5).map((donation) => (
                    <div key={donation.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-gray-900">{donation.donor.fullName}</p>
                        <span className="text-primary-600 font-semibold">${donation.amount.toFixed(2)}</span>
                      </div>
                      {donation.message && (
                        <p className="text-sm text-gray-600">{donation.message}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Support This Request</h2>
              
              {/* Progress */}
              {request.targetAmount && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-gray-700">
                      ${request.currentAmount.toFixed(2)}
                    </span>
                    <span className="text-gray-500">
                      of ${request.targetAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {progressPercentage.toFixed(1)}% funded
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <a
                  href="/auth/login"
                  className="block w-full px-6 py-3 bg-primary-600 text-white text-center font-semibold rounded-md hover:bg-primary-700 transition-colors"
                >
                  Donate Now
                </a>
                <p className="text-xs text-gray-500 text-center">
                  You must be logged in to donate
                </p>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Total Donations:</span>
                    <span className="font-semibold">{request._count.donations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-semibold capitalize">{request.status.toLowerCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
