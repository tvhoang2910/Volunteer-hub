import React, { useState } from 'react';
import { useRouter } from 'next/router';
import ManagerLayout from '@/layouts/ManagerLayout';
import EventForm from '@/components/manager/EventForm';
import { eventService } from '@/services/eventService';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from "@/context/AuthContext";

export default function CreateEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();
    const token = isAuthenticated ? localStorage.getItem("token") : "mock-token"; // Placeholder

    const handleCreate = async (data) => {
        setLoading(true);
        try {
            await eventService.createEvent(data, token);
            router.push('/manager/events');
        } catch (error) {
            console.error("Failed to create event", error);
            alert("Tạo sự kiện thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <div className="max-w-4xl mx-auto px-6 py-10">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition mb-6 group">
                    <div className="p-2 rounded-full bg-white border border-gray-200 group-hover:border-emerald-500 group-hover:text-emerald-500 transition shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Quay lại danh sách</span>
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Tạo sự kiện mới</h1>
                    <p className="text-gray-500 mt-2">Điền thông tin chi tiết để tổ chức sự kiện thiện nguyện của bạn.</p>
                </div>

                <EventForm onSubmit={handleCreate} loading={loading} />
            </div>
        </div>
    );
}

CreateEventPage.getLayout = function getLayout(page) {
    return <ManagerLayout>{page}</ManagerLayout>;
};
