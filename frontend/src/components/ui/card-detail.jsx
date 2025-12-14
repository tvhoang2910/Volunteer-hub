"use client"
import { useState } from "react"
import { CalendarIcon, MapPinIcon, UsersIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardHeader,
    CardDescription,
    CardTitle,
    CardFooter,
    CardContent
} from "@/components/ui/card"

const parseDate = (value) => {
    if (!value) return null
    const d = new Date(value)
    return Number.isNaN(d.getTime()) ? null : d
}

const formatDate = (dateStr) => {
    const d = parseDate(dateStr)
    if (!d) return "N/A"
    return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    })
}

const EventCard = ({ event, onRegister, onCancel, onClick }) => {
    const [applied, setApplied] = useState(
        event?.user_registration_status === "Applied"
    )

    const now = new Date()
    const deadlineDate = parseDate(event?.registration_deadline) || parseDate(event?.registrationDeadline)
    const isClosed = deadlineDate ? deadlineDate < now : false

    const handleRegister = (e) => {
        e.stopPropagation() // Stop bubbling to card
        setApplied(true)
        onRegister && onRegister(event?.event_id)
    }

    const handleCancel = (e) => {
        e.stopPropagation() // Stop bubbling to card
        setApplied(false)
        onCancel && onCancel(event?.event_id)
    }

    const handleCardClick = () => {
        onClick && onClick(event)
    }

    return (
        <div
            className="relative max-w-md rounded-xl bg-gradient-to-r from-indigo-200 to-sky-300 pt-0 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
            onClick={handleCardClick}
        >
            {/* Header image */}
            <div
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${event?.image || 'https://cdn.shadcnstudio.com/ss-assets/components/card/image-11.png'})` }}
            />

            <Card className="border-none">
                <CardHeader>
                    <CardTitle className="text-lg font-bold">{event?.title}</CardTitle>
                    <CardDescription className="flex flex-col gap-1 text-sm">
                        <span className="flex items-center gap-1">
                            <MapPinIcon className="size-4" /> {event?.location}
                        </span>
                        <span className="flex items-center gap-1">
                            <CalendarIcon className="size-4" />{" "}
                            {formatDate(event?.start_time)} -{" "}
                            {formatDate(event?.end_time)}
                        </span>
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                        {event?.description}
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-sm">
                        <UsersIcon className="size-4" />
                        {event?.current_volunteers || 0}/{event?.max_volunteers || 0} người tham gia
                    </div>

                    <div className="mt-2">
                        <Badge variant={isClosed ? "secondary" : "outline"}>
                            Hạn đăng ký: {formatDate(event?.registration_deadline || event?.registrationDeadline)}
                        </Badge>
                    </div>
                </CardContent>

                <CardFooter className="justify-end">
                    {isClosed ? (
                        <Button disabled variant="secondary" className="w-full">
                            Đã đóng đăng ký
                        </Button>
                    ) : applied ? (
                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={handleCancel}
                        >
                            Hủy đăng ký
                        </Button>
                    ) : (
                        <Button className="w-full" onClick={handleRegister}>
                            Đăng ký tham gia
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}

export default EventCard
