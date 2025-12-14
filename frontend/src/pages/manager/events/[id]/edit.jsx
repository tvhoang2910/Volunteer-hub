import React, { useState } from 'react';
import { useRouter } from 'next/router';
import ManagerLayout from '@/layouts/ManagerLayout';
import EventForm from '@/components/manager/EventForm';
import { eventService } from '@/services/eventService';
import { ArrowLeft } from 'lucide-react';
import { useManagerEvent } from '@/hooks/useManagerEvent';

export default function EditEventPage() {
    const router = useRouter();
    const { event, eventId, isReady } = useManagerEvent();
    const [loading, setLoading] = useState(false);

    const handleUpdate = async (data) => {
        setLoading(true);
        try {
            await eventService.updateEvent(eventId, data, "mock-token");
            router.push('/manager/events');
        } catch (error) {
            console.error("Failed to update event", error);
            alert("Cập nhật sự kiện thất bại");
        } finally {
            setLoading(false);
        }
    };

    if (!isReady) return null;
    if (!event) return <div className="p-10 text-center">Đang tải...</div>;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <div className="max-w-4xl mx-auto px-6 py-10">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition mb-6 group">
                    <div className="p-2 rounded-full bg-white border border-gray-200 group-hover:border-emerald-500 group-hover:text-emerald-500 transition shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Quay lại chi tiết</span>
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa sự kiện</h1>
                    <p className="text-gray-500 mt-2">Cập nhật thông tin sự kiện.</p>
                </div>

                <EventForm initialData={event} onSubmit={handleUpdate} loading={loading} />
            </div>
        </div>
    );
}

EditEventPage.getLayout = function getLayout(page) {
    return <ManagerLayout>{page}</ManagerLayout>;
};
