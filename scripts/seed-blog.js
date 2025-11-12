const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const initialPosts = [
  {
    title: 'How MISHTEH Changed My Life: Sarah\'s Story',
    slug: 'sarah-mishteh-success-story',
    excerpt: 'A single mother shares how the MISHTEH community helped her overcome medical debt and rebuild her life.',
    content: 'When Sarah faced unexpected medical bills after emergency surgery, she didn\'t know where to turn. As a single mother working two jobs, the $15,000 debt seemed insurmountable. Through MISHTEH, compassionate donors rallied around her story...',
    author: 'MISHTEH Team',
    category: 'Success Stories',
    imageUrl: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800',
    isExternal: false,
  },
  {
    title: 'The Biblical Foundation of Giving',
    slug: 'biblical-foundation-of-giving',
    excerpt: 'Exploring scripture\'s teachings on generosity, compassion, and helping those in need.',
    content: 'Throughout scripture, we are called to help those in need. From the Old Testament commandments to care for widows and orphans, to Jesus\' teachings about giving to the poor...',
    author: 'Pastor Michael',
    category: 'Faith & Inspiration',
    imageUrl: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800',
    isExternal: false,
  },
  {
    title: '5 Ways to Make Your Donation Go Further',
    slug: 'maximize-donation-impact',
    excerpt: 'Practical tips for donors who want to create the greatest positive impact with their charitable giving.',
    content: 'Every donation makes a difference, but there are strategic ways to ensure your giving creates maximum impact. Here are five proven approaches...',
    author: 'Emily Johnson',
    category: 'Donor Tips',
    imageUrl: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800',
    isExternal: false,
  },
];

async function seedBlog() {
  console.log('Seeding initial blog posts...');

  for (const post of initialPosts) {
    const existing = await prisma.blogPost.findUnique({
      where: { slug: post.slug },
    });

    if (!existing) {
      await prisma.blogPost.create({
        data: post,
      });
      console.log(`✓ Created: ${post.title}`);
    } else {
      console.log(`- Skipped (exists): ${post.title}`);
    }
  }

  console.log('Blog seeding complete!');
}

seedBlog()
  .catch((e) => {
    console.error('Error seeding blog:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
