import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, User, ArrowLeft, Share2, Heart } from 'lucide-react';

// Sample blog posts data (same as blog page)
const blogPosts = [
  {
    id: '1',
    title: 'How Sarah Rebuilt Her Life After Unexpected Medical Bills',
    excerpt: 'Meet Sarah, a single mother who faced crushing medical debt after an emergency surgery. Through the MISHTEH community, she found hope and support that changed everything.',
    content: `
      <p>Sarah Thompson never expected her life to change so dramatically in a single day. As a single mother of two working as a teacher in Phoenix, Arizona, she had always managed to make ends meet—until an unexpected health emergency turned her world upside down.</p>

      <h2>The Crisis</h2>
      <p>In March 2025, Sarah experienced severe abdominal pain that sent her to the emergency room. What she thought would be a quick check-up turned into emergency surgery for a ruptured appendix. Without comprehensive health insurance, the medical bills quickly piled up to over $45,000.</p>

      <p>"I was terrified," Sarah recalls. "I had a little savings, but nothing close to what I needed. I didn't know how I would pay for my treatment and still keep a roof over my children's heads."</p>

      <h2>Finding MISHTEH</h2>
      <p>A friend told Sarah about MISHTEH and encouraged her to create a request. Initially hesitant, Sarah finally decided to share her story on the platform, detailing her situation and uploading her medical bills for verification.</p>

      <p>"I felt vulnerable putting my story out there," she admits. "But I was also amazed by how quickly people responded with compassion and support."</p>

      <h2>The Community Response</h2>
      <p>Within 48 hours of posting her request, Sarah received her first donation of $50 from a donor in California. Then more donations started coming in—$25 here, $100 there, each one accompanied by encouraging messages.</p>

      <p>"People I had never met were helping me," Sarah says, her voice breaking with emotion. "Strangers were reading my story and deciding that it mattered. That I mattered."</p>

      <h2>The Impact</h2>
      <p>Over the course of three weeks, Sarah raised $38,000 through MISHTEH—enough to pay off the majority of her medical debt and arrange a payment plan for the remainder. But the impact went beyond just the money.</p>

      <p>"The messages of support gave me hope when I felt hopeless," Sarah explains. "People shared their own stories of hardship and recovery. I realized I wasn't alone in this struggle."</p>

      <h2>Paying It Forward</h2>
      <p>Today, Sarah is back on her feet financially and emotionally. She's made it her mission to help others on MISHTEH, donating small amounts whenever she can and always leaving encouraging messages.</p>

      <p>"I'll never forget what the MISHTEH community did for me," she says. "Now it's my turn to be that person for someone else who's struggling."</p>

      <h2>The Lesson</h2>
      <p>Sarah's story reminds us that behind every request on MISHTEH is a real person facing real challenges. It shows the power of community and the difference that compassion can make in someone's life.</p>

      <p><em>"We're all just one emergency away from needing help,"</em> Sarah reflects. <em>"MISHTEH taught me that asking for help isn't weakness—it's courage. And giving help isn't charity—it's humanity."</em></p>
    `,
    author: 'MISHTEH Team',
    date: 'November 10, 2025',
    category: 'Success Stories',
    slug: 'sarah-medical-bills-success',
    readTime: '5 min read',
  },
  {
    id: '2',
    title: '5 Ways to Maximize Your Impact as a Donor',
    excerpt: 'Want to make the most of your charitable giving? Here are five proven strategies to ensure your donations create the greatest positive impact.',
    content: `
      <p>Whether you're new to charitable giving or a seasoned donor, making your contributions count is always important. Here are five strategies to maximize the impact of your generosity on MISHTEH.</p>

      <h2>1. Donate to Verified Requests</h2>
      <p>Our verification system ensures that requests are legitimate and urgent. Look for the blue verification badge when browsing requests. Verified requests have been reviewed by our team and have supporting documentation.</p>

      <h2>2. Support Critical Needs First</h2>
      <p>Requests marked as "CRITICAL" urgency often involve time-sensitive situations like eviction notices, utility shutoffs, or medical emergencies. These families need help immediately.</p>

      <h2>3. Consider Recurring Small Donations</h2>
      <p>Instead of one large donation, consider making smaller recurring donations to multiple requests. $20 per month to five different families creates ongoing impact and helps more people.</p>

      <h2>4. Share Stories That Move You</h2>
      <p>Your network might include someone willing to help. Share compelling requests on social media (with the requester's permission) to amplify their reach.</p>

      <h2>5. Leave Encouraging Messages</h2>
      <p>Sometimes words of support matter as much as financial help. Leave a message with your donation to let recipients know someone cares about their struggle.</p>
    `,
    author: 'Emily Johnson',
    date: 'November 8, 2025',
    category: 'Donor Tips',
    slug: 'maximize-donor-impact',
    readTime: '4 min read',
  },
  // Add other posts here...
];

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8 font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <span className="px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full">
              {post.category}
            </span>
            <span className="text-gray-500 text-sm">{post.readTime}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-6 text-gray-600">
              <div className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                <span>{post.date}</span>
              </div>
            </div>

            <button className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium">
              <Share2 className="w-5 h-5" />
              <span>Share</span>
            </button>
          </div>
        </header>

        {/* Featured Image Placeholder */}
        <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg h-96 flex items-center justify-center mb-12">
          <div className="text-center">
            <div className="text-8xl mb-4">
              {post.category === 'Success Stories' && '🌟'}
              {post.category === 'Donor Tips' && '💡'}
              {post.category === 'Platform Updates' && '📢'}
              {post.category === 'Inspiration' && '❤️'}
            </div>
            <p className="text-primary-900 font-semibold">{post.category}</p>
          </div>
        </div>

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg p-8 mb-12">
          <div className="flex items-start space-x-4">
            <Heart className="w-8 h-8 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-2xl font-bold mb-2">Inspired by this story?</h3>
              <p className="mb-4 opacity-90">
                You can make a difference in someone's life today. Browse active requests and find a cause that resonates with you.
              </p>
              <Link
                href="/requests"
                className="inline-block bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Browse Requests
              </Link>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        <div className="border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">More Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogPosts
              .filter((p) => p.slug !== post.slug)
              .slice(0, 2)
              .map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <span className="text-sm text-primary-600 font-medium">{relatedPost.category}</span>
                  <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3 line-clamp-2">
                    {relatedPost.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{relatedPost.excerpt}</p>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    {relatedPost.date}
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </article>
    </div>
  );
}
