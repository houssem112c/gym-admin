'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { coachAPI } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { HiOutlineUserCircle, HiOutlineChevronRight, HiOutlineSearch } from 'react-icons/hi';

export default function MyUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await coachAPI.getMyUsers();
                setUsers(data);
            } catch (error) {
                console.error('Failed to fetch my users:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen">
            <AdminNav />

            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-12">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-fade-in">
                        <div>
                            <h1 className="text-5xl font-black text-white tracking-tighter">
                                MY USERS <span className="text-primary-500">.</span>
                            </h1>
                            <p className="text-surface-400 mt-2 font-medium">Manage and track the progress of your assigned members.</p>
                        </div>
                    </div>

                    <div className="glass-card p-4 relative overflow-hidden flex items-center gap-4">
                        <HiOutlineSearch className="w-6 h-6 text-surface-500 ml-2" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="bg-transparent border-none focus:ring-0 text-white w-full placeholder-surface-600 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-32">
                            <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredUsers.map((user) => (
                                <Link
                                    key={user.id}
                                    href={`/my-users/${user.id}`}
                                    className="glass-card p-6 group hover:border-primary-500/50 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-surface-900 border border-surface-800 shrink-0">
                                            {user.avatar ? (
                                                <Image
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-surface-500">
                                                    <HiOutlineUserCircle className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-bold text-white truncate">{user.name}</h3>
                                            <p className="text-sm text-surface-500 truncate">{user.email}</p>
                                        </div>
                                        <HiOutlineChevronRight className="w-6 h-6 text-surface-600 group-hover:text-primary-500 transition-colors" />
                                    </div>
                                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-surface-800">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-surface-500">Joined</span>
                                        <span className="text-xs font-bold text-surface-300">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {!loading && filteredUsers.length === 0 && (
                        <div className="text-center py-32 glass-card border-dashed">
                            <p className="text-surface-500 font-medium">No members assigned to you yet or matching your search.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
