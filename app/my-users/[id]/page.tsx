'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { coachAPI } from '@/lib/api';
import Image from 'next/image';
import {
    HiOutlineUserCircle,
    HiOutlineScale,
    HiOutlineChatAlt2,
    HiOutlineCalendar,
    HiOutlineArrowLeft,
    HiOutlineMail,
    HiOutlinePhone
} from 'react-icons/hi';
import Link from 'next/link';

export default function UserDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [user, setUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [bmiRecords, setBmiRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'info' | 'bmi' | 'posts'>('info');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileData, postsData, bmiData] = await Promise.all([
                    coachAPI.getUserProfile(id),
                    coachAPI.getUserPosts(id),
                    coachAPI.getUserBmi(id),
                ]);
                setUser(profileData);
                setPosts(postsData);
                setBmiRecords(bmiData);
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-screen">
                <AdminNav />
                <main className="flex-1 flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
                </main>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex min-h-screen">
                <AdminNav />
                <main className="flex-1 p-8 text-center py-32">
                    <p className="text-surface-500">User not found or access denied.</p>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <AdminNav />

            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-fade-in">
                        <div className="flex items-center gap-6">
                            <Link href="/my-users" className="glass-card p-3 hover:text-primary-500 transition-colors">
                                <HiOutlineArrowLeft className="w-6 h-6" />
                            </Link>
                            <div className="relative w-24 h-24 rounded-3xl overflow-hidden bg-surface-900 border-2 border-primary-500/20 shadow-2xl">
                                {user.avatar ? (
                                    <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-surface-500">
                                        <HiOutlineUserCircle className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{user.name}</h1>
                                <p className="text-primary-500 font-bold tracking-widest text-xs uppercase mt-1">Managed Member</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex gap-2 p-1 bg-surface-950/50 rounded-2xl w-fit border border-surface-900/50">
                        {[
                            { id: 'info', label: 'Overview', icon: HiOutlineUserCircle },
                            { id: 'bmi', label: 'Health Logs', icon: HiOutlineScale },
                            { id: 'posts', label: 'Feed Activity', icon: HiOutlineChatAlt2 },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                                    : 'text-surface-500 hover:text-surface-200 hover:bg-surface-900'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="animate-slide-up">
                        {activeTab === 'info' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="glass-card p-8 space-y-8">
                                    <h3 className="text-xl font-black text-white tracking-tight uppercase border-b border-surface-800 pb-4">Personal Details</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-surface-900 flex items-center justify-center border border-surface-800 group-hover:border-primary-500/30 transition-colors">
                                                <HiOutlineMail className="w-5 h-5 text-surface-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-surface-600 uppercase tracking-widest">Email Address</p>
                                                <p className="text-white font-bold">{user.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-surface-900 flex items-center justify-center border border-surface-800 group-hover:border-primary-500/30 transition-colors">
                                                <HiOutlinePhone className="w-5 h-5 text-surface-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-surface-600 uppercase tracking-widest">Phone Number</p>
                                                <p className="text-white font-bold">{user.phone || 'Not provided'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 group">
                                            <div className="w-10 h-10 rounded-xl bg-surface-900 flex items-center justify-center border border-surface-800 group-hover:border-primary-500/30 transition-colors">
                                                <HiOutlineCalendar className="w-5 h-5 text-surface-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-surface-600 uppercase tracking-widest">Member Since</p>
                                                <p className="text-white font-bold">{new Date(user.createdAt).toDateString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-card p-8 flex flex-col justify-center items-center text-center space-y-6">
                                    <div className="w-20 h-20 rounded-full bg-primary-500/10 flex items-center justify-center">
                                        <HiOutlineUserCircle className="w-10 h-10 text-primary-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white tracking-tight leading-none mb-2">BIOGRAPHY</h3>
                                        <p className="text-surface-400 font-medium italic">
                                            "{user.bio || "No biography provided by the member yet. Encourage them to complete their profile!"}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'bmi' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {bmiRecords.length > 0 ? (
                                        bmiRecords.slice(0, 3).map((record, idx) => (
                                            <div key={record.id} className="glass-card p-6 relative overflow-hidden group">
                                                <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary-500/5 rounded-full blur-xl group-hover:bg-primary-500/10 transition-all"></div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-surface-500">Record #{bmiRecords.length - idx}</span>
                                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${record.status === 'OK' ? 'bg-primary-500/20 text-primary-500' : 'bg-red-500/20 text-red-500'
                                                        }`}>
                                                        {record.category}
                                                    </span>
                                                </div>
                                                <div className="flex items-end gap-2 mb-1">
                                                    <span className="text-3xl font-black text-white tracking-tighter">{record.bmiValue}</span>
                                                    <span className="text-xs font-bold text-surface-500 mb-1.5 uppercase">BMI</span>
                                                </div>
                                                <p className="text-xs text-surface-400 font-medium">Recorded on {new Date(record.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-3 text-center py-20 glass-card">
                                            <p className="text-surface-500">No health logs found for this user.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'posts' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {posts.length > 0 ? (
                                    posts.map((post) => (
                                        <div key={post.id} className="glass-card overflow-hidden group">
                                            {post.media && post.media.length > 0 && (
                                                <div className="relative aspect-video">
                                                    <Image src={post.media[0].url} alt="Post media" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                                                </div>
                                            )}
                                            <div className="p-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <HiOutlineCalendar className="w-4 h-4 text-surface-600" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-surface-500">
                                                        {new Date(post.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-white font-medium text-sm leading-relaxed">{post.content}</p>
                                                <div className="mt-6 pt-4 border-t border-surface-800 flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5">
                                                        <HiOutlineChatAlt2 className="w-4 h-4 text-primary-500" />
                                                        <span className="text-xs font-bold text-surface-400">{post._count.comments} Comments</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center py-20 glass-card">
                                        <p className="text-surface-500">This member hasn't posted anything in the community yet.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
