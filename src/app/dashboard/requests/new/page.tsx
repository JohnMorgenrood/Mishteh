'use client';

// Updated with comprehensive category system - 80+ categories in 14 groups
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import FileUpload from '@/components/FileUpload';
import { REQUEST_CATEGORY_GROUPS } from '@/lib/constants';
import { MapPin } from 'lucide-react';

export default function NewRequestPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'FOOD_GROCERIES',
    urgency: 'MEDIUM',
    location: '',
    targetAmount: '',
    isAnonymous: false,
  });
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Auto-detect location on mount
  useEffect(() => {
    if (!formData.location) {
      detectLocation();
    }
  }, []);

  const detectLocation = async () => {
    setIsDetectingLocation(true);
    try {
      // Try to get user's position with high accuracy
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Use reverse geocoding to get full address
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            
            // Full precise address: Street, Suburb/District, City, State, Country
            const parts = [];
            
            // Add street address if available
            if (data.localityInfo?.administrative) {
              const admin = data.localityInfo.administrative;
              // Try to get street/neighborhood level detail
              const street = admin.find((a: any) => a.order >= 8)?.name;
              if (street) parts.push(street);
            }
            
            // Add suburb/district
            if (data.locality) parts.push(data.locality);
            
            // Add city if different from locality
            if (data.city && data.city !== data.locality) parts.push(data.city);
            
            // Add state/province
            if (data.principalSubdivision) parts.push(data.principalSubdivision);
            
            // Add country
            if (data.countryName) parts.push(data.countryName);
            
            const location = parts.join(', ');
            if (location) {
              setFormData(prev => ({ ...prev, location }));
            }
            setIsDetectingLocation(false);
          },
          (error) => {
            console.log('Location detection declined or unavailable');
            setIsDetectingLocation(false);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      setIsDetectingLocation(false);
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
          urgency: formData.urgency,
          location: formData.location,
          targetAmount: formData.targetAmount ? parseFloat(formData.targetAmount) : undefined,
          isAnonymous: formData.isAnonymous,
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

  if (!session || session.user.userType !== 'REQUESTER') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">Only requesters can create help requests.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Request</h1>
          <p className="text-gray-600 mt-2">
            Fill out the form below to request help from our community of donors.
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
                <div className="relative">
                  <input
                    id="location"
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="City, Country"
                  />
                  {isDetectingLocation && (
                    <div className="absolute right-3 top-2.5">
                      <div className="animate-spin h-5 w-5 border-2 border-primary-600 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                  {!isDetectingLocation && !formData.location && (
                    <button
                      type="button"
                      onClick={detectLocation}
                      className="absolute right-2 top-2 p-1 text-gray-400 hover:text-primary-600 transition-colors"
                      title="Detect my location"
                    >
                      <MapPin className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {isDetectingLocation ? 'Detecting your location...' : 'Location auto-detected or enter manually'}
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
              Upload documents to verify your identity and need. This helps build trust with donors.
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
