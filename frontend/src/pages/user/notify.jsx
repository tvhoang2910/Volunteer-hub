import React from "react"
import AnnounceDetail from "@/components/ui/announce-detail.jsx"
import { useNotifications } from "@/hooks/useNotifications"

export default function NotifyPage() {
    const {
        notifications,
        isLoading,
        error,
        currentPage,
        totalPages,
        changePage,
        markAsRead
    } = useNotifications();

    return (
        <div className="container mx-auto pt-10 pl-8 space-y-6">
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Thông báo</h1>
                <AnnounceDetail
                    notifications={notifications}
                    isLoading={isLoading}
                    error={error}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={changePage}
                    onMarkRead={markAsRead}
                />
            </div>
        </div>
    )
}
