
"use client";

import { useEffect, useState } from "react";
import { privateSessionsAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import AdminNav from "@/components/AdminNav";

interface PrivateSession {
    id: string;
    user: {
        id: string;
        name: string;
        email: string;
        avatar?: string;
    };
    date: string;
    startTime: string;
    endTime: string;
    status: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED" | "COMPLETED";
    note?: string;
}

export default function PrivateSessionsPage() {
    const [requests, setRequests] = useState<PrivateSession[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await privateSessionsAPI.getRequests();
            setRequests(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRespond = async (id: string, status: "ACCEPTED" | "DECLINED") => {
        try {
            await privateSessionsAPI.respond(id, status);
            // Refresh
            fetchRequests();
        } catch (error) {
            alert("Error responding to request");
        }
    };

    return (
        <div className="flex min-h-screen">
            <AdminNav />
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-10">
                    <h1 className="text-3xl font-bold text-white mb-8">Private Session Requests</h1>

                    {loading ? (
                        <div className="text-white">Loading...</div>
                    ) : requests.length === 0 ? (
                        <div className="text-gray-400">No requests found.</div>
                    ) : (
                        <div className="grid gap-4">
                            {requests.map((req) => (
                                <div key={req.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-700 rounded-full overflow-hidden">
                                            {req.user.avatar ? (
                                                <img src={req.user.avatar} alt={req.user.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-white">
                                                    {req.user.name[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{req.user.name}</h3>
                                            <p className="text-gray-400 text-sm">
                                                {new Date(req.date).toLocaleDateString()} • {req.startTime} - {req.endTime}
                                            </p>
                                            {req.note && <p className="text-gray-500 text-xs mt-1">Note: {req.note}</p>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === 'ACCEPTED' ? 'bg-green-500/20 text-green-400' :
                                            req.status === 'DECLINED' ? 'bg-red-500/20 text-red-400' :
                                                req.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {req.status}
                                        </div>

                                        {req.status === 'PENDING' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleRespond(req.id, 'ACCEPTED')}
                                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() => handleRespond(req.id, 'DECLINED')}
                                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition-colors"
                                                >
                                                    Decline
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
