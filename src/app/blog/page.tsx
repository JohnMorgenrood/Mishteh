'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Calendar, User, ArrowRight, ExternalLink, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  category: string;
  imageUrl: string | null;
  sourceUrl: string | null;
  isExternal: boolean;
  publishedAt: string;
}

export default function BlogPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [internalPosts, setInternalPosts] = useState<BlogPost[]>([]);
  const [externalPosts, setExternalPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredPosts(posts);
      setInternalPosts(posts.filter(p => !p.isExternal));
      setExternalPosts(posts.filter(p => p.isExternal));
    } else {
      const filtered = posts.filter(post => post.category === selectedCategory);
      setFilteredPosts(filtered);
      setInternalPosts(filtered.filter(p => !p.isExternal));
      setExternalPosts(filtered.filter(p => p.isExternal));
    }
  }, [selectedCategory, posts]);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog');
      if (response.ok) {
        const data: BlogPost[] = await response.json();
        setPosts(data);
        
        // Extract unique categories, excluding old Israel News
        const categorySet = new Set(data.map((post) => post.category).filter(cat => cat !== 'Israel News'));
        const uniqueCategories: string[] = ['All', ...Array.from(categorySet)];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const syncFeeds = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/blog/sync', {
        method: 'POST',
      });
      
      const result = await response.json();
      console.log('Sync result:', result);
      
      if (response.ok) {
        // Refresh posts immediately
        await fetchPosts();
        
        alert(`Success! Processed ${result.totalProcessed || 0} articles.\nAdded ${result.totalAdded || 0} new posts.\nDeleted ${result.deletedOld || 0} old posts.`);
      } else {
        alert(`Failed to sync feeds: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error syncing feeds:', error);
      alert('Error syncing feeds. Check console for details.');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading stories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-4">
            MISHTEH Stories & News
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real stories of hope, generosity, and faith-based news from around the world
          </p>
          {session?.user?.userType === 'ADMIN' && (
            <button
              onClick={syncFeeds}
              disabled={syncing}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:scale-105 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync RSS Feeds'}
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-xl text-sm font-medium transition-all ${
                category === selectedCategory
                  ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-soft-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 hover:scale-105'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Internal Blog Posts - Our Stories */}
        {internalPosts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Stories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {internalPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-soft-lg transition-all hover:scale-105"
                >
                  {/* Beautiful Image Header */}
                  {post.imageUrl && (
                    <div className="h-56 relative overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform hover:scale-110 duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    </div>
                  )}
                  
                  {/* Content */}
                  <div className="p-6">
                    {/* Category Badge with gradient */}
                    <span className="inline-block px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-xs font-semibold rounded-full mb-4">
                      {post.category}
                    </span>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-primary-600 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 text-base mb-6 line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-6 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary-600" />
                        <span className="font-medium">{post.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary-600" />
                        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-md"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* External News - Carousel */}
        {externalPosts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest News from Around the World</h2>
            <div className="relative px-12">
              {/* Carousel Container */}
              <div className="overflow-hidden rounded-2xl">
                <div 
                  className="flex transition-transform duration-500 ease-out"
                  style={{ 
                    transform: `translateX(-${carouselIndex * 100}%)`,
                  }}
                >
                  {externalPosts.map((post) => (
                    <article
                      key={post.id}
                      className="w-full flex-shrink-0 px-2"
                    >
                      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-soft p-8 hover:shadow-soft-lg transition-all border border-gray-100 h-full">
                        {/* Category badge with icon */}
                        <div className="flex items-center gap-2 mb-4">
                          <ExternalLink className="w-4 h-4 text-primary-600" />
                          <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
                            {post.category}
                          </span>
                        </div>

                        <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-base mb-6 line-clamp-4">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-6 pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="line-clamp-1">{post.author}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <a
                          href={post.sourceUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:scale-105 transition-all"
                        >
                          Read Full Article
                          <ArrowRight className="w-5 h-5" />
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              {externalPosts.length > 1 && (
                <>
                  <button
                    onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
                    disabled={carouselIndex === 0}
                    className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-4 shadow-lg hover:shadow-xl hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all z-10"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={() => setCarouselIndex(Math.min(externalPosts.length - 1, carouselIndex + 1))}
                    disabled={carouselIndex >= externalPosts.length - 1}
                    className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-4 shadow-lg hover:shadow-xl hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all z-10"
                    aria-label="Next"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {externalPosts.length > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {externalPosts.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCarouselIndex(idx)}
                      className={`h-2 rounded-full transition-all ${
                        carouselIndex === idx ? 'bg-primary-600 w-8' : 'bg-gray-300 w-2 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {internalPosts.length === 0 && externalPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No posts found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
