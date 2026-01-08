'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { RequestCategory, UrgencyLevel } from '@prisma/client';
import { 
  Clock, MapPin, TrendingUp, User, Share2, X, 
  Facebook, Twitter, MessageCircle, Copy, Check,
  Heart, Instagram, Globe, ExternalLink, Languages
} from 'lucide-react';
import { CurrencyDisplay } from './CurrencyDisplay';
import { REQUEST_CATEGORIES } from '@/lib/constants';
import { formatShortDate, getApproximateLocation } from '@/lib/utils';
import CommentSection from './CommentSection';
import { TranslateLink } from './TranslateButton';
import { CountryFlag } from './CountryBadge';

interface RequestUser {
  id: string;
  fullName: string;
  location: string | null;
  image?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    fullName: string;
    image?: string | null;
  };
}

interface Request {
  id: string;
  title: string;
  description: string;
  category: RequestCategory;
  customCategory?: string | null;
  urgency: UrgencyLevel;
  location: string;
  targetAmount?: number | null;
  currentAmount: number;
  createdAt: Date;
  user: RequestUser;
  _count?: {
    likes?: number;
    comments?: number;
    donations?: number;
  };
  likes?: { userId: string }[];
  comments?: Comment[];
}

interface SocialCardProps {
  request: Request;
  index?: number;
  onLikeUpdate?: (requestId: string, liked: boolean, newCount: number) => void;
}

const urgencyColors = {
  LOW: 'bg-green-100 text-green-700 border-green-200',
  MEDIUM: 'bg-amber-100 text-amber-700 border-amber-200',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
  CRITICAL: 'bg-red-100 text-red-700 border-red-200',
};

const urgencyIcons = {
  LOW: '🟢',
  MEDIUM: '🟡', 
  HIGH: '🟠',
  CRITICAL: '🔴',
};

// Create category labels map from constants
const categoryLabelsMap = REQUEST_CATEGORIES.reduce((acc, cat) => {
  acc[cat.value as RequestCategory] = cat.label;
  return acc;
}, {} as Record<RequestCategory, string>);

export default function SocialCard({ request, index = 0, onLikeUpdate }: SocialCardProps) {
  const { data: session } = useSession();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(request._count?.likes || 0);
  const [commentCount, setCommentCount] = useState(request._count?.comments || 0);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  
  // Check if user has liked this request
  useEffect(() => {
    if (session?.user?.id && request.likes) {
      setIsLiked(request.likes.some(like => like.userId === session.user.id));
    }
  }, [session, request.likes]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShareMenu]);

  const progressPercentage = request.targetAmount
    ? Math.min((request.currentAmount / request.targetAmount) * 100, 100)
    : 0;

  const categoryDisplay = request.category === 'OTHER' && request.customCategory
    ? request.customCategory
    : (categoryLabelsMap[request.category] || request.category);

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/requests/${request.id}` : '';
  const shareText = `Help ${request.user.fullName} with "${request.title}" on Mishteh`;

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
          setShowShareMenu(false);
        }, 2000);
        break;
    }
  };

  const handleLike = async () => {
    if (!session?.user) {
      // Redirect to login
      window.location.href = '/auth/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setIsLikeAnimating(true);
    
    try {
      const response = await fetch(`/api/requests/${request.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikeCount(data.likeCount);
        onLikeUpdate?.(request.id, data.liked, data.likeCount);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setTimeout(() => setIsLikeAnimating(false), 300);
    }
  };

  const handleCommentAdded = () => {
    setCommentCount(prev => prev + 1);
  };

  // Social links for the user
  const socialLinks = [
    { url: request.user.instagramUrl, icon: Instagram, label: 'Instagram', color: 'hover:text-pink-500' },
    { url: request.user.facebookUrl, icon: Facebook, label: 'Facebook', color: 'hover:text-blue-600' },
    { url: request.user.twitterUrl, icon: Twitter, label: 'Twitter', color: 'hover:text-sky-500' },
  ].filter(link => link.url);

  return (
    <div
      ref={cardRef}
      className={`group bg-white rounded-2xl shadow-soft hover:shadow-soft-lg transition-all duration-500 overflow-hidden border border-gray-100 
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
      style={{ 
        transitionDelay: `${index * 100}ms`,
      }}
    >
      {/* Card Header - User Info */}
      <div className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <Link href={`/profile/${request.user.id}`} className="relative">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-secondary-100 ring-2 ring-white shadow-md group-hover:ring-primary-200 transition-all">
                {request.user.image ? (
                  <Image
                    src={request.user.image}
                    alt={request.user.fullName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <User className="w-6 h-6 text-primary-400" />
                  </div>
                )}
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
            </Link>

            {/* User Info */}
            <div>
              <Link 
                href={`/profile/${request.user.id}`}
                className="font-semibold text-gray-900 hover:text-primary-600 transition-colors flex items-center gap-1.5"
              >
                {request.user.fullName}
                <CountryFlag location={request.user.location || request.location} />
              </Link>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {getApproximateLocation(request.user.location || request.location)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatShortDate(request.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-1">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-colors ${link.color}`}
                  title={link.label}
                >
                  <link.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category & Urgency Tags */}
      <div className="px-5 pb-3 flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-primary-50 text-primary-700 border border-primary-100">
          {categoryDisplay}
        </span>
        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full border ${urgencyColors[request.urgency]}`}>
          {urgencyIcons[request.urgency]} {request.urgency}
        </span>
      </div>

      {/* Title & Description */}
      <div className="px-5">
        <Link href={`/requests/${request.id}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
            {request.title}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-2">
          {request.description}
        </p>
        {/* Translate Button - Facebook style */}
        <div className="mb-3">
          <TranslateLink text={request.description} />
        </div>
      </div>

      {/* Progress Bar */}
      {request.targetAmount && (
        <div className="px-5 pb-4">
          <div className="bg-gray-100 rounded-xl p-4">
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
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercentage}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <TrendingUp className="w-3 h-3 text-primary-500" />
                <span className="font-medium text-primary-600">{progressPercentage.toFixed(0)}%</span> funded
              </div>
              <span className="text-xs text-gray-500">
                {request._count?.donations || 0} donors
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Social Actions */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 
              ${isLiked 
                ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
              }
              ${isLikeAnimating ? 'scale-110' : 'scale-100'}
            `}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart 
              className={`w-5 h-5 transition-transform ${isLikeAnimating ? 'animate-like-pop' : ''} ${isLiked ? 'fill-current' : ''}`}
            />
            <span className="text-sm font-medium">{likeCount}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
              ${showComments 
                ? 'text-primary-600 bg-primary-50' 
                : 'text-gray-500 hover:text-primary-600 hover:bg-primary-50'
              }
            `}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{commentCount}</span>
          </button>
        </div>

        {/* Share Button */}
        <div className="relative" ref={shareMenuRef}>
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Share</span>
          </button>

          {/* Share Menu Popup */}
          {showShareMenu && (
            <div className="absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-20 min-w-[220px] animate-slide-up">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Share this story</span>
                <button
                  onClick={() => setShowShareMenu(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-2 mb-3">
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-blue-50 transition-colors group"
                  title="Share on Facebook"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Facebook className="w-5 h-5 text-blue-600" />
                  </div>
                </button>
                
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-sky-50 transition-colors group"
                  title="Share on X"
                >
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                    <Twitter className="w-5 h-5 text-sky-500" />
                  </div>
                </button>
                
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-green-50 transition-colors group"
                  title="Share on WhatsApp"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                </button>
                
                <button
                  onClick={() => handleShare('copy')}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                  title="Copy link"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    copied ? 'bg-green-100' : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    {copied ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                </button>
              </div>

              {copied && (
                <p className="text-xs text-green-600 text-center font-medium animate-fade-in">
                  Link copied to clipboard!
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* View Details & Donate Button */}
      <div className="px-5 pb-5">
        <Link
          href={`/requests/${request.id}`}
          className="block w-full text-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          View Story & Donate
        </Link>
      </div>

      {/* Expandable Comments Section */}
      {showComments && (
        <div className="border-t border-gray-100 animate-slide-down">
          <CommentSection 
            requestId={request.id}
            initialComments={request.comments || []}
            onCommentAdded={handleCommentAdded}
          />
        </div>
      )}
    </div>
  );
}
