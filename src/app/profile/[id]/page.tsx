import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  User, MapPin, Calendar, Heart, MessageCircle, 
  Instagram, Facebook, Twitter, Globe, ExternalLink,
  HandHeart, TrendingUp
} from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getApproximateLocation } from '@/lib/utils';
import SocialCard from '@/components/SocialCard';

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

async function getUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        image: true,
        bio: true,
        location: true,
        createdAt: true,
        userType: true,
        instagramUrl: true,
        facebookUrl: true,
        twitterUrl: true,
        tiktokUrl: true,
        websiteUrl: true,
        requests: {
          where: {
            status: { in: ['ACTIVE', 'PARTIALLY_FUNDED', 'FUNDED'] },
            isAnonymous: false,
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
                likes: true,
                comments: true,
                donations: true,
              },
            },
            likes: {
              select: { userId: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            requests: true,
            donations: true,
          },
        },
      },
    });

    if (!user) return null;

    // Calculate total likes received
    const totalLikes = await prisma.like.count({
      where: {
        request: {
          userId: userId,
        },
      },
    });

    // Calculate total donations received
    const donationsReceived = await prisma.donation.aggregate({
      where: {
        request: {
          userId: userId,
        },
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    return {
      ...user,
      stats: {
        totalLikes,
        totalStories: user._count.requests,
        donationsReceived: donationsReceived._sum.amount || 0,
        donorCount: donationsReceived._count,
      },
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params;
  const user = await getUserProfile(id);

  if (!user) {
    notFound();
  }

  const socialLinks = [
    { url: user.instagramUrl, icon: Instagram, label: 'Instagram', color: 'bg-pink-100 text-pink-600 hover:bg-pink-200' },
    { url: user.facebookUrl, icon: Facebook, label: 'Facebook', color: 'bg-blue-100 text-blue-600 hover:bg-blue-200' },
    { url: user.twitterUrl, icon: Twitter, label: 'X (Twitter)', color: 'bg-sky-100 text-sky-600 hover:bg-sky-200' },
    { url: user.websiteUrl, icon: Globe, label: 'Website', color: 'bg-gray-100 text-gray-600 hover:bg-gray-200' },
  ].filter(link => link.url);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden mb-8">
          {/* Cover gradient */}
          <div className="h-32 bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-600" />
          
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-white ring-4 ring-white shadow-lg">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.fullName}
                    width={128}
                    height={128}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                    <User className="w-16 h-16 text-primary-400" />
                  </div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {user.fullName}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                  {user.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {getApproximateLocation(user.location)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
                
                {user.bio && (
                  <p className="text-gray-600 max-w-2xl">
                    {user.bio}
                  </p>
                )}
              </div>

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-2">
                  {socialLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-3 rounded-full transition-colors ${link.color}`}
                      title={link.label}
                    >
                      <link.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-soft p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{user.stats.totalLikes}</p>
            <p className="text-sm text-gray-500">Total Likes</p>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-2">
              <MessageCircle className="w-5 h-5 text-primary-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{user.stats.totalStories}</p>
            <p className="text-sm text-gray-500">Stories Shared</p>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
              <HandHeart className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{user.stats.donorCount}</p>
            <p className="text-sm text-gray-500">Supporters</p>
          </div>

          <div className="bg-white rounded-xl shadow-soft p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-secondary-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              R{user.stats.donationsReceived.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500">Received</p>
          </div>
        </div>

        {/* User's Stories */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>Stories by {user.fullName.split(' ')[0]}</span>
            <span className="text-sm font-normal text-gray-500">
              ({user.requests.length})
            </span>
          </h2>

          {user.requests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.requests.map((request, index) => (
                <SocialCard 
                  key={request.id} 
                  request={request}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                {user.fullName.split(' ')[0]} hasn&apos;t shared any stories yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
