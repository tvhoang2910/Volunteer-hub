import { useState, useEffect } from 'react';
import { pushService } from '@/services/pushService';
import { useToast } from "@/hooks/use-toast";

const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

export function usePushSubscription() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSupported, setIsSupported] = useState(false);
    const [permission, setPermission] = useState('default');
    const { toast } = useToast();

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
            checkSubscription();
        } else {
            setLoading(false);
        }
    }, []);

    const checkSubscription = async () => {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setIsSubscribed(!!subscription);
        } catch (error) {
            console.error('Error checking subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const subscribe = async () => {
        try {
            setLoading(true);
            const registration = await navigator.serviceWorker.ready;
            
            // Get VAPID key from backend
            const vapidPublicKey = await pushService.getVapidPublicKey();
            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

            // Subscribe via browser
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            // Prepare data for backend
            const subJson = subscription.toJSON();
            const subscriptionData = {
                endpoint: subJson.endpoint || '',
                p256dh: subJson.keys?.p256dh || '',
                auth: subJson.keys?.auth || ''
            };

            // Save to backend
            await pushService.saveSubscription(subscriptionData);
            
            setIsSubscribed(true);
            setPermission('granted');
            toast({
                title: "Thành công",
                description: "Đã đăng ký nhận thông báo thành công",
                variant: "success"
            });
            
        } catch (error) {
            console.error('Failed to subscribe:', error);
            if (Notification.permission === 'denied') {
                toast({
                    title: "Lỗi",
                    description: "Bạn đã chặn thông báo. Vui lòng bật lại trong cài đặt trình duyệt.",
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Lỗi",
                    description: "Đăng ký thất bại. Vui lòng thử lại.",
                    variant: "destructive"
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const unsubscribe = async () => {
        try {
            setLoading(true);
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await subscription.unsubscribe();
                setIsSubscribed(false);
                toast({
                    title: "Thành công",
                    description: "Đã hủy đăng ký nhận thông báo",
                    variant: "success"
                });
            }
        } catch (error) {
            console.error('Failed to unsubscribe:', error);
            toast({
                title: "Lỗi",
                description: "Hủy đăng ký thất bại",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        isSubscribed,
        loading,
        isSupported,
        permission,
        subscribe,
        unsubscribe
    };
}
