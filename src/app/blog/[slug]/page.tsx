import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, User, ArrowLeft, ExternalLink } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  });

  if (!post) notFound();

  if (post.isExternal && post.sourceUrl) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-soft p-8 text-center">
            <ExternalLink className="w-16 h-16 text-primary-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
            <p className="text-gray-600 mb-6">This article is hosted externally.</p>
            <a
              href={post.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl"
            >
              Read Full Article <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/blog" className="inline-flex items-center gap-2 text-primary-600 mb-8">
          <ArrowLeft className="w-5 h-5" /> Back to Stories
        </Link>
        <article className="bg-white rounded-2xl shadow-soft overflow-hidden">
          {post.imageUrl && (
            <img src={post.imageUrl} alt={post.title} className="w-full h-96 object-cover" />
          )}
          <div className="p-12">
            <span className="px-4 py-2 bg-primary-50 text-primary-600 text-sm font-semibold rounded-full">
              {post.category}
            </span>
            <h1 className="text-5xl font-bold mt-4 mb-6">{post.title}</h1>
            <div className="flex gap-6 text-gray-600 mb-8 pb-8 border-b">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" /> {post.author}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" /> {new Date(post.publishedAt).toLocaleDateString()}
              </div>
            </div>
            <div className="text-xl text-gray-700 mb-8 border-l-4 border-primary-600 pl-6">{post.excerpt}</div>
            <div className="prose max-w-none">
              {post.content.split('\n').map((p: string, i: number) => p.trim() && <p key={i} className="mb-4">{p}</p>)}
            </div>
            {post.sourceUrl && (
              <div className="mt-8 pt-8 border-t">
                <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary-600">
                  <ExternalLink className="w-5 h-5" /> Read original
                </a>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
