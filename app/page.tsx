'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, saveToken } from '@/lib/api';
import BackendHealthCheck from '@/components/BackendHealthCheck';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineShieldCheck, HiOutlineCheckCircle } from 'react-icons/hi';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });

      // Check if user has admin or coach role
      if (response.user.role !== 'ADMIN' && response.user.role !== 'COACH') {
        setError('Access denied. Administrative privileges required.');
        return;
      }

      saveToken(response.access_token || response.accessToken);

      // Also save token in cookie for middleware
      const token = response.access_token || response.accessToken;
      document.cookie = `admin_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backend Health Check - only show if backend is not healthy */}
      {!backendHealthy && (
        <BackendHealthCheck
          onHealthy={() => setBackendHealthy(true)}
          showOnSuccess={false}
        />
      )}

      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-surface-950 via-surface-900 to-surface-950">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-accent-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
          </div>
        </div>

        {/* Login Card */}
        <div className="relative max-w-md w-full mx-4 animate-scale-in">
          <div className="glass-card p-10 border border-surface-800/50 shadow-2xl">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 mb-6">
                <HiOutlineShieldCheck className="w-8 h-8 text-primary-500" />
              </div>
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Command Center</h1>
              <p className="text-surface-400 font-medium text-sm">Authenticate administrative access</p>
            </div>

            {/* Backend Status Indicator */}
            {backendHealthy && (
              <div className="mb-6 p-4 bg-primary-500/5 border border-primary-500/20 rounded-2xl animate-fade-in">
                <div className="flex items-center gap-3">
                  <HiOutlineCheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-black text-primary-500 uppercase tracking-widest">System Online</p>
                    <p className="text-[10px] font-bold text-surface-500">Backend connection established</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-accent-500/5 border border-accent-500/20 rounded-2xl animate-scale-in">
                <p className="text-accent-500 text-sm font-bold">{error}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <HiOutlineMail className="w-3.5 h-3.5 text-primary-500" />
                  Identity Vector
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="premium-input"
                  placeholder="admin@system.io"
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <HiOutlineLockClosed className="w-3.5 h-3.5 text-accent-500" />
                  Security Passphrase
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="premium-input"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="premium-button-primary w-full h-14 uppercase tracking-widest text-xs mt-8"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Authenticating...
                  </div>
                ) : (
                  'Authorize Access'
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-surface-800/50">
              <p className="text-center text-[10px] font-bold text-surface-600 uppercase tracking-widest">
                Gym Management System v2.0
              </p>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent-500/10 rounded-full blur-2xl"></div>
        </div>
      </div>
    </>
  );
}
