import Link from 'next/link';
import { ArrowRight, Heart, Shield, Users } from 'lucide-react';
import RequestCard from '@/components/RequestCard';
import { prisma } from '@/lib/prisma';

// Revalidate every 10 seconds for near-instant featured updates
export const revalidate = 10;

async function getFeaturedRequests() {
  try {
    const requests = await prisma.request.findMany({
      where: {
        status: { in: ['ACTIVE', 'PARTIALLY_FUNDED'] },
        featured: true,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            location: true,
          },
        },
        _count: {
          select: {
            donations: true,
          },
        },
      },
      orderBy: [
        { urgency: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 6,
    });

    return requests;
  } catch (error) {
    console.error('Error fetching requests:', error);
    return [];
  }
}

export default async function HomePage() {
  const featuredRequests = await getFeaturedRequests();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-lavender">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-6xl font-display font-bold mb-6 text-white drop-shadow-lg">
              Together, We Can Make a Difference
            </h1>
            <p className="text-xl mb-10 text-white/90 leading-relaxed">
              MISHTEH connects generous donors with people in need. Every contribution,
              no matter how small, helps change lives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/requests"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-2xl shadow-soft-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                View Requests
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl border-2 border-white/30 hover:bg-white/20 hover:scale-105 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent-mint rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-peach rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How MISHTEH Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform makes it easy to help others or receive support when you need it most.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Create an Account
              </h3>
              <p className="text-gray-600">
                Register as a donor or someone in need. All users are verified for safety.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Heart className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Browse or Create Requests
              </h3>
              <p className="text-gray-600">
                Donors can browse needs, requesters can submit help requests with documentation.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Shield className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Make a Difference
              </h3>
              <p className="text-gray-600">
                Donate securely and track your impact. All donations are verified and transparent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Requests Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Featured Requests
              </h2>
              <p className="text-lg text-gray-600">
                People in need who could use your support right now
              </p>
            </div>
            <Link
              href="/requests"
              className="text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-2"
            >
              View All
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {featuredRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-lg">
                No active requests at the moment. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join our community of donors and requesters today.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
          >
            Register Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
