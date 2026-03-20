'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Heart, MessageCircle, HandHeart, Sparkles, 
  TrendingUp, User, MapPin, Loader2, RefreshCw 
} from 'lucide-react';
import { formatShortDate } from '@/lib/utils';
import { getAvatarInitial, isUploadedProfileImage } from '@/lib/avatar';

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

interface ActivityFeedProps {
  limit?: number;
  showTitle?: boolean;
  className?: string;
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

export default function ActivityFeed({ 
  limit = 10, 
  showTitle = true,
  className = '' 
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await fetch(`/api/activity?limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities);
        setError(null);
      } else {
        setError('Failed to load activity');
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activity');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchActivities(true), 30000);
    return () => clearInterval(interval);
  }, [limit]);

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatShortDate(date);
  };

  const renderActivityText = (activity: Activity) => {
    const config = activityConfig[activity.type];
    const userName = activity.metadata?.userName || activity.user?.fullName || 'Someone';
    const requestTitle = activity.request?.title;
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
            <span className="font-medium">{recipientName || 'someone'}</span>
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

  const renderActivityAvatar = (activity: Activity) => {
    const config = activityConfig[activity.type];
    const Icon = config.icon;
    const initial = getAvatarInitial(activity.user?.fullName || activity.metadata?.userName);

    if (isUploadedProfileImage(activity.user?.image)) {
      return (
        <div className="h-9 w-9 overflow-hidden rounded-full ring-2 ring-white shadow-sm">
          <Image
            src={activity.user?.image || ''}
            alt={activity.user?.fullName || 'User avatar'}
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
        </div>
      );
    }

    if (activity.user?.fullName || activity.metadata?.userName) {
      return (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-xs font-bold text-white shadow-sm">
          {initial}
        </div>
      );
    }

    return (
      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${config.bgColor}`}>
        <Icon className={`h-4 w-4 ${config.color}`} />
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-2xl shadow-soft p-6 ${className}`}>
        {showTitle && (
          <h3 className="text-lg font-bold text-gray-900 mb-4">Community Activity</h3>
        )}
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-2xl shadow-soft p-6 ${className}`}>
        {showTitle && (
          <h3 className="text-lg font-bold text-gray-900 mb-4">Community Activity</h3>
        )}
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={() => fetchActivities()}
            className="mt-2 text-primary-600 text-sm font-medium hover:text-primary-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-soft overflow-hidden ${className}`}>
      {showTitle && (
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="animate-pulse">🌟</span>
            Community Activity
          </h3>
          <button
            onClick={() => fetchActivities(true)}
            disabled={isRefreshing}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-primary-600"
            aria-label="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

      <div className="divide-y divide-gray-50">
        {activities.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No recent activity</p>
            <p className="text-gray-400 text-xs">Be the first to interact!</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const config = activityConfig[activity.type];
            const Icon = config.icon;

            return (
              <div
                key={activity.id}
                className="px-6 py-3 hover:bg-gray-50/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-3">
                  {/* Activity Icon or User Avatar */}
                  <div className="flex-shrink-0">
                    {renderActivityAvatar(activity)}
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-snug">
                      {renderActivityText(activity)}
                    </p>
                    {activity.request && (
                      <Link
                        href={`/requests/${activity.request.id}`}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-0.5 line-clamp-1 block"
                      >
                        &quot;{activity.request.title}&quot;
                      </Link>
                    )}
                    <span className="text-xs text-gray-400 mt-1 block">
                      {formatTimeAgo(activity.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* View All Link */}
      {activities.length > 0 && (
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
          <Link
            href="/activity"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center justify-center gap-1"
          >
            View all activity
            <span aria-hidden>→</span>
          </Link>
        </div>
      )}
    </div>
  );
}
