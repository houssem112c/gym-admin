'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { removeToken } from '@/lib/api';
import {
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineTag,
  HiOutlineFire,
  HiOutlineCalendar,
  HiOutlineAcademicCap,
  HiOutlineClipboardList,
  HiOutlinePhotograph,
  HiOutlineLocationMarker,
  HiOutlineScale,
  HiOutlineMail,
  HiOutlineChatAlt,
  HiOutlineLogout
} from 'react-icons/hi';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: HiOutlineChartBar },
  { href: '/users', label: 'Members', icon: HiOutlineUsers },
  { href: '/community', label: 'Community', icon: HiOutlineChatAlt },
  { href: '/categories', label: 'Categories', icon: HiOutlineTag },
  { href: '/courses', label: 'Classes', icon: HiOutlineFire },
  { href: '/schedules', label: 'Time Table', icon: HiOutlineCalendar },
  { href: '/exercises', label: 'Exercises', icon: HiOutlineAcademicCap },
  { href: '/workout-plans', label: 'Programs', icon: HiOutlineClipboardList },
  { href: '/stories', label: 'Stories', icon: HiOutlinePhotograph },
  { href: '/locations', label: 'Gyms', icon: HiOutlineLocationMarker },
  { href: '/bmi', label: 'Health Hub', icon: HiOutlineScale },
  { href: '/contacts', label: 'Inquiries', icon: HiOutlineMail },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    router.push('/');
  };

  return (
    <nav className="relative h-screen flex flex-col w-72 bg-surface-950 border-r border-surface-900/50 backdrop-blur-3xl overflow-hidden z-50">
      {/* Decorative Blur */}
      <div className="absolute top-0 left-0 w-full h-32 bg-primary-500/10 blur-[100px] -z-10 animate-pulse-slow"></div>

      <div className="p-8 pb-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-surface-900 flex items-center justify-center p-2 border border-surface-800">
              <Image
                src="/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="object-contain transform group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white">
              URBAN<span className="text-primary-500">GYM</span>
            </h1>
            <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest">Admin Engine</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-x-3 px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-300 relative overflow-hidden ${isActive
                  ? 'bg-primary-500/10 text-primary-400'
                  : 'text-surface-400 hover:text-surface-100 hover:bg-surface-900/50'
                  }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full"></div>
                )}
                <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary-500' : 'text-surface-500 group-hover:text-primary-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-surface-900/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-x-3 px-4 py-3 text-sm font-bold text-accent-500 hover:text-accent-400 hover:bg-accent-500/5 rounded-2xl transition-all duration-300 active:scale-95"
        >
          <HiOutlineLogout className="w-5 h-5" />
          Logout
        </button>
      </div>
    </nav>
  );
}
