'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  HandHeart,
  Heart,
  Loader2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { formatShortDate } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';
import { getAvatarInitial, isUploadedProfileImage } from '@/lib/avatar';

interface Activity {
  id: string;
  type: 'LIKE' | 'COMMENT' | 'DONATION' | 'NEW_REQUEST' | 'REQUEST_FUNDED' | 'THANK_YOU';
  createdAt: string;
  metadata?: {
    userName?: string;
    amount?: number;
    commentPreview?: string;
    messagePreview?: string;
  };
  request?: {
    id: string;
    title: string;
    user: {
      id: string;
      fullName: string;
      location: string;
    };
  };
  user?: {
    id: string;
    fullName: string;
    image?: string;
  };
}

const activityConfig = {
  LIKE: {
    icon: Heart,
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    label: 'Support',
  },
  COMMENT: {
    icon: MessageCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    label: 'Comment',
  },
  DONATION: {
    icon: HandHeart,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Donation',
  },
  NEW_REQUEST: {
    icon: Sparkles,
    color: 'text-primary-600',
    bgColor: 'bg-primary-100',
    label: 'New Story',
  },
  REQUEST_FUNDED: {
    icon: TrendingUp,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    label: 'Goal Reached',
  },
  THANK_YOU: {
    icon: HandHeart,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    label: 'Thank You',
  },
};

function formatTimeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return formatShortDate(date);
}

function renderHeadline(activity: Activity) {
  const actor = activity.metadata?.userName || activity.user?.fullName || 'Someone';
  const recipientName = activity.request?.user?.fullName || 'someone';

  switch (activity.type) {
    case 'LIKE':
      return `${actor} showed support for ${recipientName}`;
    case 'COMMENT':
      return `${actor} commented on ${recipientName}'s story`;
    case 'DONATION':
      return `A donation was made to support ${recipientName}`;
    case 'NEW_REQUEST':
      return `${recipientName} shared a new story`;
    case 'REQUEST_FUNDED':
      return `${recipientName}'s request reached its goal`;
    case 'THANK_YOU':
      return `${actor} shared a thank-you note with supporters`;
    default:
      return 'Community activity';
  }
}

function renderBody(activity: Activity) {
  if (activity.type === 'COMMENT' && activity.metadata?.commentPreview) {
    return activity.metadata.commentPreview;
  }

  if (activity.type === 'DONATION' && activity.metadata?.amount) {
    return `Support amount recorded: ${formatCurrency(Number(activity.metadata.amount), 'ZAR')}`;
  }

  if (activity.type === 'THANK_YOU' && activity.metadata?.messagePreview) {
    return activity.metadata.messagePreview;
  }

  if (activity.request?.title) {
    return activity.request.title;
  }

  return 'Community members are actively supporting one another.';
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchActivities = useCallback(async (cursor?: string) => {
    if (cursor) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const params = new URLSearchParams({ limit: '24' });
      if (cursor) params.append('cursor', cursor);

      const response = await fetch(`/api/activity?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activity');
      }

      const data = await response.json();
      if (cursor) {
        setActivities((prev) => [...prev, ...data.activities]);
      } else {
        setActivities(data.activities);
      }
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const renderActivityAvatar = (activity: Activity) => {
    const config = activityConfig[activity.type];
    const Icon = config.icon;
    const initial = getAvatarInitial(activity.user?.fullName || activity.metadata?.userName);

    if (isUploadedProfileImage(activity.user?.image)) {
      return (
        <div className="h-12 w-12 overflow-hidden rounded-2xl ring-2 ring-white shadow-sm">
          <Image
            src={activity.user?.image || ''}
            alt={activity.user?.fullName || 'User avatar'}
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        </div>
      );
    }

    if (activity.user?.fullName || activity.metadata?.userName) {
      return (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 text-sm font-bold text-white shadow-sm">
          {initial}
        </div>
      );
    }

    return (
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${config.bgColor}`}>
        <Icon className={`h-5 w-5 ${config.color}`} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f6faf8,white_40%,#f8fafc_100%)] py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-primary-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="mb-6 rounded-3xl bg-gradient-to-r from-primary-700 via-primary-600 to-secondary-600 p-8 text-white shadow-soft-lg">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-100">Community Feed</p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">Activity, support, and gratitude</h1>
              <p className="mt-3 max-w-3xl text-sm text-primary-50 md:text-base">
                Follow the small moments that show a community caring for one another, including support, comments, and thankful updates from people who received help.
              </p>
            </div>

            <div className="space-y-5">
              {isLoading ? (
                <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-soft">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-500" />
                </div>
              ) : activities.length === 0 ? (
                <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-soft">
                  <Sparkles className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                  <p className="text-gray-600">No activity yet</p>
                  <p className="mt-1 text-sm text-gray-400">Once people like, comment, donate, and share updates, activity will appear here.</p>
                </div>
              ) : (
                activities.map((activity) => {
                  const config = activityConfig[activity.type];

                  return (
                    <article key={activity.id} className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-soft transition hover:shadow-soft-lg">
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">{renderActivityAvatar(activity)}</div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">{config.label}</p>
                                <h2 className="mt-1 text-lg font-bold text-gray-900">{renderHeadline(activity)}</h2>
                              </div>
                              <span className="text-xs text-gray-400">{formatTimeAgo(activity.createdAt)}</span>
                            </div>
                            <p className="mt-3 text-sm leading-7 text-gray-600">{renderBody(activity)}</p>

                            {activity.request && (
                              <Link
                                href={`/requests/${activity.request.id}`}
                                className="mt-4 block rounded-2xl border border-gray-200 bg-gray-50 p-4 transition hover:border-primary-200 hover:bg-primary-50/40"
                              >
                                <p className="text-sm font-semibold text-gray-900">{activity.request.title}</p>
                                <p className="mt-1 text-xs text-gray-500">
                                  {activity.request.user.fullName}
                                  {activity.request.user.location ? ` • ${activity.request.user.location}` : ''}
                                </p>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {nextCursor && (
              <div className="mt-6">
                <button
                  onClick={() => fetchActivities(nextCursor)}
                  disabled={isLoadingMore}
                  className="w-full rounded-2xl border border-gray-200 bg-white px-6 py-4 text-sm font-semibold text-primary-600 shadow-soft transition hover:border-primary-200 hover:bg-primary-50 disabled:opacity-50"
                >
                  {isLoadingMore ? 'Loading more activity...' : 'Load More Feed'}
                </button>
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-soft">
              <h2 className="text-lg font-bold text-gray-900">What You&apos;ll See Here</h2>
              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <div className="rounded-xl border border-primary-100 bg-primary-50 p-4">
                  Support, encouragement, and kind engagement from the community appear here as the feed grows.
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  Thank-you notes from requesters can help donors see that their support truly reached someone.
                </div>
                <div className="rounded-xl bg-gray-50 p-4">
                  Likes, comments, and visible support moments can surface here without making the page feel noisy.
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-soft">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-700" />
                <div>
                  <h2 className="text-lg font-bold text-emerald-900">Privacy Still Comes First</h2>
                  <p className="mt-2 text-sm text-emerald-800">
                    Donor privacy stays protected here. Private supporters remain private, and thankful updates can still be shared without exposing hidden donor names.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-soft">
              <h2 className="text-lg font-bold text-gray-900">Quick Links</h2>
              <div className="mt-4 space-y-3">
                <Link href="/requests" className="block rounded-xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-primary-50 hover:text-primary-700">
                  Browse requests
                </Link>
                <Link href="/dashboard" className="block rounded-xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-primary-50 hover:text-primary-700">
                  Open dashboard
                </Link>
                <Link href="/admin" className="block rounded-xl bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-primary-50 hover:text-primary-700">
                  Admin tools
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
