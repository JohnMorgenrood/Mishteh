import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import QuickDonateWidget from '@/components/QuickDonateWidget';
import { AuthProvider } from '@/components/AuthProvider';
import LoadingScreen from '@/components/LoadingScreen';
import { ToastProvider } from '@/components/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://mishteh.org'),
  title: 'MISHTEH - Connect Donors with People in Need',
  description: 'A platform connecting generous donors with people who need help with food, rent, bills, and more.',
  keywords: ['donation', 'charity', 'help', 'community', 'support', 'fundraising'],
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/assets/logo.png', type: 'image/png' }],
    shortcut: '/assets/logo.png',
    apple: '/assets/logo.png',
  },
  openGraph: {
    title: 'MISHTEH - Connecting People Through Kindness',
    description: 'Join our community of donors and help people in need.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#15803d',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <AuthProvider>
          <ToastProvider>
            <LoadingScreen />
            <Navbar />
            <main className="w-full min-w-0 flex-grow pb-20 md:pb-0">
              {children}
            </main>
            <Footer />
            <QuickDonateWidget />
            <MobileNav />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
