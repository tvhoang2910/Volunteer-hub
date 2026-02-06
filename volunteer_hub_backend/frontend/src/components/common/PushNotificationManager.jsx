"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { pushService } from "@/services/pushService";

/**
 * Component tự động đăng ký push notification khi user đăng nhập
 * Chạy silent trong background, không hiển thị UI
 */
export default function PushNotificationManager() {
    const { isAuthenticated, authReady } = useAuth();
    const hasSubscribed = useRef(false);

    useEffect(() => {
        console.log("[Push] Component mounted, authReady:", authReady, "isAuthenticated:", isAuthenticated);
        
        // Chỉ chạy khi auth ready và user đã đăng nhập
        if (!authReady) {
            console.log("[Push] Auth chưa ready, đợi...");
            return;
        }
        
        if (!isAuthenticated) {
            console.log("[Push] User chưa đăng nhập, bỏ qua");
            return;
        }
        
        // Tránh subscribe nhiều lần
        if (hasSubscribed.current) {
            console.log("[Push] Đã subscribe trước đó, bỏ qua");
            return;
        }

        // Kiểm tra browser hỗ trợ
        if (!("serviceWorker" in navigator)) {
            console.log("[Push] Browser không hỗ trợ Service Worker");
            return;
        }
        
        if (!("PushManager" in window)) {
            console.log("[Push] Browser không hỗ trợ PushManager");
            return;
        }

        console.log("[Push] Notification.permission:", Notification.permission);

        // Nếu user đã cho phép notifications, tự động subscribe
        if (Notification.permission === "granted") {
            console.log("[Push] Permission granted, bắt đầu auto-subscribe...");
            autoSubscribe();
        } else if (Notification.permission === "default") {
            console.log("[Push] Permission default - cần user cho phép trước");
            // Yêu cầu quyền
            requestNotificationPermission();
        } else {
            console.log("[Push] Permission denied - user đã từ chối");
        }
    }, [authReady, isAuthenticated]);

    const requestNotificationPermission = async () => {
        try {
            console.log("[Push] Yêu cầu quyền notification...");
            const permission = await Notification.requestPermission();
            console.log("[Push] Kết quả requestPermission:", permission);
            
            if (permission === "granted") {
                autoSubscribe();
            }
        } catch (error) {
            console.error("[Push] Lỗi khi yêu cầu quyền:", error);
        }
    };

    const autoSubscribe = async () => {
        try {
            hasSubscribed.current = true;
            console.log("[Push] Bắt đầu auto-subscribe...");
            
            console.log("[Push] Đợi service worker ready...");
            const registration = await navigator.serviceWorker.ready;
            console.log("[Push] Service worker ready:", registration.scope);
            
            // Kiểm tra xem đã subscribe chưa
            let subscription = await registration.pushManager.getSubscription();
            console.log("[Push] Existing subscription:", subscription ? "có" : "không có");
            
            if (!subscription) {
                // Lấy VAPID key từ backend
                console.log("[Push] Lấy VAPID key từ backend...");
                const vapidPublicKey = await pushService.getVapidPublicKey();
                console.log("[Push] VAPID key nhận được:", vapidPublicKey ? vapidPublicKey.substring(0, 20) + "..." : "NULL");
                
                if (!vapidPublicKey) {
                    throw new Error("VAPID key is empty or null");
                }
                
                const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
                console.log("[Push] Converted VAPID key length:", convertedVapidKey.length);

                // Subscribe
                console.log("[Push] Đang subscribe với PushManager...");
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidKey,
                });
                
                console.log("[Push] Subscribe thành công!");
                console.log("[Push] Endpoint:", subscription.endpoint.substring(0, 50) + "...");
            }

            // Gửi subscription lên backend (luôn gửi để đảm bảo sync)
            const subJson = subscription.toJSON();
            console.log("[Push] Gửi subscription lên backend...");
            console.log("[Push] Data:", {
                endpoint: subJson.endpoint?.substring(0, 50) + "...",
                p256dh: subJson.keys?.p256dh ? "có" : "không",
                auth: subJson.keys?.auth ? "có" : "không",
            });
            
            await pushService.saveSubscription({
                endpoint: subJson.endpoint || "",
                p256dh: subJson.keys?.p256dh || "",
                auth: subJson.keys?.auth || "",
            });

            console.log("[Push] ✅ Subscription đã được lưu vào backend thành công!");
        } catch (error) {
            console.error("[Push] ❌ Lỗi khi auto-subscribe:", error);
            console.error("[Push] Error details:", error.message, error.stack);
            hasSubscribed.current = false; // Cho phép retry
        }
    };

    // Không render gì cả
    return null;
}

// Helper function
function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
