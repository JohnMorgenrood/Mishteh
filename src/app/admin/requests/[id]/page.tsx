'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, User, Edit2, Save } from 'lucide-react';
import { REQUEST_CATEGORIES } from '@/lib/constants';

interface Request {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  location: string;
  targetAmount: number;
  currentAmount: number;
  status: string;
  featured: boolean;
  isAnonymous: boolean;
  createdAt: string;
  user: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    image?: string;
  };
}

export default function AdminRequestReview({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (session?.user?.userType !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    fetchRequest();
  }, [session]);

  const fetchRequest = async () => {
    try {
      const response = await fetch(`/api/requests/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setRequest(data);
        setNewCategory(data.category);
      }
    } catch (error) {
      console.error('Error fetching request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!newCategory || newCategory === request?.category) {
      setIsEditingCategory(false);
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(`/api/admin/requests/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategory }),
      });

      if (response.ok) {
        const data = await response.json();
        setRequest(data.request);
        setIsEditingCategory(false);
        alert('Category updated successfully!');
      } else {
        alert('Failed to update category');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const handleAction = async (action: 'ACTIVE' | 'REJECTED') => {
    const actionText = action === 'ACTIVE' ? 'approve' : 'reject';
    if (!confirm(`Are you sure you want to ${actionText} this request?`)) {
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch(`/api/admin/requests/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      });

      if (response.ok) {
        alert(`Request ${action.toLowerCase()} successfully!`);
        router.push('/admin');
      } else {
        alert('Failed to update request');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      alert('An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleFeatured = async () => {
    setProcessing(true);

    try {
      const response = await fetch(`/api/admin/requests/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !request?.featured }),
      });

      if (response.ok) {
        const data = await response.json();
        setRequest(data.request);
        alert(`Request ${data.request.featured ? 'featured' : 'unfeatured'} successfully!`);
      } else {
        alert('Failed to update request');
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert('An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading request...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Request not found</p>
          <Link href="/admin" className="text-primary-600 hover:underline mt-4 inline-block">
            Back to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/admin"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 bg-primary-50 border-b border-primary-100">
            <h1 className="text-2xl font-bold text-gray-900">Review Request</h1>
            <p className="text-sm text-gray-600 mt-1">
              Status: <span className="font-semibold">{request.status}</span>
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Request Details */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">{request.title}</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  {isEditingCategory ? (
                    <div className="flex items-center gap-2">
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                      >
                        {REQUEST_CATEGORIES.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleUpdateCategory}
                        disabled={processing}
                        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        title="Save"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingCategory(false);
                          setNewCategory(request.category);
                        }}
                        className="px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        title="Cancel"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {REQUEST_CATEGORIES.find(cat => cat.value === request.category)?.label || request.category}
                      </p>
                      <button
                        onClick={() => setIsEditingCategory(true)}
                        className="text-primary-600 hover:text-primary-700"
                        title="Edit Category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {request.category === 'OTHER' && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Needs Recategorization
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Urgency</p>
                  <p className="font-medium text-orange-600">{request.urgency}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{request.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Target Amount</p>
                  <p className="font-medium text-green-600">
                    R {request.targetAmount?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p className="text-gray-800 whitespace-pre-wrap">{request.description}</p>
              </div>
            </div>

            {/* Requester Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Requester Information</h3>
              
              {/* Profile Image/Avatar */}
              <div className="mb-4 flex items-center space-x-4">
                {request.user.image ? (
                  <img
                    src={request.user.image}
                    alt={request.user.fullName}
                    className="h-20 w-20 rounded-full object-cover border-4 border-primary-200 shadow-md"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center border-4 border-primary-200 shadow-md">
                    <User className="h-10 w-10 text-primary-600" />
                  </div>
                )}
                <div>
                  <p className="text-xl font-semibold text-gray-900">{request.user.fullName}</p>
                  <p className="text-sm text-gray-600">{request.user.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {request.user.phone && (
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{request.user.phone}</p>
                  </div>
                )}
                {request.user.location && (
                  <div>
                    <p className="text-sm text-gray-600">User Location</p>
                    <p className="font-medium">{request.user.location}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Featured Toggle */}
            {request.status === 'ACTIVE' && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Settings</h3>
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Featured on Homepage</p>
                    <p className="text-sm text-gray-600">Display this request prominently on the homepage</p>
                  </div>
                  <button
                    onClick={handleToggleFeatured}
                    disabled={processing}
                    className={`px-6 py-2 font-medium rounded-md transition-colors ${
                      request.featured
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {request.featured ? '⭐ Featured' : 'Not Featured'}
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {request.status === 'PENDING' && (
              <div className="border-t pt-6 flex gap-4">
                <button
                  onClick={() => handleAction('ACTIVE')}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Request
                </button>
                <button
                  onClick={() => handleAction('REJECTED')}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
