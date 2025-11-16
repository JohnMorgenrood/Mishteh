'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, CheckCircle, XCircle, Clock, AlertTriangle, User } from 'lucide-react';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';

interface Request {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  status: string;
  targetAmount: number;
  currentAmount: number;
  location: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    ficaVerified: boolean;
    image?: string;
  };
}

export default function AdminRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.userType !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchRequests();
    }
  }, [status, session, router]);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/admin/requests');
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data.requests || []);
      setFilteredRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...requests];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    // Urgency filter
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter((req) => req.urgency === urgencyFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((req) => req.category === categoryFilter);
    }

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, urgencyFilter, categoryFilter, requests]);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: JSX.Element }> = {
      ACTIVE: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> },
      COMPLETED: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="w-4 h-4" /> },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> },
      REJECTED: { color: 'bg-gray-100 text-gray-800', icon: <XCircle className="w-4 h-4" /> },
    };
    const badge = badges[status] || badges.PENDING;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.icon}
        {status}
      </span>
    );
  };

  const getUrgencyBadge = (urgency: string) => {
    const colors: Record<string, string> = {
      CRITICAL: 'bg-red-500 text-white',
      HIGH: 'bg-orange-500 text-white',
      MEDIUM: 'bg-yellow-500 text-white',
      LOW: 'bg-green-500 text-white',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors[urgency] || colors.MEDIUM}`}>
        <AlertTriangle className="w-3 h-3" />
        {urgency}
      </span>
    );
  };

  const categories = Array.from(new Set(requests.map((r) => r.category)));

  // Calculate stats
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const needsRecategorizationCount = requests.filter(r => r.category === 'OTHER' || r.category === 'CUSTOM').length;
  const criticalCount = requests.filter(r => r.urgency === 'CRITICAL' && r.status === 'ACTIVE').length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Requests</h1>
        <p className="text-gray-600 mt-2">Review and manage all help requests</p>
      </div>

      {/* Action Items Alert */}
      {(pendingCount > 0 || needsRecategorizationCount > 0 || criticalCount > 0) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Action Required</h3>
              <div className="mt-2 text-sm text-yellow-700 space-y-1">
                {pendingCount > 0 && (
                  <p>• <strong>{pendingCount}</strong> request{pendingCount !== 1 ? 's' : ''} awaiting approval</p>
                )}
                {needsRecategorizationCount > 0 && (
                  <p>• <strong>{needsRecategorizationCount}</strong> request{needsRecategorizationCount !== 1 ? 's need' : ' needs'} proper categorization</p>
                )}
                {criticalCount > 0 && (
                  <p>• <strong>{criticalCount}</strong> critical request{criticalCount !== 1 ? 's' : ''} need{criticalCount === 1 ? 's' : ''} attention</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, requester, email, or ID..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Urgency Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Urgencies</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Categories</option>
              <option value="OTHER">⚠️ Needs Recategorization</option>
              <option value="CUSTOM">⚠️ Custom Category</option>
              {categories.filter(cat => cat !== 'OTHER' && cat !== 'CUSTOM').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="lg:col-span-2 flex items-end">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredRequests.length}</span> of{' '}
              <span className="font-semibold">{requests.length}</span> requests
            </p>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urgency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No requests found
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => {
                  const needsRecategorization = request.category === 'OTHER' || request.category === 'CUSTOM';
                  const rowClasses = needsRecategorization 
                    ? 'hover:bg-yellow-50 bg-yellow-50/30 border-l-4 border-yellow-400'
                    : 'hover:bg-gray-50';
                  
                  return (
                  <tr key={request.id} className={rowClasses}>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <Link
                          href={`/requests/${request.id}`}
                          className="font-medium text-primary-600 hover:text-primary-700"
                        >
                          {request.title}
                        </Link>
                        <p className="text-gray-500 text-xs mt-1">
                          {request.description.substring(0, 60)}...
                        </p>
                        <p className="text-gray-400 text-xs mt-1">{request.location}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {/* Profile Image/Avatar */}
                        <div className="flex-shrink-0">
                          {request.user.image ? (
                            <img
                              src={request.user.image}
                              alt={request.user.fullName}
                              className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-200">
                              <User className="h-5 w-5 text-primary-600" />
                            </div>
                          )}
                        </div>
                        {/* User Details */}
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{request.user.fullName}</p>
                          <p className="text-gray-500 text-xs">{request.user.email}</p>
                          {request.user.ficaVerified && (
                            <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              FICA Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {request.category}
                        {needsRecategorization && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                            Needs Category
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <CurrencyDisplay amount={request.currentAmount} />
                        <span className="text-gray-500"> / </span>
                        <CurrencyDisplay amount={request.targetAmount || 0} />
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-primary-600 h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(((request.currentAmount || 0) / (request.targetAmount || 1)) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(request.status)}</td>
                    <td className="px-6 py-4">{getUrgencyBadge(request.urgency)}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/requests/${request.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
