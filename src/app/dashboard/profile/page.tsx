'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Camera, FileText, Home, Shield, Loader, CheckCircle } from 'lucide-react';
import FicaUpload from '@/components/FicaUpload';

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

export default function ProfileSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  
  const [profileData, setProfileData] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    bio: '',
    paypalEmail: '',
  });

  const [files, setFiles] = useState<{
    profilePhoto: File | null;
    idDocument: File | null;
    proofOfAddress: File | null;
    selfieWithId: File | null;
  }>({
    profilePhoto: null,
    idDocument: null,
    proofOfAddress: null,
    selfieWithId: null,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated') {
      fetchProfile();
      loadGoogleMaps();
    }
  }, [status, router]);

  const loadGoogleMaps = () => {
    if (window.google) {
      initAutocomplete();
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key is missing');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initAutocomplete();
    };
    document.head.appendChild(script);
  };

  const initAutocomplete = () => {
    if (!locationInputRef.current || !window.google) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      locationInputRef.current,
      {
        types: ['geocode', 'establishment'],
        fields: ['address_components', 'formatted_address', 'geometry'],
      }
    );

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setFormData(prev => ({ ...prev, location: place.formatted_address }));
      }
    });
  };

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfileData(data.user);
        setFormData({
          fullName: data.user.fullName || '',
          phone: data.user.phone || '',
          location: data.user.location || '',
          bio: data.user.bio || '',
          paypalEmail: data.user.paypalEmail || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const submitData = new FormData();
      submitData.append('fullName', formData.fullName);
      submitData.append('phone', formData.phone);
      submitData.append('location', formData.location);
      submitData.append('bio', formData.bio);
      submitData.append('paypalEmail', formData.paypalEmail);

      if (files.profilePhoto) {
        submitData.append('profilePhoto', files.profilePhoto);
      }
      if (files.idDocument) {
        submitData.append('idDocument', files.idDocument);
      }
      if (files.proofOfAddress) {
        submitData.append('proofOfAddress', files.proofOfAddress);
      }
      if (files.selfieWithId) {
        submitData.append('selfieWithId', files.selfieWithId);
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      fetchProfile(); // Refresh profile data
      
      // Clear file selections
      setFiles({
        profilePhoto: null,
        idDocument: null,
        proofOfAddress: null,
        selfieWithId: null,
      });

      // Reload session to update profile photo in navbar
      window.location.reload();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-soft p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
                <p>{message.text}</p>
              </div>
            </div>
          )}

          {/* FICA Status Banner */}
          {session?.user.userType === 'REQUESTER' && profileData && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                profileData.ficaVerified
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className={`w-5 h-5 ${profileData.ficaVerified ? 'text-green-600' : 'text-yellow-600'}`} />
                <p className={`font-medium ${profileData.ficaVerified ? 'text-green-800' : 'text-yellow-800'}`}>
                  {profileData.ficaVerified
                    ? 'Your identity has been verified ✓'
                    : 'Identity verification pending - An admin will review your documents'}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="City, Country"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>
            </div>

            {/* PayPal Payment Details - Only for REQUESTER users */}
            {session?.user.userType === 'REQUESTER' && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Details</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Add your PayPal email to receive donations directly to your account.
                </p>

                {profileData?.paypalVerified && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      ✓ Your PayPal account has been verified
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="paypalEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    PayPal Email
                  </label>
                  <input
                    id="paypalEmail"
                    type="email"
                    value={formData.paypalEmail}
                    onChange={(e) => setFormData({ ...formData, paypalEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="your-email@example.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This is the email associated with your PayPal account
                  </p>
                </div>

                {!formData.paypalEmail && !profileData?.paypalEmail && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900 font-medium mb-2">
                      Don't have a PayPal account?
                    </p>
                    <p className="text-sm text-blue-800 mb-3">
                      Create a free PayPal account to receive donations securely.
                    </p>
                    <a
                      href="https://www.paypal.com/za/webapps/mpp/account-selection"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create PayPal Account →
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Profile Photo */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Photo</h2>
              
              {profileData?.image && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Current photo:</p>
                  <img
                    src={profileData.image}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary-100"
                  />
                </div>
              )}

              <FicaUpload
                label="Upload New Profile Photo"
                description="A clear photo of yourself for your profile (visible to others)"
                icon="image"
                value={files.profilePhoto}
                onFileSelect={(file) => setFiles({ ...files, profilePhoto: file })}
                acceptedTypes={['image/jpeg', 'image/png', 'image/jpg']}
              />
            </div>

            {/* FICA Documents - Only for REQUESTER users */}
            {session?.user.userType === 'REQUESTER' && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Identity Documents (FICA)</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Update your identity verification documents. Changes will be reviewed by an admin.
                </p>

                <div className="space-y-6">
                  <FicaUpload
                    label="ID Document"
                    description="Upload your National ID, Passport, or Driver's License"
                    icon="document"
                    value={files.idDocument}
                    onFileSelect={(file) => setFiles({ ...files, idDocument: file })}
                  />

                  <FicaUpload
                    label="Proof of Address"
                    description="Utility bill, bank statement, or lease agreement (not older than 3 months)"
                    icon="document"
                    value={files.proofOfAddress}
                    onFileSelect={(file) => setFiles({ ...files, proofOfAddress: file })}
                  />

                  <FicaUpload
                    label="Selfie with ID"
                    description="Photo of yourself holding your ID document next to your face"
                    icon="camera"
                    value={files.selfieWithId}
                    onFileSelect={(file) => setFiles({ ...files, selfieWithId: file })}
                    acceptedTypes={['image/jpeg', 'image/png', 'image/jpg']}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
