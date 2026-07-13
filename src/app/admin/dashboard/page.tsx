'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  AlertCircle, 
  DollarSign, 
  Eye,
  UserCog,
  Settings,
  BarChart3,
  Shield
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.userType !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const adminTools = [
    {
      title: 'Manage Requests',
      description: 'Review, approve, or reject help requests',
      icon: FileText,
      href: '/admin/requests',
      color: 'bg-blue-500',
      stats: 'View All'
    },
    {
      title: 'Manage Transactions',
      description: 'View and manage all donations and transactions',
      icon: DollarSign,
      href: '/admin/transactions',
      color: 'bg-green-500',
      stats: 'Financial'
    },
    {
      title: 'Manage Users',
      description: 'View, edit, and manage all user accounts',
      icon: Users,
      href: '/admin/users',
      color: 'bg-purple-500',
      stats: 'User Control'
    },
    {
      title: 'View User Dashboards',
      description: 'Preview how different user types see their dashboards',
      icon: Eye,
      href: '/admin/preview',
      color: 'bg-indigo-500',
      stats: 'Testing'
    },
    {
      title: 'Analytics & Stats',
      description: 'View platform statistics and analytics',
      icon: BarChart3,
      href: '/admin',
      color: 'bg-orange-500',
      stats: 'Insights'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {session?.user?.name}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </div>

        </div>

        {/* Admin Tools Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminTools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-primary-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className={`${tool.color} w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
                    <span className="text-xs font-semibold text-primary-600">{tool.stats} →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/requests?status=PENDING"
              className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-center font-semibold"
            >
              Review Pending Requests
            </Link>
            <Link
              href="/admin/users"
              className="px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-center font-semibold"
            >
              Manage Users
            </Link>
            <Link
              href="/admin/preview"
              className="px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-center font-semibold"
            >
              Preview Dashboards
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
