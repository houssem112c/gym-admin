'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminNav from '@/components/AdminNav';
import { usersAPI } from '@/lib/api';
import {
    HiOutlinePlus,
    HiOutlineDocumentDownload,
    HiOutlineDocumentReport,
    HiOutlineSearch,
    HiOutlineDotsVertical,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineLockClosed,
    HiOutlineLockOpen
} from 'react-icons/hi';

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [importLoading, setImportLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [importResult, setImportResult] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [coaches, setCoaches] = useState<any[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'USER',
    });

    const fetchUsers = async () => {
        try {
            const [usersData, coachesData] = await Promise.all([
                usersAPI.getAll(),
                usersAPI.listCoaches()
            ]);
            setUsers(usersData);
            setCoaches(coachesData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await usersAPI.create(newUser);
            setShowAddModal(false);
            setNewUser({ name: '', email: '', phone: '', role: 'USER' });
            fetchUsers();
        } catch (error: any) {
            alert(error.message || 'Failed to create user');
        }
    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImportLoading(true);
        setImportResult(null);
        try {
            const result = await usersAPI.importExcel(file);
            setImportResult(result);
            fetchUsers();
        } catch (error: any) {
            alert(error.message || 'Import failed');
        } finally {
            setImportLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleExportExcel = async () => {
        setExportLoading(true);
        try {
            await usersAPI.exportExcel();
        } catch (error: any) {
            alert(error.message || 'Export failed');
        } finally {
            setExportLoading(false);
        }
    };

    const handleToggleStatus = async (id: string, isActive: boolean) => {
        try {
            await usersAPI.toggleStatus(id, isActive);
            fetchUsers();
        } catch (error: any) {
            alert(error.message || 'Failed to update user status');
        }
    };

    const handleAssignCoach = async (userId: string, coachId: string) => {
        try {
            await usersAPI.assignCoach(userId, coachId);
            fetchUsers();
        } catch (error: any) {
            alert(error.message || 'Failed to assign coach');
        }
    };

    return (
        <div className="flex min-h-screen">
            <AdminNav />
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-5xl font-black text-white tracking-tighter uppercase">Members</h1>
                            <p className="text-surface-400 mt-2 font-medium">Coordinate and manage your athlete directory.</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImportExcel}
                                className="hidden"
                                accept=".xlsx, .xls"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={importLoading}
                                className="premium-button-secondary lg:px-4"
                            >
                                <HiOutlineDocumentDownload className="w-5 h-5" />
                                <span className="hidden lg:inline">Import Excel</span>
                            </button>
                            <button
                                onClick={handleExportExcel}
                                disabled={exportLoading}
                                className="premium-button-secondary lg:px-4"
                            >
                                <HiOutlineDocumentReport className="w-5 h-5" />
                                <span className="hidden lg:inline">Export Excel</span>
                            </button>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="premium-button-primary"
                            >
                                <HiOutlinePlus className="w-5 h-5" />
                                Add Member
                            </button>
                        </div>
                    </div>

                    {/* Search & Statistics */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-3 h-14 relative flex items-center">
                            <HiOutlineSearch className="absolute left-5 text-surface-500 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or status..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="premium-input pl-14 h-full"
                            />
                        </div>
                        <div className="glass-card flex items-center justify-center gap-4 border-primary-500/20 px-6 h-14">
                            <span className="text-surface-500 text-xs font-black uppercase tracking-widest">Total Active</span>
                            <span className="text-primary-400 text-xl font-black">{users.length}</span>
                        </div>
                    </div>

                    {importResult && (
                        <div className={`p-6 rounded-3xl border animate-scale-in ${importResult.failed > 0 ? 'bg-orange-500/5 border-orange-500/20' : 'bg-primary-500/5 border-primary-500/20'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${importResult.failed > 0 ? 'bg-orange-500/20 text-orange-500' : 'bg-primary-500/20 text-primary-500'}`}>
                                    <HiOutlineDocumentReport className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-white font-bold">Import Session Complete</p>
                                    <p className="text-surface-400 text-sm">Processed: {importResult.success + importResult.failed} | Success: <span className="text-primary-500">{importResult.success}</span> | Errors: <span className="text-accent-500">{importResult.failed}</span></p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Users Table */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                            <div className="w-12 h-12 border-4 border-surface-800 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                            <p className="text-surface-500 font-bold uppercase tracking-widest text-xs">Accessing Directory...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto pb-10 scrollbar-hide animate-slide-up">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Name & Profile</th>
                                        <th>Contact Intelligence</th>
                                        <th>Access Level</th>
                                        <th>Assigned Coach</th>
                                        <th>Activity Status</th>
                                        <th className="text-right pr-10">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="group">
                                            <td>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-surface-900 border border-surface-800 flex items-center justify-center font-black text-surface-500 group-hover:text-primary-500 transition-colors">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-white group-hover:text-primary-400 transition-colors">{user.name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-surface-400 text-xs font-medium">
                                                        <HiOutlineMail className="w-3.5 h-3.5" />
                                                        {user.email}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-surface-500 text-[10px] font-bold tracking-tight">
                                                        <HiOutlinePhone className="w-3.5 h-3.5" />
                                                        {user.phone || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-badge ${user.role === 'ADMIN' ? 'bg-primary-500/10 text-primary-500' : user.role === 'COACH' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td>
                                                {user.role === 'USER' ? (
                                                    <select
                                                        value={user.coachId || ''}
                                                        onChange={(e) => handleAssignCoach(user.id, e.target.value)}
                                                        className="bg-surface-900 border border-surface-800 text-surface-400 text-[10px] font-bold uppercase tracking-widest rounded-lg px-2 py-1 focus:ring-1 focus:ring-primary-500/50 outline-none transition-all w-full max-w-[120px]"
                                                    >
                                                        <option value="">No Coach</option>
                                                        {coaches.map(coach => (
                                                            <option key={coach.id} value={coach.id}>{coach.name}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span className="text-surface-600 font-bold text-[10px] uppercase tracking-widest">N/A</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-primary-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-accent-500'}`} />
                                                    <span className={`text-xs font-black uppercase tracking-widest ${user.isActive ? 'text-primary-500' : 'text-accent-500'}`}>
                                                        {user.isActive ? 'Online' : 'Restricted'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleToggleStatus(user.id, !user.isActive)}
                                                        className={`p-2 rounded-lg transition-colors ${user.isActive ? 'text-accent-500 hover:bg-accent-500/10' : 'text-primary-500 hover:bg-primary-500/10'}`}
                                                        title={user.isActive ? 'Restrict Access' : 'Restore Access'}
                                                    >
                                                        {user.isActive ? (
                                                            <HiOutlineLockOpen className="w-5 h-5" />
                                                        ) : (
                                                            <HiOutlineLockClosed className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => router.push(`/users/${user.id}`)}
                                                        className="premium-button-ghost p-2"
                                                        title="View Details"
                                                    >
                                                        <HiOutlineDotsVertical className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUsers.length === 0 && (
                                <div className="text-center py-20 bg-surface-900/10 rounded-3xl border border-dashed border-surface-800">
                                    <HiOutlineSearch className="w-12 h-12 text-surface-800 mx-auto mb-4" />
                                    <p className="text-surface-500 font-bold uppercase tracking-widest text-xs">No matching members found</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-surface-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
                    <div className="glass-card w-full max-w-lg p-10 border border-surface-800 shadow-3xl animate-scale-in">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">New Member</h2>
                                <p className="text-surface-500 text-sm font-medium">Provision a new account into the engine.</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="text-surface-500 hover:text-white transition-colors">
                                <HiOutlinePlus className="w-6 h-6 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2">Legal Identity</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Full Name"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        className="premium-input"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2">Satellite Email</label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="email@example.com"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            className="premium-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2">Comm Link (Phone)</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="+1 (555) 000"
                                            value={newUser.phone}
                                            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                            className="premium-input"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-surface-500 uppercase tracking-widest mb-2">Privilege Level</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        className="premium-input appearance-none"
                                    >
                                        <option value="USER">Standard Member</option>
                                        <option value="COACH">Professional Coach</option>
                                        <option value="ADMIN">System Administrator</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="premium-button-ghost flex-1"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    className="premium-button-primary flex-1"
                                >
                                    Authorize Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
