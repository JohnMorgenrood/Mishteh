'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { User, Send, Loader2, MessageCircle, AlertCircle } from 'lucide-react';
import { formatShortDate } from '@/lib/utils';

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

interface CommentSectionProps {
  requestId: string;
  initialComments?: Comment[];
  onCommentAdded?: () => void;
}

export default function CommentSection({ 
  requestId, 
  initialComments = [],
  onCommentAdded 
}: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(initialComments.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch comments if not provided
  useEffect(() => {
    if (initialComments.length === 0) {
      fetchComments();
    }
  }, [requestId]);

  const fetchComments = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(`/api/requests/${requestId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      window.location.href = '/auth/login?callbackUrl=' + encodeURIComponent(window.location.pathname);
      return;
    }

    if (!newComment.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/requests/${requestId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments(prev => [data.comment, ...prev]);
        setNewComment('');
        onCommentAdded?.();
        
        // Auto-resize textarea
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatShortDate(commentDate);
  };

  const displayedComments = showAll ? comments : comments.slice(0, 3);
  const hasMoreComments = comments.length > 3;

  return (
    <div className="p-5 bg-gray-50/50">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-3">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-secondary-100">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <User className="w-5 h-5 text-primary-400" />
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={handleTextareaChange}
              placeholder={session ? "Write a supportive comment..." : "Sign in to leave a comment"}
              disabled={!session || isLoading}
              className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm min-h-[48px]"
              rows={1}
              maxLength={500}
            />
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={!session || isLoading || !newComment.trim()}
              className="absolute right-2 bottom-2 p-2 rounded-full bg-primary-500 text-white hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
              aria-label="Post comment"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-2 ml-13 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* Character Count */}
        {newComment.length > 0 && (
          <div className="mt-1 ml-13 text-xs text-gray-400 text-right">
            {newComment.length}/500
          </div>
        )}
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {isFetching ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No comments yet</p>
            <p className="text-gray-400 text-xs">Be the first to share your support!</p>
          </div>
        ) : (
          <>
            {displayedComments.map((comment, index) => (
              <div 
                key={comment.id}
                className="flex gap-3 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Comment Avatar */}
                <Link href={`/profile/${comment.user.id}`} className="flex-shrink-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-primary-100 to-secondary-100 ring-2 ring-white shadow-sm hover:ring-primary-200 transition-all">
                    {comment.user.image ? (
                      <Image
                        src={comment.user.image}
                        alt={comment.user.fullName}
                        width={36}
                        height={36}
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <User className="w-4 h-4 text-primary-400" />
                      </div>
                    )}
                  </div>
                </Link>

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Link 
                        href={`/profile/${comment.user.id}`}
                        className="font-semibold text-sm text-gray-900 hover:text-primary-600 transition-colors"
                      >
                        {comment.user.fullName}
                      </Link>
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Show More/Less Button */}
            {hasMoreComments && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full text-center text-sm font-medium text-primary-600 hover:text-primary-700 py-2 hover:bg-primary-50 rounded-lg transition-colors"
              >
                {showAll ? 'Show less' : `View all ${comments.length} comments`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
