'use client';

import { useEffect, useState, useMemo } from 'react';
import AdminNav from '@/components/AdminNav';
import { bmiAPI } from '@/lib/api';
import { BmiRecord, BmiStats } from '@/types';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface GroupedBmi {
  userId: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  records: BmiRecord[];
  latestRecord: BmiRecord;
}

export default function BmiPage() {
  const [records, setRecords] = useState<BmiRecord[]>([]);
  const [stats, setStats] = useState<BmiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<GroupedBmi | null>(null);

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

  const groupedData = useMemo(() => {
    const grouped = records.reduce((acc, record) => {
      if (!acc[record.userId]) {
        acc[record.userId] = {
          userId: record.userId,
          user: record.user,
          records: [],
          latestRecord: record,
        };
      }
      acc[record.userId].records.push(record);
      return acc;
    }, {} as Record<string, GroupedBmi>);

    return Object.values(grouped).sort((a, b) =>
      new Date(b.latestRecord.createdAt).getTime() - new Date(a.latestRecord.createdAt).getTime()
    );
  }, [records]);

  const filteredUsers = groupedData.filter(item =>
    item.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.latestRecord.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'CAUTION': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'NOT_OK': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getChartData = (records: BmiRecord[]) => {
    return [...records].reverse().map(r => ({
      date: new Date(r.createdAt).toLocaleDateString(),
      bmi: parseFloat(r.bmiValue.toFixed(2)),
      weight: r.weight,
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-950">
        <AdminNav />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary-500"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <AdminNav />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {selectedUser ? (
            /* Detailed View */
            <div className="space-y-8 animate-in fade-in duration-500">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-all group"
              >
                <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
                Back to User List
              </button>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-white">{selectedUser.user.name}</h1>
                  <p className="text-gray-400">{selectedUser.user.email}</p>
                </div>
                <div className={`px-4 py-2 rounded-xl border ${getStatusColor(selectedUser.latestRecord.status)}`}>
                  <span className="font-bold">Latest: {selectedUser.latestRecord.bmiValue.toFixed(2)} ({selectedUser.latestRecord.category})</span>
                </div>
              </div>

              {/* Chart Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-gray-900/50 p-6 rounded-3xl border border-gray-800 shadow-xl min-h-[400px]">
                  <h3 className="text-xl font-bold text-white mb-6">BMI Variation Over Time</h3>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getChartData(selectedUser.records)}>
                        <defs>
                          <linearGradient id="colorBmi" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FB923C" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#FB923C" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }}
                          itemStyle={{ color: '#FB923C' }}
                        />
                        <Area type="monotone" dataKey="bmi" stroke="#FB923C" strokeWidth={3} fillOpacity={1} fill="url(#colorBmi)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-6">Health Insights</h3>
                  <div className="space-y-6">
                    <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700">
                      <p className="text-sm text-gray-400 mb-1">Record Count</p>
                      <p className="text-2xl font-bold text-white">{selectedUser.records.length} entries</p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700">
                      <p className="text-sm text-gray-400 mb-1">Initial Weight</p>
                      <p className="text-2xl font-bold text-white">{selectedUser.records[selectedUser.records.length - 1].weight} kg</p>
                    </div>
                    <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700">
                      <p className="text-sm text-gray-400 mb-1">Target BMI</p>
                      <p className="text-2xl font-bold text-primary-400">18.5 - 24.9</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* History Table */}
              <div className="bg-gray-900/50 rounded-3xl border border-gray-800 shadow-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-800/50 text-gray-400 text-xs font-bold uppercase">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Weight</th>
                      <th className="px-6 py-4">Height</th>
                      <th className="px-6 py-4">BMI</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {selectedUser.records.map((r) => (
                      <tr key={r.id} className="text-white hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm">{new Date(r.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">{r.weight} kg</td>
                        <td className="px-6 py-4">{r.height} m</td>
                        <td className="px-6 py-4 font-bold">{r.bmiValue.toFixed(2)}</td>
                        <td className="px-6 py-4 capitalize">{r.category}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${getStatusColor(r.status)}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* List View */
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h1 className="text-5xl font-extrabold text-white tracking-tight">BMI Analytics</h1>
                  <p className="text-gray-400 mt-2 text-lg">Detailed health tracking for your members</p>
                </div>
                <div className="w-full md:w-72 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((item) => (
                  <div
                    key={item.userId}
                    onClick={() => setSelectedUser(item)}
                    className="bg-gray-900/50 p-6 rounded-3xl border border-gray-800 hover:border-primary-500 transition-all cursor-pointer group hover:shadow-2xl hover:shadow-primary-500/10"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        👤
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${getStatusColor(item.latestRecord.status)}`}>
                        {item.latestRecord.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-primary-400 transition-colors">{item.user.name}</h3>
                    <p className="text-sm text-gray-500 mb-6 truncate">{item.user.email}</p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-800/50 p-3 rounded-2xl">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Records</p>
                        <p className="text-lg font-bold text-white">{item.records.length}</p>
                      </div>
                      <div className="bg-gray-800/50 p-3 rounded-2xl">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Latest BMI</p>
                        <p className="text-lg font-bold text-white">{item.latestRecord.bmiValue.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-20 bg-gray-900/30 rounded-3xl border border-dashed border-gray-800">
                  <div className="text-5xl mb-4">📭</div>
                  <h3 className="text-xl font-bold text-white">No users found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
