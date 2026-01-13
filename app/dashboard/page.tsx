'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { coursesAPI, contactsAPI, bmiAPI, categoriesAPI } from '@/lib/api';
import { useBackendHealth } from '@/lib/useBackendHealth';
import {
  HiOutlineUserGroup,
  HiOutlineScale,
  HiOutlineAcademicCap,
  HiOutlineMail,
  HiOutlineShieldCheck,
  HiOutlineDatabase,
  HiOutlineTerminal,
  HiOutlineLightningBolt
} from 'react-icons/hi';

export default function Dashboard() {
  const { isHealthy, isChecking, error, lastChecked, checkHealth } = useBackendHealth(true);
  const [stats, setStats] = useState({
    courses: 0,
    unreadMessages: 0,
    categories: 0,
    bmiRecords: 0,
    bmiUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [courses, contacts, categories, bmiStats] = await Promise.all([
          coursesAPI.getAll(),
          contactsAPI.getAll(),
          categoriesAPI.getAll(),
          bmiAPI.getStats().catch(() => ({ success: false, data: { totalRecords: 0, totalUsers: 0 } })),
        ]);

        setStats({
          courses: courses.length,
          unreadMessages: contacts.filter((c: any) => !c.isRead).length,
          categories: categories.length,
          bmiRecords: bmiStats.success ? bmiStats.data.totalRecords : 0,
          bmiUsers: bmiStats.success ? bmiStats.data.totalUsers : 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Active Members', value: stats.bmiUsers, icon: HiOutlineUserGroup, color: 'text-primary-500', bg: 'bg-primary-500/10' },
    { label: 'Classes Offered', value: stats.courses, icon: HiOutlineAcademicCap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Health Log', value: stats.bmiRecords, icon: HiOutlineScale, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'New Inquiries', value: stats.unreadMessages, icon: HiOutlineMail, color: 'text-accent-500', bg: 'bg-accent-500/10' },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminNav />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in">
            <div>
              <h1 className="text-5xl font-black text-white tracking-tighter">
                DASHBOARD <span className="text-primary-500">.</span>
              </h1>
              <p className="text-surface-400 mt-2 font-medium">Welcome back, Administrator. Here's your gym's performance today.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-2xl glass-card flex items-center gap-2 border ${isHealthy ? 'border-primary-500/20' : 'border-accent-500/20'}`}>
                <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-primary-500 animate-pulse' : 'bg-accent-500'}`}></div>
                <span className={`text-xs font-bold uppercase tracking-widest ${isHealthy ? 'text-primary-400' : 'text-accent-400'}`}>
                  {isChecking ? 'Syncing...' : isHealthy ? 'System Stable' : 'System Alert'}
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 bg-primary-500/20 blur-xl animate-pulse"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
                {statCards.map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.label}
                      className="glass-card p-6 group hover:border-primary-500/50 relative overflow-hidden"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-500/5 rounded-full blur-2xl group-hover:bg-primary-500/10 transition-all"></div>
                      <div className="flex justify-between items-start mb-6">
                        <div className={`p-3 rounded-2xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform duration-500`}>
                          <Icon className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-4xl font-black text-white tracking-tighter">{card.value}</p>
                        <p className="text-xs font-bold text-surface-500 uppercase tracking-widest">{card.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Main Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                {/* Secondary Status Section */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="glass-card p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <HiOutlineShieldCheck className="w-6 h-6 text-primary-500" />
                      <h2 className="text-xl font-bold text-white">Security & Status</h2>
                    </div>

                    <div className="space-y-4">
                      {[
                        { label: 'API Engine', icon: HiOutlineLightningBolt, status: isHealthy ? 'success' : 'danger' },
                        { label: 'Main Data', icon: HiOutlineDatabase, status: isHealthy ? 'success' : 'danger' },
                        { label: 'Control Panel', icon: HiOutlineTerminal, status: 'success' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between p-4 bg-surface-950/40 rounded-2xl border border-surface-800/50">
                          <div className="flex items-center gap-3">
                            <item.icon className="w-4 h-4 text-surface-500" />
                            <span className="text-sm font-semibold text-surface-300">{item.label}</span>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${item.status === 'success' ? 'bg-primary-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-accent-500'}`}></div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={checkHealth}
                      disabled={isChecking}
                      className="premium-button-primary w-full group"
                    >
                      {isChecking ? 'Validating...' : 'Validate System'}
                      {!isChecking && <HiOutlineLightningBolt className="w-4 h-4 group-hover:animate-bounce" />}
                    </button>
                  </div>
                </div>

                {/* Quick Actions Section */}
                <div className="lg:col-span-2">
                  <div className="glass-card p-8 h-full">
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-black text-white tracking-tight">PRECISION CONTROL</h2>
                      <div className="px-3 py-1 bg-primary-500/10 text-primary-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-primary-500/20">
                        Quick Access
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { href: '/courses', label: 'Manage Classes', color: 'primary' },
                        { href: '/users', label: 'User Directory', color: 'blue' },
                        { href: '/exercises', label: 'Exercise Library', color: 'purple' },
                        { href: '/bmi', label: 'Health Hub', color: 'orange' },
                      ].map((action) => (
                        <a
                          key={action.href}
                          href={action.href}
                          className="group p-5 bg-surface-950/40 border border-surface-800/50 rounded-2xl hover:border-primary-500/50 transition-all flex flex-col justify-between h-32"
                        >
                          <div className="flex justify-between items-start">
                            <div className="w-10 h-10 bg-surface-900 rounded-xl flex items-center justify-center border border-surface-800 group-hover:bg-primary-500/10 group-hover:border-primary-500/30 transition-all">
                              <HiOutlineTerminal className="w-5 h-5 text-surface-500 group-hover:text-primary-500" />
                            </div>
                            <div className="w-6 h-6 rounded-full border border-surface-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                              <span className="text-xs text-primary-500">→</span>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors uppercase tracking-widest">{action.label}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
