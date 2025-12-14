'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Heart, MessageCircle, HandHeart, Sparkles, 
  TrendingUp, User, Loader2, ArrowLeft
} from 'lucide-react';
import { formatShortDate } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'LIKE' | 'COMMENT' | 'DONATION' | 'NEW_REQUEST' | 'REQUEST_FUNDED';
  createdAt: string;
  metadata?: {
    userName?: string;
    amount?: number;
    commentPreview?: string;
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
    verb: 'liked',
    emoji: '❤️',
  },
  COMMENT: {
    icon: MessageCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100',
    verb: 'commented on',
    emoji: '💬',
  },
  DONATION: {
    icon: HandHeart,
    color: 'text-green-500',
    bgColor: 'bg-green-100',
    verb: 'donated to',
    emoji: '🎁',
  },
  NEW_REQUEST: {
    icon: Sparkles,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100',
    verb: 'posted a new story',
    emoji: '✨',
  },
  REQUEST_FUNDED: {
    icon: TrendingUp,
    color: 'text-primary-500',
    bgColor: 'bg-primary-100',
    verb: 'reached its goal!',
    emoji: '🎉',
  },
};

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
      const params = new URLSearchParams({ limit: '30' });
      if (cursor) params.append('cursor', cursor);
      
      const response = await fetch(`/api/activity?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (cursor) {
          setActivities(prev => [...prev, ...data.activities]);
        } else {
          setActivities(data.activities);
        }
        setNextCursor(data.nextCursor);
      }
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

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return formatShortDate(date);
  };

  const renderActivityText = (activity: Activity) => {
    const config = activityConfig[activity.type];
    const userName = activity.metadata?.userName || activity.user?.fullName || 'Someone';
    const recipientName = activity.request?.user?.fullName;

    switch (activity.type) {
      case 'LIKE':
        return (
          <>
            <span className="font-semibold">{userName}</span> {config.emoji} {config.verb}{' '}
            {recipientName && (
              <>
                <span className="font-medium">{recipientName}&apos;s</span> request
              </>
            )}
          </>
        );
      case 'COMMENT':
        return (
          <>
            <span className="font-semibold">{userName}</span> {config.emoji} {config.verb}{' '}
            {recipientName && (
              <>
                <span className="font-medium">{recipientName}&apos;s</span> story
              </>
            )}
          </>
        );
      case 'DONATION':
        return (
          <>
            <span className="font-semibold">A donation</span> {config.emoji} was made to support{' '}
            <span className="font-medium">{recipientName || 'someone in need'}</span>
          </>
        );
      case 'NEW_REQUEST':
        return (
          <>
            <span className="font-semibold">{recipientName || userName}</span> {config.emoji}{' '}
            {config.verb}
            {activity.request?.user?.location && (
              <span className="text-gray-500"> from {activity.request.user.location}</span>
            )}
          </>
        );
      case 'REQUEST_FUNDED':
        return (
          <>
            <span className="font-semibold">{recipientName}&apos;s</span> request {config.emoji}{' '}
            {config.verb}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="animate-pulse">🌟</span>
            Community Activity
          </h1>
          <p className="text-gray-600 mt-2">
            See what&apos;s happening in our community of kindness
          </p>
        </div>

        {/* Activity List */}
        <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-16">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No activity yet</p>
              <p className="text-gray-400 text-sm mt-1">Be the first to interact!</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-50">
                {activities.map((activity, index) => {
                  const config = activityConfig[activity.type];
                  const Icon = config.icon;

                  return (
                    <div
                      key={activity.id}
                      className="px-6 py-4 hover:bg-gray-50/50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Activity Icon or User Avatar */}
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center`}>
                          {activity.user?.image ? (
                            <Image
                              src={activity.user.image}
                              alt={activity.user.fullName}
                              width={48}
                              height={48}
                              className="rounded-full"
                            />
                          ) : (
                            <Icon className={`w-6 h-6 ${config.color}`} />
                          )}
                        </div>

                        {/* Activity Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-700 leading-relaxed">
                            {renderActivityText(activity)}
                          </p>
                          {activity.request && (
                            <Link
                              href={`/requests/${activity.request.id}`}
                              className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-1 line-clamp-1 block"
                            >
                              &quot;{activity.request.title}&quot;
                            </Link>
                          )}
                          <span className="text-sm text-gray-400 mt-2 block">
                            {formatTimeAgo(activity.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More */}
              {nextCursor && (
                <div className="px-6 py-4 border-t border-gray-100">
                  <button
                    onClick={() => fetchActivities(nextCursor)}
                    disabled={isLoadingMore}
                    className="w-full py-3 text-center text-primary-600 hover:text-primary-700 font-medium hover:bg-primary-50 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isLoadingMore ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      'Load More Activity'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
