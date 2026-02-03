'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminNav from '@/components/AdminNav';
import { usersAPI, bmiAPI } from '@/lib/api';
import {
    HiOutlineArrowLeft,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineCalendar,
    HiOutlineFingerPrint,
    HiOutlineChartBar,
    HiOutlinePhotograph,
    HiOutlineLightningBolt
} from 'react-icons/hi';
import { format } from 'date-fns';

export default function UserDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!params.id) return;
            try {
                // Fetch User Details
                const userData = await usersAPI.getOne(params.id as string);
                setUser(userData);

                // Try fetching extra stats (fail silently if not available)
                try {
                    const bmiData = await bmiAPI.getUserRecords(params.id as string);
                    setStats(bmiData);
                } catch (e) {
                    console.log('No stats available or API not ready');
                }

            } catch (error) {
                console.error('Failed to fetch user:', error);
                alert('Failed to load user details');
                router.push('/users');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params.id, router]);

    if (loading) {
        return (
            <div className="flex min-h-screen">
                <AdminNav />
                <main className="flex-1 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-surface-800 border-t-primary-500 rounded-full animate-spin"></div>
                </main>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex min-h-screen">
            <AdminNav />
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">

                    {/* Header & Back Button */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-3 rounded-full hover:bg-surface-800 transition-colors text-surface-400 hover:text-white"
                        >
                            <HiOutlineArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{user.name}</h1>
                            <p className="text-surface-400 font-medium">Athlete Profile & Statistics</p>
                        </div>
                        <div className="ml-auto">
                            <span className={`px-4 py-2 rounded-xl border font-bold uppercase text-xs tracking-widest ${user.isActive ? 'bg-primary-500/10 border-primary-500/20 text-primary-500' : 'bg-accent-500/10 border-accent-500/20 text-accent-500'}`}>
                                {user.isActive ? 'Active Member' : 'Restricted'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Column 1: Profile Card */}
                        <div className="space-y-8">
                            <div className="glass-card p-8 border-surface-800 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-32 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                                <div className="relative z-10 flex flex-col items-center text-center mb-8">
                                    <div className="w-32 h-32 rounded-3xl bg-surface-900 border-2 border-surface-700 flex items-center justify-center mb-4 shadow-xl">
                                        <span className="text-5xl font-black text-surface-600">{user.name.charAt(0)}</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                                    <span className="text-surface-400 text-sm mt-1 uppercase tracking-wider font-bold">{user.role}</span>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="p-4 rounded-2xl bg-surface-900/50 border border-surface-800/50 flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-surface-800 text-primary-500">
                                            <HiOutlineMail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-surface-500 font-bold">Email</p>
                                            <p className="text-white font-medium text-sm truncate">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-surface-900/50 border border-surface-800/50 flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-surface-800 text-primary-500">
                                            <HiOutlinePhone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-surface-500 font-bold">Phone</p>
                                            <p className="text-white font-medium text-sm">{user.phone || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-surface-900/50 border border-surface-800/50 flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-surface-800 text-primary-500">
                                            <HiOutlineCalendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-surface-500 font-bold">Account Created</p>
                                            <p className="text-white font-medium text-sm">
                                                {user.createdAt ? format(new Date(user.createdAt), 'PPP') : 'Unknown'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-surface-900/50 border border-surface-800/50 flex items-center gap-4">
                                        <div className="p-2 rounded-lg bg-surface-800 text-primary-500">
                                            <HiOutlineFingerPrint className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase tracking-widest text-surface-500 font-bold">User ID</p>
                                            <p className="text-surface-400 font-mono text-xs truncate max-w-[150px]">{user.id}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 2 & 3: Stats & Progress */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Quick Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="glass-card p-6 border-surface-800 flex flex-col justify-between h-32 hover:border-primary-500/30 transition-colors">
                                    <HiOutlineLightningBolt className="w-6 h-6 text-yellow-500" />
                                    <div>
                                        <span className="text-3xl font-black text-white">0</span>
                                        <p className="text-[10px] uppercase tracking-widest text-surface-500 font-bold">Workouts Completed</p>
                                    </div>
                                </div>
                                <div className="glass-card p-6 border-surface-800 flex flex-col justify-between h-32 hover:border-primary-500/30 transition-colors">
                                    <HiOutlineChartBar className="w-6 h-6 text-blue-500" />
                                    <div>
                                        <span className="text-3xl font-black text-white">0</span>
                                        <p className="text-[10px] uppercase tracking-widest text-surface-500 font-bold">Current BMI</p>
                                    </div>
                                </div>
                                <div className="glass-card p-6 border-surface-800 flex flex-col justify-between h-32 hover:border-primary-500/30 transition-colors">
                                    <HiOutlinePhotograph className="w-6 h-6 text-purple-500" />
                                    <div>
                                        <span className="text-3xl font-black text-white">0</span>
                                        <p className="text-[10px] uppercase tracking-widest text-surface-500 font-bold">Progress Photos</p>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content Area (Tabs/Charts) */}
                            <div className="glass-card min-h-[400px] border-surface-800 p-8 flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 rounded-full bg-surface-900 border border-surface-800 flex items-center justify-center mb-6">
                                    <HiOutlineChartBar className="w-10 h-10 text-surface-700" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No Recent Activity</h3>
                                <p className="text-surface-500 max-w-sm">
                                    This user hasn't logged enough activity data yet. Once they start tracking workouts and measurements, robust analytics will appear here.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
