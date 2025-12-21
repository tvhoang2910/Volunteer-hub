"use client";

import React from "react";
import { Bell, Check, Trash2, Clock, AlertCircle, CalendarCheck, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton.jsx";
import { cn } from "@/lib/utils";

// Status configuration
const STATUS_CONFIG = {
  "Chưa đọc": {
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    container: "bg-gradient-to-r from-emerald-50/80 to-teal-50/50 border-emerald-100 hover:border-emerald-200",
    dot: "bg-emerald-500"
  },
  "Đã đọc": {
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    container: "bg-white hover:bg-slate-50/50 border-slate-100 hover:border-slate-200",
    dot: "bg-slate-300"
  }
};

// Notification type icons
const TYPE_ICONS = {
  EVENT_REGISTRATION: CalendarCheck,
  EVENT_REMINDER: Clock,
  ALERT: AlertCircle,
  INFO: Info,
  DEFAULT: Bell
};

// Format date to Vietnamese locale
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return dateStr;
  }
};

// Loading skeleton
const NotificationSkeleton = () => (
  <div className="flex items-start gap-4 p-4 border-b border-slate-100">
    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
    </div>
    <div className="flex gap-2">
      <Skeleton className="h-8 w-8 rounded" />
      <Skeleton className="h-8 w-8 rounded" />
    </div>
  </div>
);

// Single notification item
const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const isUnread = notification.status === "Chưa đọc";
  const config = STATUS_CONFIG[notification.status] || STATUS_CONFIG["Đã đọc"];
  const IconComponent = TYPE_ICONS[notification.type] || TYPE_ICONS.DEFAULT;

  return (
    <div
      className={cn(
        "relative flex items-start gap-4 p-4 border-b transition-all duration-200 group",
        config.container
      )}
    >
      {/* Unread indicator dot */}
      {isUnread && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2">
          <span className={cn("block w-2 h-2 rounded-full animate-pulse", config.dot)} />
        </div>
      )}

      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
        isUnread ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
      )}>
        <IconComponent className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 ml-2">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className={cn("text-xs font-medium", config.badge)}>
            {notification.status}
          </Badge>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(notification.date)}
          </span>
        </div>
        
        <h4 className={cn(
          "text-sm font-semibold mb-1 line-clamp-1",
          isUnread ? "text-slate-900" : "text-slate-700"
        )}>
          {notification.title}
        </h4>
        
        <p className="text-sm text-slate-500 line-clamp-2">
          {notification.message || notification.description}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isUnread && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead?.(notification.id);
            }}
            title="Đánh dấu đã đọc"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(notification.id);
          }}
          title="Xóa thông báo"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

/**
 * NotificationList component
 * Displays a list of notifications with actions to mark as read or delete
 * 
 * @param {Object[]} notifications - Array of notification objects
 * @param {boolean} loading - Loading state
 * @param {Function} onMarkAsRead - Callback when marking a notification as read
 * @param {Function} onDelete - Callback when deleting a notification
 */
export default function NotificationList({
  notifications = [],
  loading = false,
  onMarkAsRead,
  onDelete
}) {
  // Show loading skeletons
  if (loading) {
    return (
      <div className="divide-y divide-slate-100">
        {[1, 2, 3, 4, 5].map((i) => (
          <NotificationSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <Bell className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-lg font-medium">Không có thông báo nào</p>
        <p className="text-sm mt-1">Bạn đã xem hết các thông báo</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
