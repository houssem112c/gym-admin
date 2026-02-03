'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { coachAPI } from '@/lib/api';
import { Course } from '@/types';
import {
    HiOutlineClock,
    HiOutlineUserGroup,
    HiOutlineCalendar,
    HiOutlineFire,
    HiOutlineAcademicCap,
    HiOutlineRefresh,
    HiOutlineExternalLink
} from 'react-icons/hi';
import Link from 'next/link';

export default function MyCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMyCourses = async () => {
        try {
            setRefreshing(refreshing ? true : false);
            const data = await coachAPI.getMyCourses();
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch your courses:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMyCourses();
    }, []);

    return (
        <div className="flex min-h-screen">
            <AdminNav />
            <main className="flex-1 p-8 overflow-y-auto border-l border-surface-900/50">
                <div className="max-w-7xl mx-auto space-y-12 animate-fade-in">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary-500/10 rounded-lg">
                                    <HiOutlineFire className="w-6 h-6 text-primary-500" />
                                </div>
                                <span className="text-xs font-black text-primary-500 uppercase tracking-[0.3em]">Field Operations</span>
                            </div>
                            <h1 className="text-5xl font-black text-white tracking-tighter uppercase">My Classes</h1>
                            <p className="text-surface-400 mt-2 font-medium">Monitoring and managing your active training curriculum.</p>
                        </div>
                        <button
                            onClick={fetchMyCourses}
                            disabled={refreshing}
                            className="premium-button-secondary scale-90 md:scale-100"
                        >
                            <HiOutlineRefresh className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh Roster
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                            <div className="w-12 h-12 border-4 border-surface-800 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                            <p className="text-surface-500 font-bold uppercase tracking-widest text-xs">Accessing Program Data...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 animate-slide-up">
                            {courses.map((course) => (
                                <div key={course.id} className="glass-card group hover:border-primary-500/30 transition-all duration-500 overflow-hidden flex flex-col">
                                    {/* Card Media */}
                                    <div className="h-48 relative overflow-hidden bg-surface-950">
                                        {(course as any).thumbnail ? (
                                            <img src={(course as any).thumbnail} className="w-full h-full object-cover opacity-40 group-hover:opacity-70 group-hover:scale-110 transition-all duration-700" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-surface-800 font-black text-4xl uppercase">
                                                {course.title.substring(0, 2)}
                                            </div>
                                        )}
                                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface-950 to-transparent h-24"></div>
                                        <div className="absolute top-4 right-4 px-3 py-1 bg-primary-500/20 backdrop-blur-md rounded-full border border-primary-500/30">
                                            <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Active</span>
                                        </div>
                                        {/* Category Overlay */}
                                        <div className="absolute bottom-4 left-4 flex items-center gap-2">
                                            <div className="p-1 hex-glow bg-surface-900/50 backdrop-blur-md rounded-lg border border-surface-800">
                                                <HiOutlineAcademicCap className="w-4 h-4 text-primary-400" />
                                            </div>
                                            <span className="text-[10px] font-bold text-surface-200 uppercase tracking-widest">{(course as any).category?.name || 'Class'}</span>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-6 space-y-4 flex-1 flex flex-col">
                                        <div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-primary-400 transition-colors">{course.title}</h3>
                                            <p className="text-surface-500 text-sm mt-2 line-clamp-2 font-medium italic">"{course.description}"</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-surface-900/50">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-surface-900 rounded-xl border border-surface-800">
                                                    <HiOutlineClock className="w-4 h-4 text-blue-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-surface-500 uppercase tracking-tighter">Duration</span>
                                                    <span className="text-sm font-bold text-white">{course.duration} MIN</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-surface-900 rounded-xl border border-surface-800">
                                                    <HiOutlineUserGroup className="w-4 h-4 text-purple-400" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-surface-500 uppercase tracking-tighter">Capacity</span>
                                                    <span className="text-sm font-bold text-white">{course.capacity} MAX</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2 flex flex-col gap-3 mt-auto">
                                            <Link
                                                href={`/schedules?courseId=${course.id}`}
                                                className="flex items-center justify-between p-4 bg-surface-900 hover:bg-surface-800 rounded-2xl border border-surface-800 group/btn transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <HiOutlineCalendar className="w-5 h-5 text-primary-500 group-hover/btn:scale-110 transition-transform" />
                                                    <span className="text-xs font-black text-white uppercase tracking-widest">Manage Schedule</span>
                                                </div>
                                                <HiOutlineExternalLink className="w-4 h-4 text-surface-600 group-hover/btn:text-white" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {courses.length === 0 && (
                                <div className="col-span-full text-center py-32 bg-surface-900/10 rounded-[3rem] border border-dashed border-surface-800 flex flex-col items-center gap-4">
                                    <div className="w-20 h-20 bg-surface-900 rounded-full flex items-center justify-center text-surface-700">
                                        <HiOutlineFire className="w-10 h-10 opacity-20" />
                                    </div>
                                    <div>
                                        <p className="text-surface-400 font-black uppercase tracking-[0.2em]">Deployment Empty</p>
                                        <p className="text-surface-600 text-sm mt-2 font-medium">No courses have been assigned to your sector yet.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
