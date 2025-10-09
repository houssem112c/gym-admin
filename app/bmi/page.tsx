'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { bmiAPI } from '@/lib/api';
import { BmiRecord, BmiStats } from '@/types';

export default function BmiPage() {
  const [records, setRecords] = useState<BmiRecord[]>([]);
  const [stats, setStats] = useState<BmiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recordsResponse, statsResponse] = await Promise.all([
        bmiAPI.getAllRecords(),
        bmiAPI.getStats(),
      ]);

      if (recordsResponse.success) {
        setRecords(recordsResponse.data);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch BMI data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this BMI record?')) return;

    try {
      await bmiAPI.deleteRecord(id);
      setRecords(records.filter(record => record.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete record');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'bg-gradient-to-r from-primary-500/20 to-primary-600/20 text-primary-400 border border-primary-500/30';
      case 'CAUTION': return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 border border-yellow-500/30';
      case 'NOT_OK': return 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30';
      default: return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK': return '✅';
      case 'CAUTION': return '⚠️';
      case 'NOT_OK': return '❌';
      default: return '❓';
    }
  };

  // Filter records based on search term and selected user
  const filteredRecords = records.filter(record => {
    const matchesSearch = record.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = selectedUser === '' || record.user.id === selectedUser;
    return matchesSearch && matchesUser;
  });

  // Get unique users for filter dropdown
  const uniqueUsers = records.reduce((acc, record) => {
    if (!acc.find(user => user.id === record.user.id)) {
      acc.push(record.user);
    }
    return acc;
  }, [] as { id: string; email: string; name: string }[]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <AdminNav />
        <main className="flex-1 p-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-500 mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 font-medium">Loading BMI analytics...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <AdminNav />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white tracking-tight">
              BMI Management
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl">
              Monitor and analyze user 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 font-bold"> health metrics</span>
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-8 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 text-red-300 px-6 py-4 rounded-2xl backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">⚠</span>
                </div>
                {error}
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700 hover:border-primary-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-primary-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Total Records</p>
                    <p className="text-4xl font-extrabold text-white">{stats.totalRecords}</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg">
                    <span className="text-3xl">📊</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700 hover:border-primary-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-primary-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Active Users</p>
                    <p className="text-4xl font-extrabold text-white">{stats.totalUsers}</p>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                    <span className="text-3xl">👥</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700 hover:border-primary-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-primary-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Recent (7 days)</p>
                    <p className="text-4xl font-extrabold text-white">{stats.recentRecords}</p>
                  </div>
                  <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 p-4 rounded-2xl shadow-lg">
                    <span className="text-3xl">📈</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700 hover:border-primary-500 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-primary-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400 font-medium uppercase tracking-wider">Healthy (OK)</p>
                    <p className="text-4xl font-extrabold text-primary-400">{stats.statusDistribution.OK || 0}</p>
                  </div>
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 rounded-2xl shadow-lg">
                    <span className="text-3xl">✅</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Distribution */}
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700">
                <h3 className="text-2xl font-bold text-white mb-6">📊 Health Status</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 px-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <span className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white">✅</span>
                      </div>
                      <span className="text-gray-300 font-medium">Healthy (OK)</span>
                    </span>
                    <span className="font-bold text-primary-400 text-lg">{stats.statusDistribution.OK || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <span className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                        <span className="text-white">⚠️</span>
                      </div>
                      <span className="text-gray-300 font-medium">Caution</span>
                    </span>
                    <span className="font-bold text-yellow-400 text-lg">{stats.statusDistribution.CAUTION || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 px-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <span className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white">❌</span>
                      </div>
                      <span className="text-gray-300 font-medium">Not OK</span>
                    </span>
                    <span className="font-bold text-red-400 text-lg">{stats.statusDistribution.NOT_OK || 0}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700 col-span-2">
                <h3 className="text-2xl font-bold text-white mb-6">🏆 Top Categories</h3>
                <div className="space-y-4">
                  {Object.entries(stats.categoryDistribution)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 5)
                    .map(([category, count], index) => {
                      const percentage = ((count / stats.totalRecords) * 100).toFixed(1);
                      const colors = [
                        'from-primary-500 to-primary-600',
                        'from-blue-500 to-blue-600',
                        'from-purple-500 to-purple-600',
                        'from-cyan-500 to-cyan-600',
                        'from-orange-500 to-orange-600'
                      ];
                      return (
                        <div key={category} className="py-3 px-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-300 font-medium capitalize">{category}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-lg">{count}</span>
                              <span className="text-gray-400 text-sm">({percentage}%)</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full bg-gradient-to-r ${colors[index % colors.length]}`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700 mb-12">
            <h3 className="text-2xl font-bold text-white mb-6">🔍 Search & Filter</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
                  Search Users
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by email, name, or category..."
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
                  Filter by User
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                >
                  <option value="">All Users</option>
                  {uniqueUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* BMI Records Table */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
            <div className="px-8 py-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">
                📋 BMI Records ({filteredRecords.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      BMI Details
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-8 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/30 divide-y divide-gray-700">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-700/50 transition-all">
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-white">{record.user.name}</div>
                          <div className="text-sm text-gray-400">{record.user.email}</div>
                          <div className="text-xs text-gray-500">
                            {record.age} years • {record.gender.toLowerCase()}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-white">
                            BMI: {record.bmiValue.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400">
                            H: {record.height}m • W: {record.weight}kg
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <div className="text-sm text-gray-300">{record.category}</div>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          <span className="mr-1">{getStatusIcon(record.status)}</span>
                          {record.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-400">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteRecord(record.id)}
                          className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg shadow-red-500/25 font-medium"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredRecords.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-gray-400 text-lg">
                    {searchTerm || selectedUser ? '🔍 No records match your filters' : '📊 No BMI records found'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}