import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SlideUpDetail from "@/components/ui/slide-up";
import BasicPagination from "@/components/ui/pagination";
import { Eye, Calendar, MapPin, Users, AlertTriangle, Loader, Bell, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
  AnnouncementDescription
} from "@/components/ui/announcement";
import { cn } from "@/lib/utils";

// --- Constants ---
const UNREAD_STATUS = 'Chưa đọc';
const ANIMATION_STAGGER_DELAY = 0.05;

const STATUS_COLORS = {
  unread: "bg-emerald-500 text-white shadow-emerald-200 shadow-sm",
  read: "bg-zinc-100 text-zinc-600 border border-zinc-200"
};

const NOTIFICATION_STYLES = {
  unread: "bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border-emerald-100/50 hover:border-emerald-200 hover:shadow-emerald-100/50",
  read: "hover:border-zinc-300 hover:shadow-zinc-100"
};

// --- Helper Functions ---
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const getStatusColor = (status) =>
  status === UNREAD_STATUS ? STATUS_COLORS.unread : STATUS_COLORS.read;

const isUnreadNotification = (status) => status === UNREAD_STATUS;

// --- Sub-components ---
const NotificationItem = ({ notification, onClick }) => {
  const isUnread = isUnreadNotification(notification.status);

  return (
    <Announcement
      onClick={() => onClick(notification)}
      variant={isUnread ? "colored" : "default"}
      className={cn(
        "cursor-pointer group relative overflow-hidden",
        isUnread ? NOTIFICATION_STYLES.unread : NOTIFICATION_STYLES.read
      )}
    >
      {isUnread && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-100/40 to-transparent rounded-bl-full pointer-events-none opacity-50" />
      )}

      <div className="flex-1 space-y-1.5 z-10">
        <div className="flex items-center gap-3 mb-1">
          <AnnouncementTag className={getStatusColor(notification.status)}>
            {notification.status}
          </AnnouncementTag>
          <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDate(notification.date)}
          </span>
        </div>

        <AnnouncementTitle className={cn(
          "text-base transition-colors",
          isUnread ? "text-emerald-950" : "text-zinc-900"
        )}>
          {notification.title}
        </AnnouncementTitle>

        <AnnouncementDescription className="line-clamp-2 pr-4">
          {notification.message}
        </AnnouncementDescription>
      </div>

      <div className="self-center z-10 pl-2">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-zinc-400 group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-all"
        >
          <Eye className="w-5 h-5" />
        </Button>
      </div>
    </Announcement>
  );
};

const InfoCard = ({ icon: Icon, color, label, value }) => (
  <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
    <div className={cn("p-2 rounded-lg bg-zinc-50 shrink-0", color.replace("text-", "bg-").replace("500", "50"))}>
      <Icon className={cn("w-5 h-5", color)} />
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">{label}</p>
      <div className="text-sm font-semibold text-zinc-900">{value}</div>
    </div>
  </div>
);

const EventInfoSection = ({ notification }) => {
  if (!notification.location) return null;

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wide">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        Chi tiết sự kiện
      </h4>

      <div className="grid grid-cols-1 gap-3">
        <InfoCard
          icon={MapPin}
          color="text-red-500"
          label="ĐỊA ĐIỂM"
          value={notification.location}
        />

        {notification.start_time && (
          <InfoCard
            icon={Calendar}
            color="text-blue-500"
            label="THỜI GIAN"
            value={
              <div className="flex flex-col">
                <span>{formatDate(notification.start_time).split(' ')[0]}</span>
                <span className="text-zinc-500 font-normal text-xs">
                  {formatDate(notification.start_time).split(' ')[1]} - {formatDate(notification.end_time).split(' ')[1]}
                </span>
              </div>
            }
          />
        )}

        {notification.max_volunteers && (
          <InfoCard
            icon={Users}
            color="text-purple-500"
            label="SỐ LƯỢNG"
            value={`${notification.current_volunteers || 0}/${notification.max_volunteers} người`}
          />
        )}
      </div>
    </div>
  );
};

const NotificationDetailSlideUp = ({ isOpen, onClose, notification }) => {
  if (!notification) return null;

  return (
    <SlideUpDetail
      isOpen={isOpen}
      onClose={onClose}
      title={notification.title}
      description={
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(notification.date)}
        </span>
      }
    >
      <div className="space-y-6 pb-6">
        <Badge className={cn(
          "px-3 py-1 text-sm rounded-full border-0",
          getStatusColor(notification.status)
        )}>
          {notification.status}
        </Badge>

        <div className="space-y-6">
          <div className="prose prose-zinc max-w-none text-zinc-700 leading-relaxed text-base bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
            <p>{notification.description || notification.message}</p>
          </div>

          <EventInfoSection notification={notification} />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Đóng
          </Button>
        </div>
      </div>
    </SlideUpDetail>
  );
};

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-24 min-h-[400px]">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
    >
      <Loader className="w-10 h-10 text-emerald-500/50" />
    </motion.div>
    <p className="text-zinc-500 font-medium mt-4">Đang tải thông báo...</p>
  </div>
);

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-16 bg-zinc-50/50 rounded-3xl border border-zinc-100 border-dashed"
  >
    <div className="bg-white w-16 h-16 rounded-full shadow-sm mx-auto mb-4 flex items-center justify-center">
      <Bell className="w-8 h-8 text-zinc-300" />
    </div>
    <p className="text-zinc-600 font-medium text-lg">Không có thông báo nào</p>
    <p className="text-zinc-400 text-sm mt-1">Bạn sẽ nhận được thông báo khi có sự kiện mới</p>
  </motion.div>
);

const ErrorAlert = ({ error }) => (
  <AnimatePresence>
    {error && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
      >
        <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-4 flex items-center gap-3 text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <span className="text-sm font-medium">Đang hiển thị dữ liệu demo: {error}</span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- Main Component ---
const AnnounceDetail = ({
  notifications,
  isLoading,
  error,
  currentPage,
  totalPages,
  onPageChange,
  onMarkRead
}) => {
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isSlideUpOpen, setIsSlideUpOpen] = useState(false);

  const handleViewDetails = (notification) => {
    setSelectedNotification(notification);
    setIsSlideUpOpen(true);
    if (isUnreadNotification(notification.status) && onMarkRead) {
      onMarkRead(notification.id);
    }
  };

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <ErrorAlert error={error} />

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence mode="popLayout">
            {notifications.map((notification, idx) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * ANIMATION_STAGGER_DELAY }}
              >
                <NotificationItem
                  notification={notification}
                  onClick={handleViewDetails}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {notifications.length > 0 && totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <BasicPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}

      <NotificationDetailSlideUp
        isOpen={isSlideUpOpen}
        onClose={() => setIsSlideUpOpen(false)}
        notification={selectedNotification}
      />
    </div>
  );
};

export default AnnounceDetail;
