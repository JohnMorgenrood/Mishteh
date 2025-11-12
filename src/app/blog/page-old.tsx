import Link from 'next/link';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';

// Sample blog posts data
const blogPosts = [
  {
    id: '1',
    title: 'How Sarah Rebuilt Her Life After Unexpected Medical Bills',
    excerpt: 'Meet Sarah, a single mother who faced crushing medical debt after an emergency surgery. Through the MISHTEH community, she found hope and support that changed everything.',
    content: 'Full story coming soon...',
    author: 'MISHTEH Team',
    date: 'November 10, 2025',
    category: 'Success Stories',
    image: '/images/blog/medical-help.jpg',
    slug: 'sarah-medical-bills-success',
  },
  {
    id: '2',
    title: '5 Ways to Maximize Your Impact as a Donor',
    excerpt: 'Want to make the most of your charitable giving? Here are five proven strategies to ensure your donations create the greatest positive impact.',
    content: 'Full story coming soon...',
    author: 'Emily Johnson',
    date: 'November 8, 2025',
    category: 'Donor Tips',
    image: '/images/blog/donor-tips.jpg',
    slug: 'maximize-donor-impact',
  },
  {
    id: '3',
    title: 'The Power of Community: Johns Journey from Homelessness to Hope',
    excerpt: 'John spent three years without stable housing. Today, he has a job and an apartment, thanks to the compassion of strangers who believed in him.',
    content: 'Full story coming soon...',
    author: 'MISHTEH Team',
    date: 'November 5, 2025',
    category: 'Success Stories',
    image: '/images/blog/housing-success.jpg',
    slug: 'john-homelessness-journey',
  },
  {
    id: '4',
    title: 'Understanding the Verification Process: Building Trust on MISHTEH',
    excerpt: 'Transparency is key to our mission. Learn how we verify requests and protect both donors and recipients in our community.',
    content: 'Full story coming soon...',
    author: 'Michael Chen',
    date: 'November 3, 2025',
    category: 'Platform Updates',
    image: '/images/blog/verification.jpg',
    slug: 'understanding-verification-process',
  },
  {
    id: '5',
    title: 'Small Acts, Big Impact: The $25 Donation That Changed Everything',
    excerpt: 'Sometimes the smallest gestures create the biggest ripples. This is the story of how one $25 donation sparked a chain of generosity.',
    content: 'Full story coming soon...',
    author: 'MISHTEH Team',
    date: 'October 30, 2025',
    category: 'Inspiration',
    image: '/images/blog/small-donations.jpg',
    slug: 'small-acts-big-impact',
  },
  {
    id: '6',
    title: 'October 2025: Month in Review',
    excerpt: 'A look back at an incredible month on MISHTEH: 237 requests fulfilled, $452,000 raised, and countless lives changed.',
    content: 'Full story coming soon...',
    author: 'MISHTEH Team',
    date: 'October 28, 2025',
    category: 'Platform Updates',
    image: '/images/blog/monthly-review.jpg',
    slug: 'october-2025-review',
  },
];

const categories = ['All', 'Success Stories', 'Donor Tips', 'Platform Updates', 'Inspiration'];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">MISHTEH Stories</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real stories of hope, generosity, and community impact. Discover how MISHTEH is changing lives every day.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === 'All'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Post */}
        <div className="mb-16">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="w-32 h-32 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">📰</span>
                  </div>
                  <p className="text-primary-900 font-semibold">Featured Story</p>
                </div>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center space-x-4 mb-4">
                  <span className="px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
                    {blogPosts[0].category}
                  </span>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    {blogPosts[0].date}
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {blogPosts[0].title}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {blogPosts[0].excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-500 text-sm">
                    <User className="w-4 h-4 mr-1" />
                    {blogPosts[0].author}
                  </div>
                  <Link
                    href={`/blog/${blogPosts[0].slug}`}
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {blogPosts.slice(1).map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-48 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="text-6xl mb-2">
                    {post.category === 'Success Stories' && '🌟'}
                    {post.category === 'Donor Tips' && '💡'}
                    {post.category === 'Platform Updates' && '📢'}
                    {post.category === 'Inspiration' && '❤️'}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{post.category}</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center text-gray-500 text-sm mb-3">
                  <Calendar className="w-4 h-4 mr-1" />
                  {post.date}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-gray-500 text-sm">
                    <User className="w-4 h-4 mr-1" />
                    {post.author}
                  </div>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center"
                  >
                    Read
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-lg mb-6 opacity-90">
            Subscribe to our newsletter for the latest stories, tips, and platform updates.
          </p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              required
            />
            <button
              type="submit"
              className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Subscribe
            </button>
          </form>
          <p className="text-sm mt-4 opacity-75">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6">
            Have a story you'd like to share? We'd love to hear from you.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
