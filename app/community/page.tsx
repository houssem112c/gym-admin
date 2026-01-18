'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { feedAPI } from '@/lib/api';
import {
    HiOutlineTrash,
    HiOutlineChatAlt,
    HiOutlineHeart,
    HiOutlineExternalLink,
    HiOutlineClock
} from 'react-icons/hi';
import { format } from 'date-fns';

export default function CommunityPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            const data = await feedAPI.getAll();
            setPosts(data);
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDeletePost = async (id: string) => {
        if (!confirm('Are you sure you want to permanently delete this post?')) return;

        try {
            await feedAPI.delete(id);
            fetchPosts();
        } catch (error: any) {
            alert(error.message || 'Failed to delete post');
        }
    };

    return (
        <div className="flex min-h-screen">
            <AdminNav />
            <main className="flex-1 p-8 overflow-y-auto bg-surface-950">
                <div className="max-w-7xl mx-auto space-y-10 animate-fade-in">
                    {/* Header */}
                    <div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase">Community Feed</h1>
                        <p className="text-surface-400 mt-2 font-medium">Monitor and moderate global community activity.</p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40">
                            <div className="w-12 h-12 border-4 border-surface-800 border-t-primary-500 rounded-full animate-spin mb-4"></div>
                            <p className="text-surface-500 font-bold uppercase tracking-widest text-xs">Accessing Feed...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {posts.map((post) => (
                                <div key={post.id} className="glass-card group flex flex-col h-full border-surface-800 hover:border-primary-500/30 transition-all duration-500">
                                    {/* Author Info */}
                                    <div className="p-5 flex items-center justify-between border-b border-surface-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-surface-900 border border-surface-800 flex items-center justify-center font-black text-surface-500">
                                                {post.user.avatar ? (
                                                    <img src={post.user.avatar} className="w-full h-full rounded-xl object-cover" />
                                                ) : post.user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-sm leading-tight">{post.user.name}</p>
                                                <div className="flex items-center gap-1 text-[10px] text-surface-500 font-bold uppercase tracking-tighter mt-0.5">
                                                    <HiOutlineClock className="w-3 h-3" />
                                                    {format(new Date(post.createdAt), 'MMM dd, HH:mm')}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeletePost(post.id)}
                                            className="p-2 text-surface-500 hover:text-accent-500 hover:bg-accent-500/10 rounded-xl transition-all"
                                            title="Delete Post"
                                        >
                                            <HiOutlineTrash className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex-1 space-y-4">
                                        {post.content && (
                                            <p className="text-surface-300 text-sm leading-relaxed line-clamp-3 italic">
                                                "{post.content}"
                                            </p>
                                        )}

                                        {post.media && post.media.length > 0 && (
                                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-surface-900 border border-surface-800">
                                                <img src={post.media[0].url} className="w-full h-full object-cover" />
                                                {post.media.length > 1 && (
                                                    <div className="absolute top-3 right-3 bg-surface-950/80 backdrop-blur-md px-2 py-1 rounded-lg border border-surface-800 text-[10px] font-black text-white">
                                                        +{post.media.length - 1} MORE
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {post.sharedPost && (
                                            <div className="p-4 rounded-2xl bg-surface-900/50 border border-surface-800 border-dashed">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <HiOutlineExternalLink className="w-3.5 h-3.5 text-primary-500" />
                                                    <span className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Shared content</span>
                                                </div>
                                                <p className="text-surface-400 text-xs truncate">Original by: {post.sharedPost.user.name}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats Footer */}
                                    <div className="px-5 py-4 border-t border-surface-800/50 flex items-center justify-between">
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-1.5">
                                                <HiOutlineHeart className="w-4 h-4 text-surface-500" />
                                                <span className="text-xs font-black text-surface-300">{post._count?.likes || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <HiOutlineChatAlt className="w-4 h-4 text-surface-500" />
                                                <span className="text-xs font-black text-surface-300">{post._count?.comments || 0}</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-surface-600 tracking-widest uppercase">ID: {post.id.split('-')[0]}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && posts.length === 0 && (
                        <div className="text-center py-40 glass-card border-surface-800 border-dashed">
                            <HiOutlineChatAlt className="w-16 h-16 text-surface-800 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Quiet Engine</h3>
                            <p className="text-surface-500 font-medium">No posts currently active in the community feed.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
