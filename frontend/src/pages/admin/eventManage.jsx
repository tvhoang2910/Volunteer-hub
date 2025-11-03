"use client"

import { useEffect, useState } from "react"
import { Search } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"

import { useRouter } from "next/router"

export default function EventsManagement() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/admin')
    } else {
      getAllEvents()
    }
  }, [router])

  const [events, setEvents] = useState([])
  const [searchQuery, setSearchQuery] = useState("")

  const parseMaybeTimestamp = (value) => {
    if (!value) return null
    if (typeof value === 'string' || typeof value === 'number') return new Date(value)
    // Firestore Timestamp-like { seconds, nanoseconds }
    if (value.seconds) return new Date(value.seconds * 1000)
    // Date-like string field
    return new Date(value)
  }

  const getAllEvents = async () => {
    const getAllEventsApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/event/all`

    try {
      const response = await fetch(getAllEventsApi, {
        method: "GET",
        headers: {
          "admin": "true",
          "authorization": "Bearer " + localStorage.getItem("token")
        },
      })
      if (!response.ok) {
        throw new Error("Send request failed")
      }
      const res = await response.json()
      const serverEvents = res?.data?.events || res?.events || []
      setEvents(serverEvents.map(e => {
        return {
          event_id: e.event_id || e.id,
          created_by_user_id: e.created_by_user_id,
          title: e.title,
          description: e.description,
          location: e.location,
          start_time: parseMaybeTimestamp(e.start_time),
          end_time: parseMaybeTimestamp(e.end_time),
          max_volunteers: e.max_volunteers,
          admin_approval_status: e.admin_approval_status || 'Pending',
          is_archived: !!e.is_archived,
          created_at: parseMaybeTimestamp(e.created_at),
        }
      }))
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách sự kiện. Vui lòng thử lại.",
        variant: "destructive"
      })
    }
  }

  const handleRemove = async (eventId) => {
    const previous = events
    setEvents(events.filter(ev => ev.event_id !== eventId))
    const deleteEventApi = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/event/`

    try {
      const response = await fetch(deleteEventApi +
        new URLSearchParams({
          "id": eventId,
        }).toString(), {
        method: "DELETE",
        headers: {
          "admin": "true",
          "authorization": "Bearer " + localStorage.getItem("token")
        },
      })
      if (!response.ok) {
        throw new Error("Send request failed")
      }
      toast({
        title: "Thông báo",
        description: "Sự kiện đã được xóa thành công.",
      })
    } catch (error) {
      setEvents(previous)
      toast({
        title: "Xóa sự kiện không thành công",
        description: "Đã có lỗi xảy ra khi kết nối với máy chủ, vui lòng thử lại.",
        variant: "destructive"
      })
    }
  }

  const renderStatus = (status, isArchived) => {
    if (isArchived) return <Badge className="bg-gray-400 hover:bg-gray-400 text-black">Đã lưu trữ</Badge>
    switch ((status || '').toLowerCase()) {
      case 'approved':
        return <Badge className="bg-green-400 hover:bg-green-400 text-black">Đã duyệt</Badge>
      case 'rejected':
        return <Badge className="bg-red-400 hover:bg-red-400 text-black">Từ chối</Badge>
      default:
        return <Badge className="bg-yellow-300 hover:bg-yellow-300 text-black">Chờ duyệt</Badge>
    }
  }

  const formatDateTime = (d) => d ? new Date(d).toLocaleString('vi-VN') : "—"

  return (
    <div className="container mx-auto pt-10 pl-10 pr-10 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Quản Lý Sự Kiện</h1>
      </div>

      <div className="relative mb-6">
        <Input
          type="text"
          placeholder="Tìm kiếm theo tiêu đề hoặc địa điểm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-4 pr-10 h-10 border rounded"
        />
        <Button
          size="sm"
          className="absolute right-0 top-0 h-10 bg-blue-500 hover:bg-blue-600 rounded-l-none"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <div className="border rounded-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="text-center">TIÊU ĐỀ</TableHead>
              <TableHead className="text-center">ĐỊA ĐIỂM</TableHead>
              <TableHead className="text-center">BẮT ĐẦU</TableHead>
              <TableHead className="text-center">KẾT THÚC</TableHead>
              <TableHead className="text-center">TÌNH NGUYỆN VIÊN TỐI ĐA</TableHead>
              <TableHead className="text-center">TRẠNG THÁI</TableHead>
              <TableHead className="text-center">TÙY CHỈNH</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.filter(ev => {
              const q = searchQuery.toLowerCase()
              return (
                (ev.title || '').toLowerCase().includes(q) ||
                (ev.location || '').toLowerCase().includes(q)
              )
            }).map((ev) => (
              <TableRow key={ev.event_id} className="odd:bg-gray-50 even:bg-white">
                <TableCell className="text-center font-medium">{ev.title}</TableCell>
                <TableCell className="text-center">{ev.location}</TableCell>
                <TableCell className="text-center">{formatDateTime(ev.start_time)}</TableCell>
                <TableCell className="text-center">{formatDateTime(ev.end_time)}</TableCell>
                <TableCell className="text-center">{ev.max_volunteers ?? '—'}</TableCell>
                <TableCell className="text-center">{renderStatus(ev.admin_approval_status, ev.is_archived)}</TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemove(ev.event_id)}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 h-7"
                    >
                      Xóa
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

      </div>
    </div>
  )
}