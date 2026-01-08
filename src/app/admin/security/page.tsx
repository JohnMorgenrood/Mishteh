'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Shield, AlertTriangle, Globe, MapPin, Clock, User, 
  Eye, ChevronLeft, ChevronRight, Filter, RefreshCw,
  Wifi, WifiOff, CheckCircle, XCircle
} from 'lucide-react';

interface SecurityLog {
  id: string;
  eventType: string;
  email: string;
  ipAddress: string;
  country: string;
  city: string;
  region: string;
  isVpn: boolean;
  isProxy: boolean;
  userAgent: string;
  details: string;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    userType: string;
    isSuspicious: boolean;
  };
}

interface SuspiciousUser {
  id: string;
  fullName: string;
  email: string;
  userType: string;
  signupIp: string;
  signupCountry: string;
  signupCity: string;
  suspiciousReason: string;
  createdAt: string;
}

export default function SecurityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [suspiciousUsers, setSuspiciousUsers] = useState<SuspiciousUser[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [countryStats, setCountryStats] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (status === 'loading') return;
    
    // Only owner can access
    if (!session?.user || session.user.email !== 'mishteh144@gmail.com') {
      router.push('/');
      return;
    }

    fetchSecurityData();
  }, [session, status, filter, pagination.page]);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: '50',
      });
      
      if (filter !== 'all') {
        params.set('eventType', filter);
      }

      const res = await fetch(`/api/admin/security?${params}`);
      const data = await res.json();

      setLogs(data.logs || []);
      setSuspiciousUsers(data.suspiciousUsers || []);
      setStats(data.stats || {});
      setCountryStats(data.countryStats || []);
      setPagination(prev => ({ ...prev, ...data.pagination }));
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventBadge = (eventType: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      'SIGNUP_CREDENTIALS': { color: 'bg-blue-100 text-blue-800', label: 'Email Signup' },
      'SIGNUP_GOOGLE': { color: 'bg-purple-100 text-purple-800', label: 'Google Signup' },
      'LOGIN_SUCCESS': { color: 'bg-green-100 text-green-800', label: 'Login OK' },
      'LOGIN_FAILED': { color: 'bg-red-100 text-red-800', label: 'Login Failed' },
      'SUSPICIOUS_ACTIVITY': { color: 'bg-orange-100 text-orange-800', label: 'Suspicious' },
      'ADMIN_ACCESS_DENIED': { color: 'bg-red-100 text-red-800', label: 'Admin Denied' },
    };
    return badges[eventType] || { color: 'bg-gray-100 text-gray-800', label: eventType };
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-ZA', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin/blog" className="text-gray-500 hover:text-gray-700">
                <ChevronLeft className="w-5 h-5" />
              </Link>
              <Shield className="w-8 h-8 text-rose-500" />
              <h1 className="text-2xl font-bold text-gray-900">Security Monitor</h1>
            </div>
            <button
              onClick={fetchSecurityData}
              className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <User className="w-5 h-5" />
              <span className="text-sm">Email Signups</span>
            </div>
            <p className="text-2xl font-bold">{stats?.credentialSignups || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Globe className="w-5 h-5" />
              <span className="text-sm">Google Signups</span>
            </div>
            <p className="text-2xl font-bold">{stats?.googleSignups || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <XCircle className="w-5 h-5" />
              <span className="text-sm">Failed Logins</span>
            </div>
            <p className="text-2xl font-bold">{stats?.failedLogins || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <WifiOff className="w-5 h-5" />
              <span className="text-sm">VPN Users</span>
            </div>
            <p className="text-2xl font-bold">{stats?.vpnUsers || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-yellow-600 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm">Suspicious</span>
            </div>
            <p className="text-2xl font-bold">{stats?.suspiciousUsers || 0}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Suspicious Users */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Suspicious Users
              </h2>
              
              {suspiciousUsers.length === 0 ? (
                <p className="text-gray-500 text-sm">No suspicious users detected</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {suspiciousUsers.map((user) => (
                    <div key={user.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="font-medium text-gray-900">{user.fullName}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        {user.signupCity}, {user.signupCountry}
                      </div>
                      <p className="text-xs text-red-600 mt-1">{user.suspiciousReason}</p>
                      <p className="text-xs text-gray-400 mt-1">IP: {user.signupIp}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Country Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Signups by Country
              </h2>
              
              {countryStats.length === 0 ? (
                <p className="text-gray-500 text-sm">No data yet</p>
              ) : (
                <div className="space-y-2">
                  {countryStats.map((country, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-700">{country.country}</span>
                      <span className="text-sm font-medium text-gray-900">{country.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Security Logs */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Security Logs</h2>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">All Events</option>
                  <option value="SIGNUP_CREDENTIALS">Email Signups</option>
                  <option value="SIGNUP_GOOGLE">Google Signups</option>
                  <option value="LOGIN_SUCCESS">Successful Logins</option>
                  <option value="LOGIN_FAILED">Failed Logins</option>
                </select>
              </div>

              {logs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No security logs yet</p>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {logs.map((log) => {
                    const badge = getEventBadge(log.eventType);
                    return (
                      <div key={log.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge.color}`}>
                                {badge.label}
                              </span>
                              {log.isVpn && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                                  VPN
                                </span>
                              )}
                              {log.isProxy && (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                  Proxy
                                </span>
                              )}
                            </div>
                            
                            <p className="font-medium text-gray-900">{log.email}</p>
                            
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {log.city || 'Unknown'}, {log.country || 'Unknown'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Wifi className="w-4 h-4" />
                                {log.ipAddress}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatDate(log.createdAt)}
                              </span>
                            </div>

                            {log.details && (
                              <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                                {log.details}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
