'use client';

import { useState, useEffect } from 'react';
import { Search, Sparkles, SlidersHorizontal, X, HeartHandshake } from 'lucide-react';
import SocialCard from '@/components/SocialCard';
import { CardSkeletonGrid } from '@/components/Skeletons';
import CategorySelector from '@/components/CategorySelector';

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    urgency: '',
    location: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.urgency) params.append('urgency', filters.urgency);
      if (filters.location) params.append('location', filters.location);

      const response = await fetch(`/api/requests?${params.toString()}`);
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter((request) => {
    if (searchTerm === '') return true;
    
    const search = searchTerm.toLowerCase();
    
    // Search across multiple fields
    return (
      request.title?.toLowerCase().includes(search) ||
      request.description?.toLowerCase().includes(search) ||
      request.user?.fullName?.toLowerCase().includes(search) ||
      request.category?.toLowerCase().includes(search) ||
      request.customCategory?.toLowerCase().includes(search) ||
      request.location?.toLowerCase().includes(search)
    );
  });

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fbf8f4] pb-20 pt-8 sm:pt-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-br from-primary-100/80 via-[#fff8e8] to-secondary-100/70" />
      <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-primary-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-8 h-72 w-72 rounded-full bg-secondary-300/20 blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-9 max-w-3xl animate-fade-in-up">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-200/80 bg-white/70 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-primary-700 shadow-sm backdrop-blur">
            <HeartHandshake className="h-4 w-4" /> Community care
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-secondary-900 sm:text-5xl">
            All Help Requests
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Browse requests from people in need and make a difference today
          </p>
        </div>

        {/* Search and Filters */}
        <section aria-label="Search and filter requests" className="mb-8 rounded-3xl border border-white/80 bg-white/90 p-4 shadow-[0_20px_60px_-30px_rgba(37,72,113,0.35)] backdrop-blur-xl sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-secondary-800">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-secondary-50 text-secondary-600"><SlidersHorizontal className="h-4 w-4" /></span>
            Find the right request
          </div>
          {/* Search Bar */}
          <div className="mb-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary-500" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-12 pr-11 text-base text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100"
              />
              {searchTerm && <button onClick={() => setSearchTerm('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button>}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Category
              </label>
              <div className="md:hidden">
                <CategorySelector 
                  value={filters.category}
                  onChange={(value) => setFilters({ ...filters, category: value })}
                  isMobile={true}
                />
              </div>
              <div className="hidden md:block">
                <CategorySelector 
                  value={filters.category}
                  onChange={(value) => setFilters({ ...filters, category: value })}
                  isMobile={false}
                />
              </div>
            </div>

            <div>
              <label htmlFor="urgency" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Urgency
              </label>
              <select
                id="urgency"
                value={filters.urgency}
                onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
                className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition hover:border-slate-300 focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100"
              >
                <option value="">All Urgency Levels</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Location
              </label>
              <input
                id="location"
                type="text"
                placeholder="City, State"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-100"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {(filters.category || filters.urgency || filters.location || searchTerm) && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <span className="rounded-full bg-secondary-50 px-3 py-1.5 text-sm font-medium text-secondary-700">
                {filteredRequests.length} {filteredRequests.length === 1 ? 'result' : 'results'} found
              </span>
              <button
                onClick={() => {
                  setFilters({ category: '', urgency: '', location: '' });
                  setSearchTerm('');
                }}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-primary-700 transition hover:bg-primary-50"
              >
                <X className="h-4 w-4" /> Clear all filters
              </button>
            </div>
          )}
        </section>

        {/* Results */}
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-600" aria-live="polite">
            Showing <span className="font-bold text-secondary-900">{filteredRequests.length}</span> request{filteredRequests.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Requests Grid */}
        {loading ? (
          <CardSkeletonGrid count={6} />
        ) : filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredRequests.map((request, index) => (
              <SocialCard key={request.id} request={request} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-white bg-white/90 p-10 text-center shadow-soft sm:p-14">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-secondary-100"><Sparkles className="h-8 w-8 text-primary-600" /></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No requests found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search term
            </p>
            <button
              onClick={() => {
                setFilters({ category: '', urgency: '', location: '' });
                setSearchTerm('');
              }}
              className="rounded-xl bg-primary-600 px-5 py-2.5 font-semibold text-white shadow-md transition hover:bg-primary-700"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
