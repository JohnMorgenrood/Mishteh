'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { COUNTRY_CODES } from '@/lib/countries';
import FicaUpload from '@/components/FicaUpload';

// Declare Google Maps types
declare global {
  interface Window {
    google: any;
    initAutocomplete: () => void;
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const locationInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'DONOR' as 'DONOR' | 'REQUESTER',
    countryCode: '+27',
    phone: '',
    location: '',
    idNumber: '',
    dateOfBirth: '',
    idDocumentType: 'national_id' as 'national_id' | 'passport' | 'drivers_license',
  });
  
  // FICA documents for REQUESTER users
  const [ficaDocuments, setFicaDocuments] = useState<{
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
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    // Validate phone number
    if (!formData.phone || formData.phone.length < 7) {
      setError('Please enter a valid phone number');
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    // Validate FICA documents for REQUESTER users
    if (formData.userType === 'REQUESTER') {
      if (!ficaDocuments.profilePhoto) {
        setError('Please upload a profile photo');
        return;
      }
      if (!ficaDocuments.idDocument) {
        setError('Please upload your ID document');
        return;
      }
      if (!ficaDocuments.proofOfAddress) {
        setError('Please upload proof of address');
        return;
      }
      if (!ficaDocuments.selfieWithId) {
        setError('Please upload a selfie holding your ID');
        return;
      }
      if (!formData.idNumber) {
        setError('Please enter your ID number');
        return;
      }
      if (!formData.dateOfBirth) {
        setError('Please enter your date of birth');
        return;
      }
    }

    setIsLoading(true);

    try {
      // Create FormData for multipart upload
      const submitData = new FormData();
      submitData.append('fullName', formData.fullName);
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('userType', formData.userType);
      submitData.append('phone', `${formData.countryCode}${formData.phone}`);
      
      if (formData.location) {
        submitData.append('location', formData.location);
      }

      // Add FICA data for REQUESTER users
      if (formData.userType === 'REQUESTER') {
        submitData.append('idNumber', formData.idNumber);
        submitData.append('dateOfBirth', formData.dateOfBirth);
        submitData.append('idDocumentType', formData.idDocumentType);
        
        if (ficaDocuments.profilePhoto) {
          submitData.append('profilePhoto', ficaDocuments.profilePhoto);
        }
        if (ficaDocuments.idDocument) {
          submitData.append('idDocument', ficaDocuments.idDocument);
        }
        if (ficaDocuments.proofOfAddress) {
          submitData.append('proofOfAddress', ficaDocuments.proofOfAddress);
        }
        if (ficaDocuments.selfieWithId) {
          submitData.append('selfieWithId', ficaDocuments.selfieWithId);
        }
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Success - redirect to login
      alert('Registration successful! Please log in.');
      router.push('/auth/login');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <UserPlus className="w-12 h-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join MISHTEH and start making a difference
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'DONOR' })}
                  className={`px-4 py-3 border-2 rounded-md text-sm font-medium transition-colors ${
                    formData.userType === 'DONOR'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Donate & Help
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, userType: 'REQUESTER' })}
                  className={`px-4 py-3 border-2 rounded-md text-sm font-medium transition-colors ${
                    formData.userType === 'REQUESTER'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Request Help
                </button>
              </div>
            </div>

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
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.countryCode}
                  onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  {COUNTRY_CODES.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '') })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="123456789"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location (Optional)
              </label>
              <input
                ref={locationInputRef}
                id="location"
                type="text"
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

            {/* FICA Documents Section - Only for REQUESTER users */}
            {formData.userType === 'REQUESTER' && (
              <>
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Identity Verification (FICA)
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    To comply with regulations and build trust, we need to verify your identity. Please upload the following documents:
                  </p>
                </div>

                <FicaUpload
                  label="Profile Photo"
                  description="A clear photo of yourself for your profile"
                  icon="image"
                  required
                  value={ficaDocuments.profilePhoto}
                  onFileSelect={(file) => setFicaDocuments({ ...ficaDocuments, profilePhoto: file })}
                  acceptedTypes={['image/jpeg', 'image/png', 'image/jpg']}
                />

                <div>
                  <label htmlFor="idDocumentType" className="block text-sm font-medium text-gray-700 mb-1">
                    ID Document Type *
                  </label>
                  <select
                    id="idDocumentType"
                    value={formData.idDocumentType}
                    onChange={(e) => setFormData({ ...formData, idDocumentType: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="national_id">National ID</option>
                    <option value="passport">Passport</option>
                    <option value="drivers_license">Driver's License</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    ID Number *
                  </label>
                  <input
                    id="idNumber"
                    type="text"
                    required={formData.userType === 'REQUESTER'}
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your ID number"
                  />
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    required={formData.userType === 'REQUESTER'}
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <FicaUpload
                  label="ID Document"
                  description="Upload a clear photo of your ID, Passport, or Driver's License"
                  icon="document"
                  required
                  value={ficaDocuments.idDocument}
                  onFileSelect={(file) => setFicaDocuments({ ...ficaDocuments, idDocument: file })}
                />

                <FicaUpload
                  label="Proof of Address"
                  description="Upload a recent utility bill, bank statement, or lease agreement (not older than 3 months)"
                  icon="document"
                  required
                  value={ficaDocuments.proofOfAddress}
                  onFileSelect={(file) => setFicaDocuments({ ...ficaDocuments, proofOfAddress: file })}
                />

                <FicaUpload
                  label="Selfie with ID"
                  description="Take or upload a photo of yourself holding your ID document next to your face"
                  icon="camera"
                  required
                  value={ficaDocuments.selfieWithId}
                  onFileSelect={(file) => setFicaDocuments({ ...ficaDocuments, selfieWithId: file })}
                  acceptedTypes={['image/jpeg', 'image/png', 'image/jpg']}
                />
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              Sign in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
