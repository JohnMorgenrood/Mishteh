import Link from 'next/link';
import { Heart, Users, Shield, TrendingUp, Award, Globe } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">About MISHTEH</h1>
          <p className="text-xl max-w-3xl mx-auto opacity-90">
            Connecting compassionate donors with people in need, one story at a time
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission Statement */}
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12 mb-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Mission</h2>
            <p className="text-lg text-gray-700 leading-relaxed text-center mb-8">
              MISHTEH exists to bridge the gap between those who want to help and those who need help. 
              We believe that everyone deserves a chance to overcome life's challenges, and that communities 
              thrive when people support one another.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Compassion</h3>
                <p className="text-gray-600 text-sm">
                  Every person's story matters. We treat each request with dignity and respect.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Trust</h3>
                <p className="text-gray-600 text-sm">
                  We verify requests and maintain transparency to build trust in our community.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
                <p className="text-gray-600 text-sm">
                  Together, we're stronger. We foster connections that change lives.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                MISHTEH was born from a simple observation: there are countless people who want to help others, 
                and countless people who need help, but they often can't find each other. Traditional charity 
                models can be impersonal and bureaucratic, creating barriers between donors and recipients.
              </p>
              <p>
                We created MISHTEH to break down those barriers. Our platform enables direct, transparent, 
                person-to-person giving, where donors can see exactly who they're helping and how their 
                contributions make a difference.
              </p>
              <p>
                Founded in 2025, MISHTEH has grown from a small community project into a nationwide platform 
                connecting thousands of donors with individuals and families facing financial hardships. Every 
                day, we witness the power of human kindness transforming lives.
              </p>
            </div>
          </div>

          <div className="bg-primary-50 rounded-lg p-8 border border-primary-200">
            <h3 className="text-2xl font-bold text-primary-900 mb-6">Impact by Numbers</h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  5K+
                </div>
                <div>
                  <p className="font-semibold text-gray-900">People Helped</p>
                  <p className="text-sm text-gray-600">Individuals and families supported</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  $2M+
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Funds Raised</p>
                  <p className="text-sm text-gray-600">Direct donations to those in need</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  10K+
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Active Donors</p>
                  <p className="text-sm text-gray-600">Generous community members</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  98%
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Satisfaction Rate</p>
                  <p className="text-sm text-gray-600">From both donors and recipients</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How MISHTEH Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Create Request</h3>
              <p className="text-gray-600 text-sm">
                People in need create detailed requests explaining their situation and specific needs.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Verification</h3>
              <p className="text-gray-600 text-sm">
                Our team verifies requests and documents to ensure authenticity and build trust.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Browse & Donate</h3>
              <p className="text-gray-600 text-sm">
                Donors explore requests, choose causes that resonate, and contribute any amount.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Make Impact</h3>
              <p className="text-gray-600 text-sm">
                Funds go directly to those in need, changing lives and strengthening communities.
              </p>
            </div>
          </div>
        </div>

        {/* Why Choose MISHTEH */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose MISHTEH?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <TrendingUp className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Direct Impact</h3>
              <p className="text-gray-600 text-sm">
                100% of donations go directly to recipients. No hidden fees or administrative costs eating into your generosity.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Shield className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Verified Requests</h3>
              <p className="text-gray-600 text-sm">
                Every request is verified by our team. We check documents and validate stories to prevent fraud.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Globe className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Transparent Platform</h3>
              <p className="text-gray-600 text-sm">
                See exactly where your money goes. Track donations and view updates from recipients.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Award className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Secure & Safe</h3>
              <p className="text-gray-600 text-sm">
                Industry-standard encryption protects your personal and financial information at all times.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Users className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Community Driven</h3>
              <p className="text-gray-600 text-sm">
                Built by the community, for the community. Your feedback shapes how we grow and improve.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Heart className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Human-Centered</h3>
              <p className="text-gray-600 text-sm">
                We treat every person with dignity and respect, whether they're giving or receiving help.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Team</h2>
          <p className="text-center text-gray-700 max-w-3xl mx-auto mb-12">
            MISHTEH is powered by a dedicated team of developers, community managers, and volunteers 
            who believe in the power of human connection and mutual aid.
          </p>
          <div className="text-center">
            <Link 
              href="/contact" 
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Get in Touch
            </Link>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-lg shadow-md p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Community</h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Whether you're looking to help others or need assistance yourself, MISHTEH is here for you. 
            Together, we can make a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/register" 
              className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
            >
              Get Started
            </Link>
            <Link 
              href="/requests" 
              className="inline-block bg-white text-primary-600 border-2 border-primary-600 px-8 py-3 rounded-lg hover:bg-primary-50 transition-colors font-semibold"
            >
              Browse Requests
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
