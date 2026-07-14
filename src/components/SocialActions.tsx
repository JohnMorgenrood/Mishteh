'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Heart, MessageCircle, Share2, X, 
  Facebook, Twitter, Copy, Check 
} from 'lucide-react';

interface SocialActionsProps {
  requestId: string;
  initialLikeCount: number;
  initialCommentCount: number;
  initialLiked: boolean;
  onToggleComments?: () => void;
  showComments?: boolean;
  commentsEnabled?: boolean;
}

export default function SocialActions({ 
  requestId, 
  initialLikeCount, 
  initialCommentCount,
  initialLiked,
  onToggleComments,
  showComments = false,
  commentsEnabled = true
}: SocialActionsProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = 'Help support this cause on Mishteh';

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

  const handleLike = async () => {
    if (!session?.user) {
      window.location.href = '/auth/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
      return;
    }

    setIsLikeAnimating(true);
    
    try {
      const response = await fetch(`/api/requests/${requestId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikeCount(data.likeCount);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setTimeout(() => setIsLikeAnimating(false), 300);
    }
  };

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

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Like Button */}
      <button
        onClick={handleLike}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200 font-medium
          ${isLiked 
            ? 'text-red-500 bg-red-50 hover:bg-red-100 border border-red-200' 
            : 'text-gray-600 bg-gray-100 hover:text-red-500 hover:bg-red-50 border border-gray-200'
          }
          ${isLikeAnimating ? 'scale-105' : 'scale-100'}
        `}
        aria-label={isLiked ? 'Unlike' : 'Like'}
      >
        <Heart 
          className={`w-5 h-5 transition-transform ${isLikeAnimating ? 'animate-like-pop' : ''} ${isLiked ? 'fill-current' : ''}`}
        />
        <span>{likeCount}</span>
        <span className="hidden sm:inline">
          {likeCount === 1 ? 'Like' : 'Likes'}
        </span>
      </button>

      {/* Comment Button */}
      {commentsEnabled && <button
        onClick={onToggleComments}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-200 font-medium border
          ${showComments 
            ? 'text-primary-600 bg-primary-50 border-primary-200' 
            : 'text-gray-600 bg-gray-100 hover:text-primary-600 hover:bg-primary-50 border-gray-200'
          }
        `}
      >
        <MessageCircle className="w-5 h-5" />
        <span>{initialCommentCount}</span>
        <span className="hidden sm:inline">Comments</span>
      </button>}

      {/* Share Button */}
      <div className="relative" ref={shareMenuRef}>
        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full text-gray-600 bg-gray-100 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 font-medium border border-gray-200"
        >
          <Share2 className="w-5 h-5" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* Share Menu Popup */}
        {showShareMenu && (
          <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-20 min-w-[240px] animate-slide-down">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-900">Share this story</span>
              <button
                onClick={() => setShowShareMenu(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => handleShare('facebook')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Facebook className="w-4 h-4 text-blue-600" />
                </div>
                <span>Share on Facebook</span>
              </button>
              
              <button
                onClick={() => handleShare('twitter')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-sky-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                  <Twitter className="w-4 h-4 text-sky-500" />
                </div>
                <span>Share on X</span>
              </button>
              
              <button
                onClick={() => handleShare('whatsapp')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-green-50 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-green-600" />
                </div>
                <span>Share on WhatsApp</span>
              </button>
              
              <button
                onClick={() => handleShare('copy')}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  copied ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
