import React from "react"
import AnnounceDetail from "@/components/ui/announce-detail.jsx"

export default function NotifyPage() {
    return (
        <div className="container mx-auto pt-10 pl-64 space-y-6">
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Thông báo</h1>
                <AnnounceDetail/>
            </div>
        </div>
    )
}
