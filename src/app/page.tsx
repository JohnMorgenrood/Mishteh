import Link from 'next/link';
import { ArrowRight, Heart, Shield, Users, Sparkles } from 'lucide-react';
import SocialCard from '@/components/SocialCard';
import HeroSlider from '@/components/HeroSlider';
import ActivityFeed from '@/components/ActivityFeed';
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
            image: true,
            instagramUrl: true,
            facebookUrl: true,
            twitterUrl: true,
          },
        },
        _count: {
          select: {
            donations: true,
            likes: true,
            comments: true,
          },
        },
        likes: {
          select: {
            userId: true,
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
      {/* Hero Slider */}
      <HeroSlider />

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Featured Stories - 2 columns on desktop */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredRequests.map((request, index) => (
                  <SocialCard key={request.id} request={request} index={index} />
                ))}
              </div>
              
              {/* Activity Feed Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <ActivityFeed limit={8} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-soft">
              <Sparkles className="w-12 h-12 text-primary-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">
                No active requests at the moment.
              </p>
              <p className="text-gray-500">
                Check back soon or be the first to share your story!
              </p>
              <Link
                href="/dashboard/requests/new"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                Share Your Story
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-700 text-white py-20 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-4 animate-fade-in-up">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl mb-8 text-primary-100/90">
            Join our community of donors and requesters today. Every act of kindness creates a ripple effect.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/requests"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
            >
              Browse Stories
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
