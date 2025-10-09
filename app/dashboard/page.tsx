'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { coursesAPI, videosAPI, contactsAPI, bmiAPI } from '@/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    courses: 0,
    videos: 0,
    unreadMessages: 0,
    categories: 0,
    bmiRecords: 0,
    bmiUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [courses, videos, contacts, categories, bmiStats] = await Promise.all([
          coursesAPI.getAll(),
          videosAPI.getAll(),
          contactsAPI.getAll(),
          videosAPI.getCategories(),
          bmiAPI.getStats().catch(() => ({ success: false, data: { totalRecords: 0, totalUsers: 0 } })),
        ]);

        setStats({
          courses: courses.length,
          videos: videos.length,
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
    { label: 'Total Courses', value: stats.courses, icon: '🏋️', color: 'bg-blue-500' },
    { label: 'Total Videos', value: stats.videos, icon: '🎥', color: 'bg-purple-500' },
    { label: 'BMI Records', value: stats.bmiRecords, icon: '📏', color: 'bg-orange-500' },
    { label: 'BMI Users', value: stats.bmiUsers, icon: '👥', color: 'bg-teal-500' },
    { label: 'Unread Messages', value: stats.unreadMessages, icon: '✉️', color: 'bg-red-500' },
    { label: 'Video Categories', value: stats.categories, icon: '📁', color: 'bg-green-500' },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <AdminNav />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Command center for your 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 font-bold"> gym management system</span>
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-500 mx-auto mb-6"></div>
              <p className="text-xl text-gray-300 font-medium">Loading system metrics...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700 hover:border-primary-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-primary-500/20"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className={`${card.color} text-white text-4xl p-4 rounded-2xl shadow-lg`}>
                      {card.icon}
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-extrabold text-white">{card.value}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 font-bold text-lg">{card.label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">🚀 Quick Actions</h2>
              <div className="space-y-4">
                <a
                  href="/courses"
                  className="block px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-primary-500/25 text-center font-bold"
                >
                  🏋️ Manage Courses
                </a>
                <a
                  href="/schedules"
                  className="block px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-blue-500/25 text-center font-bold"
                >
                  📅 Manage Schedules
                </a>
                <a
                  href="/videos"
                  className="block px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25 text-center font-bold"
                >
                  🎥 Manage Videos
                </a>
                <a
                  href="/bmi"
                  className="block px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/25 text-center font-bold"
                >
                  📏 Manage BMI Records
                </a>
                <a
                  href="/contacts"
                  className="block px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/25 text-center font-bold"
                >
                  ✉️ View Messages
                </a>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">⚡ System Status</h2>
              <div className="space-y-6">
                <div className="flex justify-between items-center py-4 px-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <span className="text-gray-300 font-medium">System Status</span>
                  <span className="text-primary-400 font-bold flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                    Online
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 px-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <span className="text-gray-300 font-medium">Backend API</span>
                  <span className="text-primary-400 font-bold flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                    Connected
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 px-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <span className="text-gray-300 font-medium">Database</span>
                  <span className="text-primary-400 font-bold flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                    Active
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 px-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <span className="text-gray-300 font-medium">Last Updated</span>
                  <span className="text-white font-bold">Just now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
