'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { ordersAPI } from '@/lib/api';
import {
    HiOutlineClipboardList,
    HiOutlineSearch, HiOutlineCalendar,
    HiOutlineUser
} from 'react-icons/hi';

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrders = async () => {
        try {
            const data = await ordersAPI.getAll();
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await ordersAPI.updateStatus(orderId, newStatus);
            // Optimistic update
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update order status');
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getTotalRevenue = () => {
        return orders.reduce((acc, order) => acc + order.totalAmount, 0);
    };

    return (
        <div className="flex min-h-screen">
            <AdminNav />
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-5xl font-black text-white tracking-tighter uppercase">Orders</h1>
                            <p className="text-surface-400 mt-2 font-medium">Manage and track customer purchases.</p>
                        </div>
                    </div>

                    {/* Stats & Search */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-2 h-14 relative flex items-center">
                            <HiOutlineSearch className="absolute left-5 text-surface-500 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by ID or customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="premium-input pl-14 h-full"
                            />
                        </div>
                        <div className="glass-card flex items-center justify-center gap-4 border-primary-500/20 px-6 h-14">
                            <span className="text-surface-500 text-xs font-black uppercase tracking-widest">Total Orders</span>
                            <span className="text-primary-400 text-xl font-black">{orders.length}</span>
                        </div>
                        <div className="glass-card flex items-center justify-center gap-4 border-accent-500/20 px-6 h-14">
                            <span className="text-surface-500 text-xs font-black uppercase tracking-widest">Revenue</span>
                            <span className="text-accent-400 text-xl font-black">${getTotalRevenue().toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Orders Table */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                            <div className="w-12 h-12 border-4 border-surface-800 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                            <p className="text-surface-500 font-bold uppercase tracking-widest text-xs">Loading Orders...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto pb-10 scrollbar-hide animate-slide-up">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id} className="group">
                                            <td>
                                                <span className="font-mono text-xs text-surface-400">{order.id.substring(0, 8)}...</span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-surface-800 flex items-center justify-center text-xs font-bold text-surface-400">
                                                        <HiOutlineUser className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-sm">{order.user.name}</p>
                                                        <p className="text-xs text-surface-500">{order.user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-surface-300 font-medium">
                                                    {order.items.length} items
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-accent-400 font-black">
                                                    ${order.totalAmount.toFixed(2)}
                                                </span>
                                            </td>
                                            <td>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className={`status-badge border-none outline-none cursor-pointer ${order.status === 'COMPLETED' || order.status === 'DELIVERED'
                                                            ? 'bg-primary-500/10 text-primary-500'
                                                            : 'bg-orange-500/10 text-orange-500'
                                                        }`}
                                                >
                                                    <option value="PENDING">PENDING</option>
                                                    <option value="PROCESSING">PROCESSING</option>
                                                    <option value="SHIPPED">SHIPPED</option>
                                                    <option value="DELIVERED">DELIVERED</option>
                                                    <option value="CANCELLED">CANCELLED</option>
                                                </select>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2 text-surface-400 text-xs">
                                                    <HiOutlineCalendar className="w-3.5 h-3.5" />
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredOrders.length === 0 && (
                                <div className="text-center py-20 bg-surface-900/10 rounded-3xl border border-dashed border-surface-800">
                                    <HiOutlineClipboardList className="w-12 h-12 text-surface-800 mx-auto mb-4" />
                                    <p className="text-surface-500 font-bold uppercase tracking-widest text-xs">No orders found</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
