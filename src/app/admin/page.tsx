'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  totalRequests: number;
  totalDonations: number;
  pendingRequests: number;
  activeRequests: number;
  featuredRequests: number;
  pendingDocuments: number;
}

interface Request {
  id: string;
  title: string;
  category: string;
  urgency: string;
  location: string;
  status: string;
  featured: boolean;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}

interface Document {
  id: string;
  fileName: string;
  fileSize: number;
  documentType: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  request?: {
    id: string;
    title: string;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingRequests, setPendingRequests] = useState<Request[]>([]);
  const [activeRequests, setActiveRequests] = useState<Request[]>([]);
  const [pendingDocuments, setPendingDocuments] = useState<Document[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'featured'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, pendingRes, activeRes, docsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/requests?status=PENDING'),
        fetch('/api/admin/requests?status=ACTIVE'),
        fetch('/api/admin/documents?status=PENDING'),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (pendingRes.ok) setPendingRequests(await pendingRes.json());
      if (activeRes.ok) setActiveRequests(await activeRes.json());
      if (docsRes.ok) setPendingDocuments(await docsRes.json());
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayedRequests = filter === 'pending' 
    ? pendingRequests 
    : filter === 'active'
    ? activeRequests
    : filter === 'featured'
    ? activeRequests.filter((r) => r.featured)
    : [...pendingRequests, ...activeRequests];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage users, verify requests, and approve documents
          </p>
        </div>

        {/* Stats Grid with Clickable Filters */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <button
              onClick={() => setFilter('all')}
              className={`bg-white rounded-lg shadow-md p-4 text-left transition-all ${
                filter === 'all' ? 'ring-2 ring-primary-600 shadow-lg' : 'hover:shadow-lg'
              }`}
            >
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </button>
            
            <button
              onClick={() => setFilter('all')}
              className={`bg-white rounded-lg shadow-md p-4 text-left transition-all ${
                filter === 'all' ? 'ring-2 ring-primary-600 shadow-lg' : 'hover:shadow-lg'
              }`}
            >
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Requests</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalRequests}</p>
            </button>
            
            <button
              onClick={() => setFilter('all')}
              className={`bg-white rounded-lg shadow-md p-4 text-left transition-all ${
                filter === 'all' ? 'ring-2 ring-primary-600 shadow-lg' : 'hover:shadow-lg'
              }`}
            >
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Donations</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalDonations}</p>
            </button>
            
            <button
              onClick={() => setFilter('pending')}
              className={`bg-white rounded-lg shadow-md p-4 text-left transition-all ${
                filter === 'pending' ? 'ring-2 ring-primary-600 shadow-lg' : 'hover:shadow-lg'
              }`}
            >
              <h3 className="text-sm font-medium text-gray-600 mb-2">Pending</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.pendingRequests}</p>
              <p className="text-xs text-gray-500 mt-1">Click to filter</p>
            </button>
            
            <button
              onClick={() => setFilter('active')}
              className={`bg-white rounded-lg shadow-md p-4 text-left transition-all ${
                filter === 'active' ? 'ring-2 ring-primary-600 shadow-lg' : 'hover:shadow-lg'
              }`}
            >
              <h3 className="text-sm font-medium text-gray-600 mb-2">Active</h3>
              <p className="text-3xl font-bold text-green-600">{stats.activeRequests}</p>
              <p className="text-xs text-gray-500 mt-1">Click to filter</p>
            </button>
            
            <button
              onClick={() => setFilter('featured')}
              className={`bg-white rounded-lg shadow-md p-4 text-left transition-all ${
                filter === 'featured' ? 'ring-2 ring-primary-600 shadow-lg' : 'hover:shadow-lg'
              }`}
            >
              <h3 className="text-sm font-medium text-gray-600 mb-2">Featured</h3>
              <p className="text-3xl font-bold text-yellow-600">⭐ {stats.featuredRequests}</p>
              <p className="text-xs text-gray-500 mt-1">Click to filter</p>
            </button>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Docs</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.pendingDocuments}</p>
              <p className="text-xs text-gray-500 mt-1">Review below</p>
            </div>
          </div>
        )}

        {/* Filtered Requests */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {filter === 'all' && `All Requests (${displayedRequests.length})`}
                {filter === 'pending' && `Pending Requests (${displayedRequests.length})`}
                {filter === 'active' && `Active Requests (${displayedRequests.length})`}
                {filter === 'featured' && `⭐ Featured Requests (${displayedRequests.length})`}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {filter !== 'all' && (
                  <button
                    onClick={() => setFilter('all')}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Clear filter
                  </button>
                )}
              </p>
            </div>
          </div>
          <div className="p-6">
            {displayedRequests.length > 0 ? (
              <div className="space-y-4">
                {displayedRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {request.title}
                          </h3>
                          {request.featured && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                              ⭐ Featured
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            request.status === 'PENDING' 
                              ? 'bg-orange-100 text-orange-800' 
                              : request.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {request.status}
                          </span>
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
                          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
                        >
                          {request.status === 'PENDING' ? 'Review' : 'Manage'}
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 py-8">
                No {filter === 'all' ? '' : filter} requests found
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
                  <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
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
                          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
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
