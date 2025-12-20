import React, { useState } from 'react';
import { useRouter } from 'next/router';
import ManagerLayout from '@/layouts/ManagerLayout';
import EventForm from '@/components/manager/EventForm';
import { eventService } from '@/services/eventService';
import { ArrowLeft } from 'lucide-react';
import { useManagerEvent } from '@/hooks/useManagerEvent';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export default function EditEventPage() {
    const router = useRouter();
    const { event, eventId, isReady } = useManagerEvent();
    const [loading, setLoading] = useState(false);

    const uploadThumbnail = async (eventId, file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(
            `${API_BASE_URL}/api/upload/event-thumbnail/${eventId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    };

    const handleUpdate = async (data, thumbnailFile) => {
        setLoading(true);
        try {
            // Backend gets userId from JWT token
            await eventService.updateEvent(eventId, data);
            
            // Upload thumbnail if a new file was selected
            if (thumbnailFile) {
                try {
                    await uploadThumbnail(eventId, thumbnailFile);
                    console.log("Thumbnail uploaded successfully");
                } catch (uploadError) {
                    console.error("Failed to upload thumbnail:", uploadError);
                }
            }
            
            toast({
                title: "Thành công",
                description: "Cập nhật sự kiện thành công!",
            });
            router.push(`/manager/events/${eventId}`);
        } catch (error) {
            console.error("Failed to update event", error);
            toast({
                title: "Lỗi",
                description: error.response?.data?.message || error.message || "Cập nhật sự kiện thất bại",
                variant: "destructive",
            });
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

                <EventForm initialData={event} onSubmit={handleUpdate} loading={loading} eventId={eventId} />
            </div>
        </div>
    );
}

EditEventPage.getLayout = function getLayout(page) {
    return <ManagerLayout>{page}</ManagerLayout>;
};
