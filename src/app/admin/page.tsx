'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users, Shield, Activity, FileText, TrendingUp, AlertTriangle,
  Globe, MapPin, Clock, Eye, Trash2, Ban, CheckCircle, XCircle,
  RefreshCw, Search, Filter, ChevronRight, BarChart3, Settings,
  Database, Wifi, WifiOff, UserX, UserCheck
} from 'lucide-react';

const OWNER_EMAILS = ['mishteh144@gmail.com', 'golearnx@gmail.com'];

interface User {
  id: string;
  fullName: string;
  email: string;
  userType: string;
  location: string;
  createdAt: string;
  signupIp?: string;
  signupCountry?: string;
  signupCity?: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  isSuspicious?: boolean;
  suspiciousReason?: string;
  _count?: {
    requests: number;
    donations: number;
  };
}

interface ActivityItem {
  id: string;
  type: string;
  userId?: string;
  requestId?: string;
  metadata?: string;
  createdAt: string;
  user?: { fullName: string; email: string };
  request?: { title: string };
}

interface Stats {
  totalUsers: number;
  totalRequests: number;
  totalDonations: number;
  suspiciousUsers: number;
  todaySignups: number;
  activeRequests: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'activity' | 'security'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user || !OWNER_EMAILS.includes(session.user.email || '')) {
      router.push('/dashboard');
      return;
    }

    fetchData();
  }, [session, status, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch users with security info
      const usersRes = await fetch('/api/admin/users?includeSecurityInfo=true&limit=100');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }

      // Fetch activities
      const activityRes = await fetch('/api/admin/activity?limit=50');
      if (activityRes.ok) {
        const activityData = await activityRes.json();
        setActivities(activityData.activities || []);
      }

      // Fetch security logs
      const securityRes = await fetch('/api/admin/security?limit=30');
      if (securityRes.ok) {
        const securityData = await securityRes.json();
        setSecurityLogs(securityData.logs || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (OWNER_EMAILS.includes(email)) {
      alert('Cannot delete admin accounts');
      return;
    }
    
    if (!confirm(`Delete user ${email}? This will also delete all their requests, donations, and activity.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
        alert('User deleted successfully');
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      alert('Error deleting user');
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('Delete this activity?')) return;
    
    try {
      const res = await fetch(`/api/admin/activity/${activityId}`, { method: 'DELETE' });
      if (res.ok) {
        setActivities(activities.filter(a => a.id !== activityId));
      }
    } catch (error) {
      alert('Error deleting activity');
    }
  };

  const handleClearUserActivity = async (userId: string) => {
    if (!confirm('Clear ALL activity for this user?')) return;
    
    try {
      const res = await fetch(`/api/admin/activity/clear-user/${userId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
        alert('User activity cleared');
      }
    } catch (error) {
      alert('Error clearing activity');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.signupCountry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.signupCity?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (userFilter === 'all') return matchesSearch;
    if (userFilter === 'suspicious') return matchesSearch && user.isSuspicious;
    if (userFilter === 'requester') return matchesSearch && user.userType === 'REQUESTER';
    if (userFilter === 'donor') return matchesSearch && user.userType === 'DONOR';
    return matchesSearch;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-ZA', { 
      dateStyle: 'short', 
      timeStyle: 'short' 
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-rose-500" />
              <div>
                <h1 className="text-xl font-bold">Admin Control Center</h1>
                <p className="text-sm text-gray-400">{session?.user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <Link
                href="/"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-lg transition"
              >
                Back to Site
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-sm">Total Users</span>
            </div>
            <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <FileText className="w-5 h-5" />
              <span className="text-sm">Requests</span>
            </div>
            <p className="text-2xl font-bold">{stats?.totalRequests || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-purple-400 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm">Donations</span>
            </div>
            <p className="text-2xl font-bold">{stats?.totalDonations || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">Suspicious</span>
            </div>
            <p className="text-2xl font-bold">{stats?.suspiciousUsers || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <UserCheck className="w-5 h-5" />
              <span className="text-sm">Today</span>
            </div>
            <p className="text-2xl font-bold">{stats?.todaySignups || 0}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 text-rose-400 mb-2">
              <Activity className="w-5 h-5" />
              <span className="text-sm">Active</span>
            </div>
            <p className="text-2xl font-bold">{stats?.activeRequests || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-700 pb-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'activity', label: 'Activity', icon: Activity },
            { id: 'security', label: 'Security', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-rose-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Recent Users
              </h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {users.slice(0, 10).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {user.signupCity || user.location || 'Unknown'}, {user.signupCountry || ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.userType === 'ADMIN' ? 'bg-rose-500/20 text-rose-400' :
                        user.userType === 'REQUESTER' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {user.userType}
                      </span>
                      {user.isSuspicious && (
                        <span className="ml-2 px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400">
                          ⚠️
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-400" />
                Recent Activity
              </h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {activities.slice(0, 10).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{activity.type?.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-400">
                        {activity.user?.fullName || 'Unknown'} - {activity.request?.title || ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{formatDate(activity.createdAt)}</span>
                      <button
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="p-1 text-gray-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Alerts */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 md:col-span-2">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-400" />
                Security Alerts
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {securityLogs.filter(log => log.isVpn || log.isProxy || log.eventType === 'LOGIN_FAILED').slice(0, 6).map((log) => (
                  <div key={log.id} className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-yellow-400">{log.eventType?.replace(/_/g, ' ')}</span>
                      {log.isVpn && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded">VPN</span>}
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{log.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {log.city}, {log.country} • IP: {log.ipAddress}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h2 className="text-lg font-bold">User Management</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm focus:ring-rose-500 focus:border-rose-500 w-full md:w-auto"
                  />
                </div>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm"
                >
                  <option value="all">All Users</option>
                  <option value="suspicious">Suspicious Only</option>
                  <option value="requester">Requesters</option>
                  <option value="donor">Donors</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="text-left p-3">User</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Location</th>
                    <th className="text-left p-3">IP / Country</th>
                    <th className="text-left p-3">Joined</th>
                    <th className="text-left p-3">Last Login</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className={`border-b border-gray-700 hover:bg-gray-700/30 ${user.isSuspicious ? 'bg-yellow-500/5' : ''}`}>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{user.fullName}</p>
                          <p className="text-gray-400 text-xs">{user.email}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.userType === 'ADMIN' ? 'bg-rose-500/20 text-rose-400' :
                          user.userType === 'REQUESTER' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {user.userType}
                        </span>
                        {user.isSuspicious && (
                          <span className="ml-1 text-yellow-400" title={user.suspiciousReason}>⚠️</span>
                        )}
                      </td>
                      <td className="p-3 text-gray-400">{user.location || '-'}</td>
                      <td className="p-3">
                        <div className="text-xs">
                          <p className="text-gray-300">{user.signupIp || '-'}</p>
                          <p className="text-gray-500">{user.signupCity}, {user.signupCountry}</p>
                        </div>
                      </td>
                      <td className="p-3 text-gray-400 text-xs">{formatDate(user.createdAt)}</td>
                      <td className="p-3 text-gray-400 text-xs">{user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="p-1 text-gray-400 hover:text-blue-400"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {!OWNER_EMAILS.includes(user.email) && (
                            <>
                              <button
                                onClick={() => handleClearUserActivity(user.id)}
                                className="p-1 text-gray-400 hover:text-yellow-400"
                                title="Clear Activity"
                              >
                                <Activity className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id, user.email)}
                                className="p-1 text-gray-400 hover:text-red-400"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Activity Management</h2>
              <button
                onClick={async () => {
                  if (confirm('Clear ALL site activity? This cannot be undone.')) {
                    const res = await fetch('/api/admin/activity/clear-all', { method: 'DELETE' });
                    if (res.ok) {
                      fetchData();
                      alert('All activity cleared');
                    }
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
              >
                Clear All Activity
              </button>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        activity.type === 'NEW_REQUEST' ? 'bg-blue-500/20 text-blue-400' :
                        activity.type === 'DONATION' ? 'bg-green-500/20 text-green-400' :
                        activity.type === 'LIKE' ? 'bg-pink-500/20 text-pink-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {activity.type?.replace(/_/g, ' ')}
                      </span>
                      <span className="text-gray-300">{activity.user?.fullName || 'Unknown User'}</span>
                      {activity.user?.email && (
                        <span className="text-gray-500 text-sm">({activity.user.email})</span>
                      )}
                    </div>
                    {activity.request && (
                      <p className="text-sm text-gray-400 mt-1">
                        Request: {activity.request.title}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{formatDate(activity.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteActivity(activity.id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Suspicious Users */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                Suspicious Users
              </h2>
              <div className="space-y-3">
                {users.filter(u => u.isSuspicious).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                      <p className="text-xs text-yellow-400 mt-1">{user.suspiciousReason}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>IP: {user.signupIp}</span>
                        <span>{user.signupCity}, {user.signupCountry}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleClearUserActivity(user.id)}
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
                      >
                        Clear Activity
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {users.filter(u => u.isSuspicious).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No suspicious users detected</p>
                )}
              </div>
            </div>

            {/* Security Logs */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-rose-400" />
                Security Logs
              </h2>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {securityLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          log.eventType?.includes('FAILED') ? 'bg-red-500/20 text-red-400' :
                          log.eventType?.includes('SIGNUP') ? 'bg-blue-500/20 text-blue-400' :
                          log.eventType?.includes('SUSPICIOUS') ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {log.eventType?.replace(/_/g, ' ')}
                        </span>
                        {log.isVpn && <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded-full">VPN</span>}
                        {log.isProxy && <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full">Proxy</span>}
                      </div>
                      <p className="text-sm text-gray-300 mt-1">{log.email}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Wifi className="w-3 h-3" />
                          {log.ipAddress}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {log.city || 'Unknown'}, {log.country || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                      {log.details && (
                        <p className="text-xs text-gray-400 mt-1 bg-gray-800 p-2 rounded">{log.details}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/requests" className="flex items-center gap-3 p-4 bg-gray-800 rounded-xl border border-gray-700 hover:bg-gray-700 transition">
            <Database className="w-6 h-6 text-green-400" />
            <span>Manage Requests</span>
          </Link>
          <Link href="/admin/transactions" className="flex items-center gap-3 p-4 bg-gray-800 rounded-xl border border-gray-700 hover:bg-gray-700 transition">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            <span>Transactions</span>
          </Link>
          <Link href="/admin/security" className="flex items-center gap-3 p-4 bg-gray-800 rounded-xl border border-gray-700 hover:bg-gray-700 transition">
            <Shield className="w-6 h-6 text-rose-400" />
            <span>Security Center</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
