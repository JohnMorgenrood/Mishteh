'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const register = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true);
    try {
      const body = new FormData();
      body.append('fullName', form.fullName.trim());
      body.append('email', form.email.trim().toLowerCase());
      body.append('password', form.password);
      const response = await fetch('/api/auth/register', { method: 'POST', body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');
      const result = await signIn('credentials', { email: form.email.trim().toLowerCase(), password: form.password, redirect: false });
      router.push(result?.ok ? '/dashboard' : '/auth/login');
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to create your account');
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    await signIn('google', { callbackUrl: '/auth/callback' });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg"><UserPlus className="h-7 w-7" /></div>
          <h1 className="mt-5 text-3xl font-bold text-gray-900">Join MISHTEH</h1>
          <p className="mt-2 text-sm text-gray-600">Start with seven days free, then renew for only R10 per month. No automatic deductions.</p>
        </div>

        <form onSubmit={register} className="space-y-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-xl sm:p-8">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">{error}</div>}
          <div><label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-gray-700">Full Name</label><input id="fullName" required autoComplete="name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200" placeholder="John Doe" /></div>
          <div><label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">Email Address</label><input id="email" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200" placeholder="you@example.com" /></div>
          <div><label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">Password</label><div className="relative"><input id="password" type={showPassword ? 'text' : 'password'} required minLength={8} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 pr-12 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Show or hide password" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div><p className="mt-1 text-xs text-gray-500">At least 8 characters</p></div>
          <div><label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-700">Confirm Password</label><div className="relative"><input id="confirmPassword" type={showConfirm ? 'text' : 'password'} required minLength={8} autoComplete="new-password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 pr-12 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200" /><button type="button" onClick={() => setShowConfirm(!showConfirm)} aria-label="Show or hide confirmation password" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></div>
          <button disabled={loading} className="w-full rounded-xl bg-primary-600 px-5 py-3 font-bold text-white transition hover:bg-primary-700 disabled:opacity-50">{loading ? 'Creating account…' : 'Create Account'}</button>
          <div className="flex items-center gap-3"><div className="h-px flex-1 bg-gray-200" /><span className="text-xs text-gray-500">or</span><div className="h-px flex-1 bg-gray-200" /></div>
          <button type="button" onClick={google} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"><span className="text-lg font-bold text-blue-600">G</span> Continue with Google</button>
          <p className="text-center text-sm text-gray-600">Already have an account? <Link href="/auth/login" className="font-semibold text-primary-600 hover:underline">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}
