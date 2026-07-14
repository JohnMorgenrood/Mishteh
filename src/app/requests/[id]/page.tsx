import { prisma } from '@/lib/prisma';
import DonationForm from '@/components/DonationForm';
import { CurrencyDisplay, CurrencyProgressBar } from '@/components/CurrencyDisplay';
import { formatShortDate, getApproximateLocation } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { 
  MapPin, Clock, Eye, User, Heart, MessageCircle,
  Share2, Facebook, Twitter, Instagram, Globe, ExternalLink,
  TrendingUp, ArrowLeft
} from 'lucide-react';
import CommentSection from '@/components/CommentSection';
import SocialActions from '@/components/SocialActions';
import TranslateButton from '@/components/TranslateButton';
import { CountryFlag } from '@/components/CountryBadge';

// Dynamic SEO metadata
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  try {
    const request = await prisma.request.findUnique({
      where: { id },
      select: { title: true, description: true, user: { select: { fullName: true } } },
    });
    
    if (!request) {
      return {
        title: 'Request Not Found | MISHTEH',
        description: 'This request could not be found.',
      };
    }
    
    return {
      title: `${request.title} | MISHTEH`,
      description: request.description.slice(0, 160),
      openGraph: {
        title: request.title,
        description: request.description.slice(0, 160),
        type: 'article',
        url: `/requests/${id}`,
        images: [{ url: `/requests/${id}/opengraph-image`, width: 1200, height: 630, alt: request.title }],
      },
      twitter: {
        card: 'summary_large_image',
        title: request.title,
        description: request.description.slice(0, 160),
        images: [`/requests/${id}/opengraph-image`],
      },
    };
  } catch {
    return {
      title: 'Help Request | MISHTEH',
      description: 'View and support this help request on MISHTEH.',
    };
  }
}

async function getRequest(id: string, viewerId?: string) {
  try {
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            location: true,
            bio: true,
            image: true,
            ficaVerified: true,
            instagramUrl: true,
            facebookUrl: true,
            twitterUrl: true,
            tiktokUrl: true,
            websiteUrl: true,
          },
        },
        donations: {
          where: {
            anonymous: false,
          },
          select: {
            id: true,
            amount: true,
            message: true,
            createdAt: true,
            donor: {
              select: {
                fullName: true,
                image: true,
                preferences: {
                  select: {
                    showDonorNamePublic: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
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
          select: { userId: true, createdAt: true, user: { select: { fullName: true, image: true } } },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    // Increment view count
    if (request) {
      await prisma.request.update({
        where: { id },
        data: { views: { increment: 1 } },
      });
      if (viewerId && viewerId !== request.user.id) {
        await prisma.requestView.upsert({
          where: { requestId_userId: { requestId: id, userId: viewerId } },
          update: { lastViewedAt: new Date(), viewCount: { increment: 1 } },
          create: { requestId: id, userId: viewerId },
        });
      }
    }

    return request;
  } catch (error) {
    console.error('Error fetching request:', error);
    return null;
  }
}

export default async function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const request: any = await getRequest(id, session?.user?.id);

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-soft p-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Request Not Found</h1>
            <p className="text-gray-600 mb-6">The request you&apos;re looking for doesn&apos;t exist or has been removed.</p>
            <Link 
              href="/requests"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Browse all requests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = request.targetAmount
    ? Math.min((request.currentAmount / request.targetAmount) * 100, 100)
    : 0;

  const socialLinks = [
    { url: request.user.instagramUrl, icon: Instagram, label: 'Instagram', color: 'text-pink-600 bg-pink-100 hover:bg-pink-200' },
    { url: request.user.facebookUrl, icon: Facebook, label: 'Facebook', color: 'text-blue-600 bg-blue-100 hover:bg-blue-200' },
    { url: request.user.twitterUrl, icon: Twitter, label: 'Twitter', color: 'text-sky-500 bg-sky-100 hover:bg-sky-200' },
    { url: request.user.websiteUrl, icon: Globe, label: 'Website', color: 'text-gray-600 bg-gray-100 hover:bg-gray-200' },
  ].filter(link => link.url);

  // Check if current user has liked this request
  // Note: likes relation will be available after running prisma db push
  const userLiked = session?.user?.id && request.likes
    ? request.likes.some((like: { userId: string }) => like.userId === session.user.id)
    : false;

  const recentSupporters = request.donations.slice(0, 5).map((donation: any) => {
    const donorIsPublic = Boolean(donation.donor?.preferences?.showDonorNamePublic);

    return {
      ...donation,
      donorDisplayName: donorIsPublic ? donation.donor.fullName : 'Private Donor',
      donorImage: donorIsPublic ? donation.donor.image : null,
    };
  });
  const canSeeEngagement = session?.user?.userType === 'ADMIN' || session?.user?.id === request.user.id;
  const identifiedViewers = canSeeEngagement ? await prisma.requestView.findMany({
    where: { requestId: id },
    include: { user: { select: { id: true, fullName: true, image: true } } },
    orderBy: { lastViewedAt: 'desc' },
    take: 50,
  }) : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link 
          href="/requests"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all requests
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              {/* Header */}
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                        {request.category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter: string) => letter.toUpperCase())}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                        request.urgency === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        request.urgency === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        request.urgency === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {request.urgency}
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{request.title}</h1>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {getApproximateLocation(request.location)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatShortDate(request.createdAt)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {request.views} views
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Story</h2>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{request.description}</p>
                  {/* Facebook-style translate button */}
                  <TranslateButton text={request.description} className="mt-3" />
                </div>

                {/* Social Actions */}
                <SocialActions
                  requestId={request.id}
                  initialLikeCount={request._count.likes}
                  initialCommentCount={request._count.comments}
                  initialLiked={userLiked}
                />
              </div>

              {/* Requester Info Card */}
              <div className="bg-gray-50 p-6 md:p-8 border-t border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">About the Requester</h2>
                <div className="flex items-start gap-4">
                  <Link href={`/profile/${request.user.id}`}>
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-secondary-100 ring-2 ring-white shadow-md flex-shrink-0">
                      {request.user.image ? (
                        <Image
                          src={request.user.image}
                          alt={request.user.fullName}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-primary-400" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1">
                    <Link 
                      href={`/profile/${request.user.id}`}
                      className="font-semibold text-gray-900 hover:text-primary-600 transition-colors inline-flex items-center gap-2"
                    >
                      {request.user.fullName}
                      <CountryFlag location={request.user.location} />
                    </Link>
                    {request.user.location && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {getApproximateLocation(request.user.location)}
                      </p>
                    )}
                    {request.user.bio && (
                      <p className="text-gray-600 mt-2 text-sm">{request.user.bio}</p>
                    )}
                    
                    {/* Social Links */}
                    {socialLinks.length > 0 && (
                      <div className="flex items-center gap-2 mt-3">
                        {socialLinks.map((link) => (
                          <a
                            key={link.label}
                            href={link.url!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-2 rounded-full transition-colors ${link.color}`}
                            title={link.label}
                          >
                            <link.icon className="w-4 h-4" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary-500" />
                  Comments ({request._count.comments})
                </h2>
              </div>
              <CommentSection 
                requestId={request.id}
                initialComments={request.comments}
              />
            </div>

            {/* Donations List */}
            {request.donations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    Recent Supporters ({request._count.donations})
                  </h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {recentSupporters.map((donation: any) => (
                    <div key={donation.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-green-100 to-primary-100 flex items-center justify-center flex-shrink-0">
                          {donation.donorImage ? (
                            <Image
                              src={donation.donorImage}
                              alt={donation.donorDisplayName}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-primary-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-semibold text-gray-900 truncate">{donation.donorDisplayName}</p>
                            <CurrencyDisplay amount={donation.amount} className="text-green-600 font-bold whitespace-nowrap" />
                          </div>
                          {donation.message && (
                            <p className="text-sm text-gray-600 line-clamp-2">{donation.message}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {formatShortDate(donation.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {!request.donationsEnabled ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-soft">
                  <h2 className="text-lg font-bold text-amber-950">Story published — support coming soon</h2>
                  <p className="mt-2 text-sm text-amber-800">MISHTEH approved this post. Donations will open after the recipient identity review is complete.</p>
                </div>
              ) : session?.user ? (
                // Show donation form if logged in
                <DonationForm
                  requestId={request.id}
                  requestTitle={request.title}
                  targetAmount={request.targetAmount}
                  currentAmount={request.currentAmount}
                />
              ) : (
                // Show login prompt if not logged in
                <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Support This Story</h2>
                    
                    {/* Progress */}
                    {request.targetAmount && (
                      <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-bold text-gray-900">
                            <CurrencyDisplay amount={request.currentAmount} />
                            <span className="font-normal text-gray-500"> raised</span>
                          </span>
                          <span className="text-gray-500">
                            of <CurrencyDisplay amount={request.targetAmount} />
                          </span>
                        </div>
                        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-700"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-primary-500" />
                            <span className="font-medium text-primary-600">{progressPercentage.toFixed(0)}%</span> funded
                          </span>
                          <span>{request._count.donations} donors</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <Link
                        href={`/auth/login?callbackUrl=/requests/${request.id}`}
                        className="block w-full px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-center font-semibold rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all shadow-md hover:shadow-lg"
                      >
                        Login to Donate
                      </Link>
                      <p className="text-xs text-gray-500 text-center">
                        You must be logged in to make a donation
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Total Donors:</span>
                        <span className="font-semibold">{request._count.donations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Likes:</span>
                        <span className="font-semibold flex items-center gap-1">
                          <Heart className="w-3 h-3 text-red-500" />
                          {request._count.likes}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className="font-semibold capitalize text-primary-600">{request.status.toLowerCase().replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Stats Card */}
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <Heart className="w-5 h-5 text-red-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{request._count.likes}</p>
                    <p className="text-xs text-gray-500">Likes</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <MessageCircle className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{request._count.comments}</p>
                    <p className="text-xs text-gray-500">Comments</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <User className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{request._count.donations}</p>
                    <p className="text-xs text-gray-500">Donors</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-xl">
                    <Eye className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-gray-900">{request.views}</p>
                    <p className="text-xs text-gray-500">Views</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {canSeeEngagement && (
          <section className="mt-8 rounded-2xl border border-primary-100 bg-white p-6 shadow-soft">
            <div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-600">Private post insights</p><h2 className="mt-1 text-xl font-bold text-gray-900">Who engaged with this post</h2><p className="mt-1 text-sm text-gray-500">Only the post owner and administrators can see these names. Anonymous visitors remain anonymous.</p></div>
            <div className="grid gap-6 md:grid-cols-3">
              <div><h3 className="font-semibold text-gray-900">Signed-in viewers ({identifiedViewers.length})</h3><div className="mt-3 space-y-2">{identifiedViewers.length ? identifiedViewers.map((view) => <div key={view.id} className="rounded-lg bg-gray-50 px-3 py-2 text-sm"><p className="font-medium">{view.user.fullName}</p><p className="text-xs text-gray-500">Last viewed {view.lastViewedAt.toLocaleDateString()} · {view.viewCount} visit{view.viewCount === 1 ? '' : 's'}</p></div>) : <p className="text-sm text-gray-500">No identified viewers yet.</p>}</div></div>
              <div><h3 className="font-semibold text-gray-900">Reactions ({request.likes.length})</h3><div className="mt-3 space-y-2">{request.likes.length ? request.likes.map((like: any) => <div key={like.userId} className="rounded-lg bg-red-50 px-3 py-2 text-sm"><p className="font-medium text-gray-900">{like.user.fullName}</p><p className="text-xs text-gray-500">Liked {new Date(like.createdAt).toLocaleDateString()}</p></div>) : <p className="text-sm text-gray-500">No reactions yet.</p>}</div></div>
              <div><h3 className="font-semibold text-gray-900">Comments ({request.comments.length})</h3><div className="mt-3 space-y-2">{request.comments.length ? request.comments.map((comment: any) => <div key={comment.id} className="rounded-lg bg-blue-50 px-3 py-2 text-sm"><p className="font-medium text-gray-900">{comment.user.fullName}</p><p className="line-clamp-2 text-xs text-gray-600">{comment.content}</p></div>) : <p className="text-sm text-gray-500">No comments yet.</p>}</div></div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
