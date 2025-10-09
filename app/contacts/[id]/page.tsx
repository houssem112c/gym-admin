'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminNav from '@/components/AdminNav';
import { contactsAPI } from '@/lib/api';
import { Contact } from '@/types';
import { formatDateTime } from '@/lib/utils';

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contactId = params?.id as string;
  
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState<Contact['status']>('OPEN');
  const [newPriority, setNewPriority] = useState<Contact['priority']>('NORMAL');

  const fetchContact = async () => {
    try {
      const data = await contactsAPI.getOne(contactId);
      setContact(data);
      setNewStatus(data.status);
      setNewPriority(data.priority);
      
      // Mark as read if not already read
      if (!data.isRead) {
        await contactsAPI.markAsRead(contactId);
      }
    } catch (error) {
      console.error('Failed to fetch contact:', error);
      alert('Failed to fetch message details');
      router.push('/contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contactId) {
      fetchContact();
    }
  }, [contactId]);

  const handleStatusUpdate = async () => {
    if (!contact) return;
    
    try {
      await contactsAPI.updateStatus(contactId, newStatus);
      setContact({ ...contact, status: newStatus, priority: newPriority });
      alert('Status updated successfully');
    } catch (error: any) {
      console.error('Failed to update status:', error);
      alert(error.message || 'Failed to update status');
    }
  };

  const handleResponse = async () => {
    if (!contact || !response.trim()) return;
    
    setResponding(true);
    try {
      const updatedContact = await contactsAPI.respond(contactId, response);
      setContact(updatedContact);
      setResponse('');
      alert('Response sent successfully!');
    } catch (error: any) {
      console.error('Failed to send response:', error);
      alert(error.message || 'Failed to send response');
    } finally {
      setResponding(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border border-blue-400/30';
      case 'IN_PROGRESS': return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 border border-yellow-400/30';
      case 'RESPONDED': return 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border border-green-400/30';
      case 'CLOSED': return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border border-gray-400/30';
      default: return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border border-gray-400/30';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border border-gray-400/30';
      case 'NORMAL': return 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 border border-blue-400/30';
      case 'HIGH': return 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-300 border border-orange-400/30';
      case 'URGENT': return 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border border-red-400/30';
      default: return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-300 border border-gray-400/30';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <AdminNav />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-500 mx-auto mb-6"></div>
              <p className="text-xl text-gray-300 font-medium">Loading message details...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <AdminNav />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-20">
              <div className="text-8xl mb-6">❌</div>
              <h2 className="text-3xl font-bold text-white mb-4">Message Not Found</h2>
              <p className="text-gray-400 text-lg mb-8">The requested message could not be found.</p>
              <button
                onClick={() => router.push('/contacts')}
                className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25"
              >
                🔙 Back to Messages
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <AdminNav />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12 flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/contacts')}
                className="text-primary-400 hover:text-primary-300 mb-6 inline-flex items-center text-lg font-bold transition-all transform hover:scale-105"
              >
                ← 🔙 Back to Messages
              </button>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">💬 Message Details</h1>
            </div>
            
            <div className="flex gap-4">
              <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ${getStatusBadgeColor(contact.status)}`}>
                📊 {contact.status.replace('_', ' ')}
              </span>
              <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ${getPriorityBadgeColor(contact.priority)}`}>
                ⚡ {contact.priority}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Message Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Original Message */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">📧 Original Message</h2>
                    <span className="text-sm text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full font-medium">
                      📅 {formatDateTime(contact.createdAt)}
                    </span>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                      {contact.subject}
                    </h3>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-xl p-6 border border-blue-400/30">
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">
                      {contact.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Response Section */}
              {contact.adminResponse ? (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">✅ Your Response</h2>
                      <span className="text-sm text-gray-400 bg-gray-700/50 px-3 py-1 rounded-full font-medium">
                        📅 {contact.respondedAt && formatDateTime(contact.respondedAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-400/30 mb-6">
                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">
                      {contact.adminResponse}
                    </p>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-600">
                    <h3 className="text-xl font-bold text-white mb-4">🔄 Update Response</h3>
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={5}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                      placeholder="Update your response to the user..."
                    />
                    <button
                      onClick={handleResponse}
                      disabled={responding || !response.trim()}
                      className="mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {responding ? '⏳ Updating...' : '✅ Update Response'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-700">
                  <h2 className="text-2xl font-bold text-white mb-6">💌 Send Response</h2>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-300 mb-3">
                      📝 Response to User
                    </label>
                    <textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={8}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                      placeholder="Type your response to the user here..."
                    />
                  </div>
                  <button
                    onClick={handleResponse}
                    disabled={responding || !response.trim()}
                    className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {responding ? '📤 Sending...' : '🚀 Send Response'}
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Contact Info */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-6">👤 Contact Information</h3>
                <div className="space-y-4">
                  <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600">
                    <span className="text-sm font-bold text-gray-400 block mb-1">👤 Name:</span>
                    <p className="text-white text-lg font-semibold">{contact.user?.name || contact.name}</p>
                    {contact.user && (
                      <span className="text-xs bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300 px-3 py-1 rounded-full border border-blue-400/30 font-bold mt-2 inline-block">
                        ✅ Registered User
                      </span>
                    )}
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600">
                    <span className="text-sm font-bold text-gray-400 block mb-1">📧 Email:</span>
                    <p className="text-white text-lg font-semibold mb-2">{contact.email}</p>
                    <a
                      href={`mailto:${contact.email}?subject=Re: ${contact.subject}`}
                      className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-3 py-1 rounded-lg text-sm font-bold hover:from-primary-600 hover:to-primary-700 transition-all transform hover:scale-105 shadow-lg shadow-primary-500/25 inline-block"
                    >
                      📤 Send Email
                    </a>
                  </div>
                  {contact.phone && (
                    <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600">
                      <span className="text-sm font-bold text-gray-400 block mb-1">📞 Phone:</span>
                      <p className="text-white text-lg font-semibold mb-2">{contact.phone}</p>
                      <a
                        href={`tel:${contact.phone}`}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1 rounded-lg text-sm font-bold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg shadow-green-500/25 inline-block"
                      >
                        📞 Call
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Status Management */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-6">⚙️ Message Management</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-3">📊 Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as Contact['status'])}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    >
                      <option value="OPEN">🔵 Open</option>
                      <option value="IN_PROGRESS">🟡 In Progress</option>
                      <option value="RESPONDED">🟢 Responded</option>
                      <option value="CLOSED">⚫ Closed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-3">⚡ Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as Contact['priority'])}
                      className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    >
                      <option value="LOW">⚪ Low</option>
                      <option value="NORMAL">🔵 Normal</option>
                      <option value="HIGH">🟠 High</option>
                      <option value="URGENT">🔴 Urgent</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={handleStatusUpdate}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25"
                  >
                    ✅ Update Status & Priority
                  </button>
                </div>
              </div>

              {/* Message Stats */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-6">📊 Message Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-gray-700/50 p-3 rounded-xl border border-gray-600">
                    <span className="text-gray-400 font-bold">📅 Created:</span>
                    <span className="text-white font-semibold">{new Date(contact.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-700/50 p-3 rounded-xl border border-gray-600">
                    <span className="text-gray-400 font-bold">👁️ Status:</span>
                    <span className={`font-bold ${contact.isRead ? 'text-green-400' : 'text-blue-400'}`}>
                      {contact.isRead ? '✅ Read' : '📧 Unread'}
                    </span>
                  </div>
                  {contact.respondedAt && (
                    <div className="flex justify-between items-center bg-gray-700/50 p-3 rounded-xl border border-gray-600">
                      <span className="text-gray-400 font-bold">💬 Responded:</span>
                      <span className="text-white font-semibold">{new Date(contact.respondedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}