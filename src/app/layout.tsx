import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import { AuthProvider } from '@/components/AuthProvider';
import LoadingScreen from '@/components/LoadingScreen';
import { ToastProvider } from '@/components/Toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MISHTEH - Connect Donors with People in Need',
  description: 'A platform connecting generous donors with people who need help with food, rent, bills, and more.',
  keywords: ['donation', 'charity', 'help', 'community', 'support', 'fundraising'],
  openGraph: {
    title: 'MISHTEH - Connecting People Through Kindness',
    description: 'Join our community of donors and help people in need.',
    type: 'website',
  },
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
            <main className="flex-grow pb-20 md:pb-0">
              {children}
            </main>
            <Footer />
            <MobileNav />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
