'use client';

// Updated with comprehensive category system - 80+ categories in 14 groups
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import FileUpload from '@/components/FileUpload';
import { REQUEST_CATEGORY_GROUPS } from '@/lib/constants';

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
  }
}

export default function NewRequestPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const locationInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'FOOD_GROCERIES',
    customCategory: '',
    urgency: 'MEDIUM',
    location: '',
    targetAmount: '',
    isAnonymous: false,
  });
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<Array<{ id: string; fullName: string; email: string; ficaVerified: boolean }>>([]);
  const [beneficiaryUserId, setBeneficiaryUserId] = useState('');

  useEffect(() => {
    if (session?.user?.userType === 'ADMIN') {
      fetch('/api/admin/users?limit=250')
        .then((response) => response.ok ? response.json() : Promise.reject())
        .then((data) => setBeneficiaries((data.users || []).filter((user: any) => user.userType !== 'ADMIN')))
        .catch(() => setError('Unable to load beneficiary accounts.'));
    }
  }, [session]);

  // Load Google Maps API
  useEffect(() => {
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
      script.onerror = () => {
        console.error('Failed to load Google Maps API');
      };
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  const initAutocomplete = () => {
    if (!locationInputRef.current) {
      console.log('Location input ref not ready');
      return;
    }
    
    if (!window.google) {
      console.log('Google Maps not loaded yet');
      return;
    }

    console.log('Initializing autocomplete...');

    try {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        locationInputRef.current,
        {
          types: ['geocode', 'establishment'],
          fields: ['address_components', 'formatted_address', 'geometry'],
        }
      );

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        console.log('Place selected:', place);
        
        if (place.formatted_address) {
          setFormData(prev => ({ ...prev, location: place.formatted_address }));
        }
      });
      
      console.log('Autocomplete initialized successfully');
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.title || !formData.description || !formData.location) {
      setError('Please fill in all required fields (Title, Description, and Location)');
      return;
    }

    if (session?.user?.userType === 'ADMIN' && !beneficiaryUserId) {
      setError('Select the person this request is for.');
      return;
    }

    // Validate custom category if OTHER is selected
    if (formData.category === 'OTHER' && !formData.customCategory.trim()) {
      setError('Please enter a custom category description');
      return;
    }

    // Check if user is logged in
    if (!session?.user) {
      setError('You must be logged in to create a request');
      router.push('/auth/login');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          customCategory: formData.category === 'OTHER' ? formData.customCategory : undefined,
          urgency: formData.urgency,
          location: formData.location,
          targetAmount: formData.targetAmount ? parseFloat(formData.targetAmount) : undefined,
          isAnonymous: formData.isAnonymous,
          beneficiaryUserId: session.user.userType === 'ADMIN' ? beneficiaryUserId : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create request');
      }

      alert('Request created successfully! It will be reviewed by our team.');
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">Please sign in to request help.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{session.user.userType === 'ADMIN' ? 'Create Request on Behalf' : 'Create New Request'}</h1>
          <p className="text-gray-600 mt-2">
            Anyone in our community can need help. Complete the form below and our team will review it before publication.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {session.user.userType === 'ADMIN' && (
                <div className="rounded-lg border border-primary-200 bg-primary-50 p-4">
                  <label htmlFor="beneficiary" className="mb-2 block text-sm font-semibold text-gray-800">Person this request is for *</label>
                  <select
                    id="beneficiary"
                    required
                    value={beneficiaryUserId}
                    onChange={(event) => setBeneficiaryUserId(event.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-2"
                  >
                    <option value="">Select a community member</option>
                    {beneficiaries.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName} ({user.email}){user.ficaVerified ? ' — verified' : ' — verification needed before publishing'}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-gray-600">The request stays private until the person completes identity verification and an admin approves it.</p>
                </div>
              )}
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Request Title *
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g., Help with rent for this month"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  {REQUEST_CATEGORY_GROUPS.map((group) => (
                    <optgroup key={group.group} label={group.group}>
                      {group.categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select the category that best describes your request
                </p>
              </div>

              {/* Custom Category Input - shown when OTHER is selected */}
              {formData.category === 'OTHER' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label htmlFor="customCategory" className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Category *
                  </label>
                  <input
                    id="customCategory"
                    type="text"
                    required
                    value={formData.customCategory}
                    onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your custom category (e.g., 'Art Supplies for Students')"
                  />
                  <p className="text-xs text-blue-600 mt-1">
                    Please describe your specific need in a few words
                  </p>
                </div>
              )}

              {/* Urgency */}
              <div>
                <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency Level *
                </label>
                <select
                  id="urgency"
                  required
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  ref={locationInputRef}
                  id="location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Start typing your address..."
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Start typing to search for your address
                </p>
              </div>

              {/* Target Amount */}
              <div>
                <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount (Optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    id="targetAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Please provide detailed information about your situation and why you need help..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 20 characters. Be honest and specific about your needs.
                </p>
              </div>
            </div>
          </div>

          {/* Document Upload */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Supporting Documents
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              You can submit now without identity documents. Before the request can be published or receive money, you must upload your ID and selfie and pass an admin review.
            </p>
            <FileUpload
              documentType="proof_of_need"
              onUploadSuccess={(doc) => setUploadedDocs([...uploadedDocs, doc])}
            />
            {uploadedDocs.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Uploaded Documents ({uploadedDocs.length})
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {uploadedDocs.map((doc) => (
                    <li key={doc.id}>✓ {doc.fileName}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Privacy Settings
            </h2>
            <div className="flex items-start">
              <input
                id="isAnonymous"
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isAnonymous" className="ml-3">
                <span className="block text-sm font-medium text-gray-900">
                  Post request anonymously
                </span>
                <span className="block text-sm text-gray-600">
                  Your name will not be displayed publicly. Only admins can see your identity.
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Creating Request...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
