'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

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
  createdAt: string;
  user: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
  };
}

export default function AdminRequestReview({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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
      }
    } catch (error) {
      console.error('Error fetching request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'APPROVED' | 'REJECTED') => {
    if (!confirm(`Are you sure you want to ${action.toLowerCase()} this request?`)) {
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
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium">{request.category}</p>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium">{request.user.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{request.user.email}</p>
                </div>
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

            {/* Action Buttons */}
            {request.status === 'PENDING' && (
              <div className="border-t pt-6 flex gap-4">
                <button
                  onClick={() => handleAction('APPROVED')}
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
