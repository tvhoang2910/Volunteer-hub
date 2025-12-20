import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountInfo from "@/components/Account-Information/account-info";
import ActivityHistory from "@/components/Account-Information/activity-history";
import PasswordChange from "@/components/Account-Information/password-change";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useAccountInfo } from "@/hooks/useAccountInfo";
import { useEffect, useState } from "react";
import { User, History, Lock } from "lucide-react";
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export default function AccountPage() {
  const {
    personalInfo,
    setPersonalInfo,
    isEditing,
    setIsEditing,
    loading,
    errorMessage,
    handleUpdate,
  } = useAccountInfo();

  const [activityData, setActivityData] = useState([]);

  useEffect(() => {
    const fetchBookingHistory = async () => {
      if (!personalInfo || !personalInfo.bookingHistory) return;

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token is missing. Please log in.");
        return;
      }

      const bookings = await Promise.all(
        personalInfo.bookingHistory.map(async (bookingId) => {
          try {
            // const response = await fetch(
            //   `${API_BASE_URL}/api/booking?id=${bookingId}`,
            //   {
            //     headers: {
            //       Authorization: `Bearer ${token}`,
            //     },
            //   }
            // );
            const response = await axios.get(
                `${API_BASE_URL}/api/booking?id=${bookingId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.ok) {
              throw new Error("Failed to fetch booking.");
            }

            const { data } = await response.json();
            return {
              date: new Date(data.createdAt.seconds * 1000),
              type: "Đặt vé máy bay",
              bookingId: data.bookingId,
              details: `${data.departureCity} → ${data.arrivalCity}`,
            };
          } catch (error) {
            console.error(`Error fetching booking ${bookingId}:`, error);
            return null;
          }
        })
      );

      setActivityData(bookings.filter(Boolean));
    };

    fetchBookingHistory();
  }, [personalInfo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30 pt-8 pb-12 pl-16 pr-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-96" />
          </div>

          <div className="flex gap-4 border-b border-zinc-200 pb-1">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gray-50/30 pt-8 pb-12 pl-16 pr-6 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-lg font-medium">{errorMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 pt-8 pb-12 pl-16 pr-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
              Thông tin tài khoản
            </h1>
            <p className="text-zinc-500 mt-2">
              Quản lý thông tin cá nhân và cài đặt bảo mật của bạn
            </p>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="account" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-200 pb-1">
            <TabsList className="bg-transparent p-0 gap-6">
              <TabsTrigger
                value="account"
                className="rounded-none bg-transparent border-b-2 border-transparent px-2 pb-3 pt-2 font-semibold text-zinc-500 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 data-[state=active]:bg-transparent shadow-none flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                Thông tin tài khoản
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-none bg-transparent border-b-2 border-transparent px-2 pb-3 pt-2 font-semibold text-zinc-500 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 data-[state=active]:bg-transparent shadow-none flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                Lịch sử hoạt động
              </TabsTrigger>
              <TabsTrigger
                value="password"
                className="rounded-none bg-transparent border-b-2 border-transparent px-2 pb-3 pt-2 font-semibold text-zinc-500 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-700 data-[state=active]:bg-transparent shadow-none flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Thay đổi mật khẩu
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200">
            <TabsContent value="account" className="p-6 m-0">
              <AccountInfo
                personalInfo={personalInfo}
                setPersonalInfo={setPersonalInfo}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                handleUpdate={handleUpdate}
              />
            </TabsContent>

            <TabsContent value="history" className="p-6 m-0">
              <ActivityHistory activityData={activityData} />
            </TabsContent>

            <TabsContent value="password" className="p-6 m-0">
              <PasswordChange personalInfo={personalInfo} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

