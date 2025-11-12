import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getAdminStats() {
  const [totalUsers, totalRequests, totalDonations, pendingRequests, pendingDocuments] = await Promise.all([
    prisma.user.count(),
    prisma.request.count(),
    prisma.donation.count(),
    prisma.request.count({ where: { status: 'PENDING' } }),
    prisma.document.count({ where: { status: 'PENDING' } }),
  ]);

  return {
    totalUsers,
    totalRequests,
    totalDonations,
    pendingRequests,
    pendingDocuments,
  };
}

async function getPendingRequests() {
  return await prisma.request.findMany({
    where: { status: 'PENDING' },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function getActiveRequests() {
  return await prisma.request.findMany({
    where: { status: 'ACTIVE' },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
}

async function getPendingDocuments() {
  return await prisma.document.findMany({
    where: { status: 'PENDING' },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      request: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { uploadedAt: 'desc' },
  });
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.userType !== 'ADMIN') {
    redirect('/dashboard');
  }

  const stats = await getAdminStats();
  const pendingRequests = await getPendingRequests();
  const activeRequests = await getActiveRequests();
  const pendingDocuments = await getPendingDocuments();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage users, verify requests, and approve documents
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Requests</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalRequests}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Donations</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalDonations}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Requests</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.pendingRequests}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Documents</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.pendingDocuments}</p>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Pending Requests ({pendingRequests.length})
            </h2>
          </div>
          <div className="p-6">
            {pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {request.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          By {request.user.fullName} ({request.user.email})
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          {request.category} • {request.urgency} • {request.location}
                        </p>
                      </div>
                      <div className="ml-4 flex gap-2">
                        <Link
                          href={`/admin/requests/${request.id}`}
                          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
                        >
                          Review
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">
                No pending requests to review
              </p>
            )}
          </div>
        </div>

        {/* Active Requests - For Featured Toggle */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Active Requests ({activeRequests.length})
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Click to manage featured status
            </p>
          </div>
          <div className="p-6">
            {activeRequests.length > 0 ? (
              <div className="space-y-4">
                {activeRequests.map((request: any) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.title}
                          </h3>
                          {request.featured && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                              ⭐ Featured
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          By {request.user.fullName} ({request.user.email})
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                          {request.category} • {request.urgency} • {request.location}
                        </p>
                      </div>
                      <div className="ml-4 flex gap-2">
                        <Link
                          href={`/admin/requests/${request.id}`}
                          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
                        >
                          Manage
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">
                No active requests
              </p>
            )}
          </div>
        </div>

        {/* Pending Documents */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Pending Documents ({pendingDocuments.length})
            </h2>
          </div>
          <div className="p-6">
            {pendingDocuments.length > 0 ? (
              <div className="space-y-4">
                {pendingDocuments.map((document) => (
                  <div key={document.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {document.fileName}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Uploaded by {document.user.fullName} ({document.user.email})
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Type: {document.documentType} • Size: {(document.fileSize / 1024).toFixed(2)} KB
                        </p>
                        {document.request && (
                          <p className="text-sm text-gray-600 mt-1">
                            Related to: {document.request.title}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 flex gap-2">
                        <Link
                          href={`/admin/documents/${document.id}`}
                          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700"
                        >
                          Review
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">
                No pending documents to review
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
