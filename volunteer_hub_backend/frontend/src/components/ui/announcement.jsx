import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const announcementVariants = cva(
    "group relative flex items-start gap-4 rounded-xl px-4 py-4 transition-all hover:scale-[1.01] hover:shadow-md border",
    {
        variants: {
            variant: {
                default: "bg-white border-zinc-200 text-zinc-900",
                ghost: "bg-transparent border-transparent hover:bg-zinc-50",
                colored: "border-transparent",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

const Announcement = React.forwardRef(({ className, variant, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(announcementVariants({ variant }), className)}
        {...props}
    />
))
Announcement.displayName = "Announcement"

const AnnouncementTag = React.forwardRef(({ className, ...props }, ref) => (
    <span
        ref={ref}
        className={cn(
            "shrink-0 inline-flex items-center justify-center rounded-md px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
            className
        )}
        {...props}
    />
))
AnnouncementTag.displayName = "AnnouncementTag"

const AnnouncementTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn("text-sm font-semibold leading-none tracking-tight flex items-center gap-2", className)}
        {...props}
    />
))
AnnouncementTitle.displayName = "AnnouncementTitle"

const AnnouncementDescription = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed", className)}
        {...props}
    />
))
AnnouncementDescription.displayName = "AnnouncementDescription"

export { Announcement, AnnouncementTag, AnnouncementTitle, AnnouncementDescription }
