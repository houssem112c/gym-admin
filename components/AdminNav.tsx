'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { removeToken } from '@/lib/api';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/categories', label: 'Categories', icon: '🏷️' },
  { href: '/courses', label: 'Courses', icon: '🏋️' },
  { href: '/schedules', label: 'Schedules', icon: '📅' },
  { href: '/videos', label: 'Videos', icon: '🎥' },
  { href: '/locations', label: 'Locations', icon: '📍' },
  { href: '/bmi', label: 'BMI Records', icon: '📏' },
  { href: '/contacts', label: 'Messages', icon: '✉️' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    removeToken();
    router.push('/');
  };

  return (
    <nav className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white w-72 min-h-screen p-6 shadow-2xl border-r border-gray-700/50">
      <div className="mb-10">
        <div className="text-center mb-6">
          {/* Logo */}
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto mb-3 rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/logo.jpg"
                alt="Urban Gym Logo"
                width={64}
                height={64}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </div>
          
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent mb-2">
            URBAN GYM 
          </h1>
          <p className="text-gray-400 text-sm font-medium">Management System</p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-primary-500 to-primary-400 mx-auto mt-3"></div>
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-4 px-5 py-4 rounded-xl font-medium transition-all duration-300 ${
                pathname === item.href
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30 transform scale-105'
                  : 'text-gray-300 hover:bg-gradient-to-r hover:from-gray-800 hover:to-gray-700 hover:text-white hover:shadow-lg hover:transform hover:scale-102'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8 border-t border-gray-700/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-xl text-gray-300 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-500 hover:text-white transition-all duration-300 font-medium hover:shadow-lg hover:shadow-red-500/30 hover:transform hover:scale-105"
        >
          <span className="text-2xl">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
