'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { contactsAPI } from '@/lib/api';
import { Contact } from '@/types';
import { formatDateTime } from '@/lib/utils';
import Link from 'next/link';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'open' | 'responded' | 'closed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'>('all');

  const fetchContacts = async () => {
    try {
      const data = await contactsAPI.getAll();
      setContacts(data);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
      alert('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await contactsAPI.delete(id);
      await fetchContacts();
    } catch (error: any) {
      console.error('Failed to delete contact:', error);
      alert(error.message || 'Failed to delete contact');
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    let statusMatch = true;
    let priorityMatch = true;

    if (filter !== 'all') {
      statusMatch = contact.status.toLowerCase() === filter.toLowerCase();
    }

    if (priorityFilter !== 'all') {
      priorityMatch = contact.priority === priorityFilter;
    }

    return statusMatch && priorityMatch;
  });

  const getStatusCounts = () => {
    return {
      all: contacts.length,
      open: contacts.filter(c => c.status === 'OPEN').length,
      responded: contacts.filter(c => c.status === 'RESPONDED').length,
      closed: contacts.filter(c => c.status === 'CLOSED').length,
      unread: contacts.filter(c => !c.isRead).length,
    };
  };

  const statusCounts = getStatusCounts();

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border-blue-400/30';
      case 'IN_PROGRESS': return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 border-yellow-400/30';
      case 'RESPONDED': return 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border-green-400/30';
      case 'CLOSED': return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border-gray-400/30';
      default: return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border-gray-400/30';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border-gray-400/30';
      case 'NORMAL': return 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border-blue-400/30';
      case 'HIGH': return 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-300 border-orange-400/30';
      case 'URGENT': return 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border-red-400/30';
      default: return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border-gray-400/30';
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <AdminNav />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-white tracking-tight">Messages</h1>
            <p className="text-xl text-gray-300">
              {statusCounts.unread > 0 && (
                <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm mr-4 font-bold">
                  🔔 {statusCounts.unread} unread
                </span>
              )}
              Manage user 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 font-bold"> inquiries</span> and responses
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
            <div className="flex flex-wrap gap-6">
              <div className="flex gap-3 items-center">
                <span className="text-sm font-bold text-gray-300">📊 Status:</span>
                {(['all', 'open', 'responded', 'closed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${
                      filter === status
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {status === 'all' ? `All (${statusCounts.all})` : 
                     status === 'open' ? `Open (${statusCounts.open})` :
                     status === 'responded' ? `Responded (${statusCounts.responded})` :
                     `Closed (${statusCounts.closed})`}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-3 items-center">
                <span className="text-sm font-bold text-gray-300">⚡ Priority:</span>
                {(['all', 'URGENT', 'HIGH', 'NORMAL', 'LOW'] as const).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setPriorityFilter(priority)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${
                      priorityFilter === priority
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {priority === 'all' ? 'All' : priority}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-500 mx-auto mb-6"></div>
              <p className="text-xl text-gray-300 font-medium">Loading messages...</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
              {filteredContacts.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="text-8xl mb-6">📭</div>
                  <h3 className="text-2xl font-bold text-white mb-4">No messages found</h3>
                  <p className="text-gray-400 text-lg">No messages match your current filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="text-left py-6 px-8 font-bold text-gray-300 uppercase tracking-wider">👤 From</th>
                        <th className="text-left py-6 px-8 font-bold text-gray-300 uppercase tracking-wider">💬 Subject</th>
                        <th className="text-left py-6 px-8 font-bold text-gray-300 uppercase tracking-wider">📊 Status</th>
                        <th className="text-left py-6 px-8 font-bold text-gray-300 uppercase tracking-wider">⚡ Priority</th>
                        <th className="text-left py-6 px-8 font-bold text-gray-300 uppercase tracking-wider">📅 Date</th>
                        <th className="text-left py-6 px-8 font-bold text-gray-300 uppercase tracking-wider">🔧 Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredContacts.map((contact) => (
                        <tr key={contact.id} className={`hover:bg-gray-700/50 transition-all ${!contact.isRead ? 'bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-l-4 border-blue-400' : 'bg-gray-800/30'}`}>
                          <td className="py-6 px-8">
                            <div>
                              <div className="flex items-center">
                                <div className="font-bold text-white">
                                  {contact.user?.name || contact.name}
                                  {!contact.isRead && (
                                    <span className="ml-3 inline-block w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></span>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm text-gray-300 mt-1">{contact.email}</div>
                              {contact.user && (
                                <div className="text-xs text-blue-400 font-bold mt-1 bg-blue-500/20 px-2 py-1 rounded-full inline-block">
                                  ✅ Registered User
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-6 px-8">
                            <div className="font-bold text-white text-lg mb-2">{contact.subject}</div>
                            <div className="text-sm text-gray-300 truncate max-w-xs bg-gray-700/50 p-2 rounded-lg">
                              {contact.message}
                            </div>
                          </td>
                          <td className="py-6 px-8">
                            <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-bold border ${getStatusBadgeColor(contact.status)}`}>
                              {contact.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-6 px-8">
                            <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-bold border ${getPriorityBadgeColor(contact.priority)}`}>
                              {contact.priority}
                            </span>
                          </td>
                          <td className="py-6 px-8 text-sm text-gray-300 font-medium">
                            {formatDateTime(contact.createdAt)}
                          </td>
                          <td className="py-6 px-8">
                            <div className="flex space-x-3">
                              <Link
                                href={`/contacts/${contact.id}`}
                                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25"
                              >
                                👁️ View & Respond
                              </Link>
                              <button
                                onClick={() => handleDelete(contact.id)}
                                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:from-red-600 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg shadow-red-500/25"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
