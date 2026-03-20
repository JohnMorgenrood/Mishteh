'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Calendar,
  FileText,
  CreditCard,
  Save
} from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  feeAmount: number;
  netAmount: number;
  currency: string;
  paymentGateway: string | null;
  paymentId: string | null;
  payerId: string | null;
  gatewayResponse: string | null;
  gatewayFee: number | null;
  donorId: string | null;
  donorName: string | null;
  donorEmail: string | null;
  recipientId: string | null;
  recipientName: string | null;
  recipientEmail: string | null;
  requestId: string | null;
  requestTitle: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
  failureReason: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export default function TransactionDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (session?.user?.userType !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user?.userType === 'ADMIN') {
      fetchTransaction();
    }
  }, [session, params.id]);

  const fetchTransaction = async () => {
    try {
      const res = await fetch(`/api/admin/transactions/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setTransaction(data);
        setAdminNotes(data.adminNotes || '');
        setNewStatus(data.status);
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/transactions/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          adminNotes,
          approvedBy: session?.user?.email
        })
      });

      if (res.ok) {
        alert('Transaction updated successfully!');
        fetchTransaction();
      } else {
        alert('Failed to update transaction');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Error updating transaction');
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transaction...</p>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Transaction not found</p>
          <Link href="/admin/accounts" className="text-primary-600 hover:underline mt-4 inline-block">
            Back to Accounts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Link
          href="/admin/accounts"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Accounts
        </Link>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Transaction Details</h1>
              <p className="text-gray-600">ID: {transaction.id}</p>
            </div>
            <span className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl ${
              transaction.status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
              transaction.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' :
              transaction.status === 'FAILED' ? 'bg-red-50 text-red-700' :
              'bg-gray-50 text-gray-700'
            }`}>
              {transaction.status === 'COMPLETED' && <CheckCircle className="w-5 h-5" />}
              {transaction.status === 'FAILED' && <XCircle className="w-5 h-5" />}
              {transaction.status === 'PENDING' && <Clock className="w-5 h-5" />}
              {transaction.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Amount Card */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-primary-600" />
                Financial Details
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Gross Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {transaction.currency} {transaction.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Platform Fee</p>
                  <p className="text-2xl font-bold text-red-600">
                    {transaction.currency} {transaction.feeAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Net Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    {transaction.currency} {transaction.netAmount.toFixed(2)}
                  </p>
                </div>
              </div>
              {transaction.gatewayFee && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600">
                    Gateway Fee: <span className="font-semibold">{transaction.currency} {transaction.gatewayFee.toFixed(2)}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Parties Involved */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-6 h-6 text-primary-600" />
                Parties Involved
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Donor</p>
                  <div className="space-y-1">
                    <p className="text-gray-900">{transaction.donorName || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{transaction.donorEmail || 'N/A'}</p>
                    {transaction.donorId && (
                      <Link href={`/admin/users/${transaction.donorId}`} className="text-sm text-primary-600 hover:underline">
                        View Profile
                      </Link>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Recipient</p>
                  <div className="space-y-1">
                    <p className="text-gray-900">{transaction.recipientName || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{transaction.recipientEmail || 'N/A'}</p>
                    {transaction.recipientId && (
                      <Link href={`/admin/users/${transaction.recipientId}`} className="text-sm text-primary-600 hover:underline">
                        View Profile
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              {transaction.requestTitle && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Associated Request</p>
                  <Link
                    href={`/requests/${transaction.requestId}`}
                    className="text-primary-600 hover:underline font-semibold"
                  >
                    {transaction.requestTitle}
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Trail</h2>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Payer:</span> {transaction.donorName || 'Anonymous'}
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  <span className="font-semibold">Recipient:</span> {transaction.recipientName || 'Platform / Unassigned'}
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  <span className="font-semibold">For:</span> {transaction.requestTitle || 'General platform transaction'}
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  <span className="font-semibold">Gateway Reference:</span> {transaction.paymentId || 'N/A'}
                </p>
                <p className="mt-2 text-sm text-gray-700">
                  <span className="font-semibold">Type:</span> {transaction.type}
                </p>
              </div>
            </div>

            {/* Payment Gateway Info */}
            {transaction.paymentGateway && (
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-primary-600" />
                  Payment Gateway
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Gateway</p>
                    <p className="font-semibold text-gray-900">{transaction.paymentGateway}</p>
                  </div>
                  {transaction.paymentId && (
                    <div>
                      <p className="text-sm text-gray-600">Payment ID</p>
                      <p className="font-mono text-sm text-gray-900">{transaction.paymentId}</p>
                    </div>
                  )}
                  {transaction.payerId && (
                    <div>
                      <p className="text-sm text-gray-600">Payer ID</p>
                      <p className="font-mono text-sm text-gray-900">{transaction.payerId}</p>
                    </div>
                  )}
                  {transaction.gatewayResponse && (
                    <details className="mt-4">
                      <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                        Gateway Response (JSON)
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-50 rounded-xl text-xs overflow-x-auto">
                        {JSON.stringify(JSON.parse(transaction.gatewayResponse), null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timestamps */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary-600" />
                Timeline
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Created</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </p>
                </div>
                {transaction.completedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(transaction.completedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {transaction.approvedAt && (
                  <div>
                    <p className="text-sm text-gray-600">Approved</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(transaction.approvedAt).toLocaleString()}
                    </p>
                    {transaction.approvedBy && (
                      <p className="text-xs text-gray-600 mt-1">By: {transaction.approvedBy}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Admin Actions */}
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary-600" />
                Admin Actions
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
                    placeholder="Add notes about this transaction..."
                  />
                </div>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:scale-105 transition-all disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Failure Reason */}
            {transaction.failureReason && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-red-900 mb-2">Failure Reason</h3>
                <p className="text-sm text-red-700">{transaction.failureReason}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
