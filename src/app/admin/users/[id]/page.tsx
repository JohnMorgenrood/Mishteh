'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Shield, FileText, User as UserIcon } from 'lucide-react';

interface UserData {
  id: string;
  fullName: string;
  email: string;
  userType: string;
  phone: string | null;
  location: string | null;
  address: string | null;
  bio: string | null;
  dateOfBirth: string | null;
  idDocumentType: string | null;
  idDocumentUrl: string | null;
  selfieUrl: string | null;
  createdAt: string;
  ficaVerified: boolean;
  image: string | null;
  sponsorType: string | null;
  companyName: string | null;
  industry: string | null;
  managedByAdmin: boolean;
  documents: Array<{ id: string; fileName: string }>;
}

export default function AdminUserDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    address: '',
    bio: '',
    dateOfBirth: '',
    userType: '',
    ficaVerified: false,
    sponsorType: '',
    companyName: '',
    industry: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.userType !== 'ADMIN') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchUser();
    }
  }, [status, session, router, userId]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setFormData({
          fullName: data.user.fullName || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          location: data.user.location || '',
          address: data.user.address || '',
          bio: data.user.bio || '',
          dateOfBirth: data.user.dateOfBirth ? data.user.dateOfBirth.slice(0, 10) : '',
          userType: data.user.userType || '',
          ficaVerified: data.user.ficaVerified || false,
          sponsorType: data.user.sponsorType || '',
          companyName: data.user.companyName || '',
          industry: data.user.industry || '',
        });
      } else {
        setMessage({ type: 'error', text: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setMessage({ type: 'error', text: 'Error loading user data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'User updated successfully!' });
        fetchUser(); // Refresh data
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to update user' });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setMessage({ type: 'error', text: 'Error updating user' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${user?.fullName}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'User deleted successfully!' });
        setTimeout(() => router.push('/admin/users'), 2000);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to delete user' });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setMessage({ type: 'error', text: 'Error deleting user' });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">User not found</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            ← Back to Users
          </button>
        </div>
      </div>
    );
  }

  const approvalMissing = [
    !formData.fullName.trim() && 'full name',
    !user.managedByAdmin && !formData.phone.trim() && 'phone number',
    !formData.location.trim() && 'location',
    !user.managedByAdmin && !formData.bio.trim() && 'bio',
    !user.managedByAdmin && !user.image?.trim() && !user.documents?.length && 'profile photo',
    !user.idDocumentUrl?.trim() && 'ID document',
    !user.selfieUrl?.trim() && 'selfie with ID',
  ].filter(Boolean) as string[];
  const canApprove = approvalMissing.length === 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/admin/users')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
            <p className="text-gray-600 mt-1">Manage user details and permissions</p>
          </div>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          {user.image ? (
            <img
              src={user.image}
              alt={user.fullName}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <UserIcon className="w-10 h-10 text-gray-400" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.fullName}</h2>
            <p className="text-gray-600">{user.managedByAdmin ? 'No login account — managed by MISHTEH' : user.email}</p>
            <p className="text-sm text-gray-500">
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Private verification information - visible to administrators only */}
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-700" />
            <h3 className="font-semibold text-amber-900">Private identity review</h3>
          </div>
          <dl className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
            <div><dt className="font-medium text-gray-600">Physical address</dt><dd className="mt-1 text-gray-900">{user.address || 'Not provided'}</dd></div>
            <div><dt className="font-medium text-gray-600">Date of birth</dt><dd className="mt-1 text-gray-900">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}</dd></div>
            <div className="md:col-span-2"><dt className="font-medium text-gray-600">Bio</dt><dd className="mt-1 whitespace-pre-wrap text-gray-900">{user.bio || 'Not provided'}</dd></div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-3">
            {user.documents?.[0] && (
              <a href={`/api/admin/document-file?id=${user.documents[0].id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-primary-700 shadow-sm">
                <UserIcon className="h-4 w-4" /> Review pending profile photo
              </a>
            )}
            {user.idDocumentUrl ? (
              <a href={`/api/admin/identity-file?userId=${user.id}&kind=id`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-primary-700 shadow-sm">
                <FileText className="h-4 w-4" /> Review ID document
              </a>
            ) : <span className="text-sm text-red-700">ID document missing</span>}
            {user.selfieUrl ? (
              <a href={`/api/admin/identity-file?userId=${user.id}&kind=selfie`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-primary-700 shadow-sm">
                <UserIcon className="h-4 w-4" /> Review selfie with ID
              </a>
            ) : <span className="text-sm text-red-700">Selfie with ID missing</span>}
          </div>
          <p className="mt-4 text-xs text-amber-800">Do not share phone numbers, addresses, dates of birth, or identity files publicly.</p>
        </div>

        {/* Edit Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>

          {/* Email */}
          {!user.managedByAdmin && <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>}

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="No phone"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="No location"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            />
          </div>

          {/* User Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Physical Address</label>
            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="No physical address" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
            <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={4} placeholder="No bio" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600" />
          </div>

          {/* User Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Type
            </label>
            <select
              value={formData.userType}
              onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
            >
              <option value="DONOR">Donor &amp; Requester (Both)</option>
              <option value="REQUESTER">Requester (can also donate)</option>
              <option value="SPONSOR">Sponsor (can donate and request)</option>
              <option value="ADMIN">Admin</option>
            </select>
            <p className="mt-2 text-xs text-gray-500">All community account types can both donate and request help. This selection controls the dashboard emphasis.</p>
          </div>

          {/* FICA Verified */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="ficaVerified"
              checked={formData.ficaVerified}
              onChange={(e) => setFormData({ ...formData, ficaVerified: e.target.checked })}
              disabled={!canApprove && !formData.ficaVerified}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-600"
            />
            <label htmlFor="ficaVerified" className="ml-2 text-sm font-medium text-gray-700">
              FICA Verified
            </label>
            {!canApprove && !formData.ficaVerified && (
              <p className="ml-3 text-xs text-amber-700">Cannot approve yet: {approvalMissing.join(', ')}</p>
            )}
          </div>
        </div>

        {/* Sponsor Fields (if applicable) */}
        {formData.userType === 'SPONSOR' && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sponsor Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sponsor Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sponsor Type
                </label>
                <select
                  value={formData.sponsorType}
                  onChange={(e) => setFormData({ ...formData, sponsorType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                >
                  <option value="">Select Type</option>
                  <option value="BUSINESS">Business</option>
                  <option value="INDIVIDUAL">Individual</option>
                </select>
              </div>

              {/* Company Name */}
              {formData.sponsorType === 'BUSINESS' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Company name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    />
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      placeholder="Industry"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
