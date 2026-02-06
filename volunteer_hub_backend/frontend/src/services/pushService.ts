/**
 * @file pushService.ts
 * @description Service for handling Web Push notifications for Admin/Manager
 * Includes sending broadcast notifications and managing delivery stats
 */

import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
};

export interface BroadcastRequest {
    title: string;
    content: string;
    sendToAll?: boolean;
    targetUserIds?: string[];
    targetRoles?: string[];
}

export interface DeliveryStats {
    totalSent: number;
    successCount: number;
    failedCount: number;
    invalidSubscriptionCount: number;
    rateLimitedCount: number;
    networkErrorCount: number;
}

export const pushService = {
    /**
     * Gửi broadcast notification (Admin/Manager only)
     */
    async broadcastNotification(data: BroadcastRequest): Promise<{ message: string; data: string }> {
        try {
            const response = await axios.post(
                `${API_URL}/api/notifications/broadcast`,
                data,
                { headers: getAuthHeader() }
            );
            return response.data;
        } catch (error: any) {
            console.error("Broadcast Notification Error:", error);
            throw error?.response?.data || error;
        }
    },

    /**
     * Lấy thống kê delivery (Admin/Manager only)
     */
    async getDeliveryStats(): Promise<DeliveryStats> {
        try {
            const response = await axios.get(
                `${API_URL}/api/notifications/delivery/stats`,
                { headers: getAuthHeader() }
            );
            return response.data.data;
        } catch (error: any) {
            console.error("Get Delivery Stats Error:", error);
            throw error?.response?.data || error;
        }
    },

    /**
     * Retry failed deliveries (Admin/Manager only)
     */
    async retryFailedDeliveries(): Promise<string> {
        try {
            const response = await axios.post(
                `${API_URL}/api/notifications/delivery/retry`,
                {},
                { headers: getAuthHeader() }
            );
            return response.data.data;
        } catch (error: any) {
            console.error("Retry Failed Deliveries Error:", error);
            throw error?.response?.data || error;
        }
    },

    /**
     * Cleanup invalid subscriptions (Admin/Manager only)
     */
    async cleanupInvalidSubscriptions(): Promise<string> {
        try {
            const response = await axios.post(
                `${API_URL}/api/notifications/delivery/cleanup`,
                {},
                { headers: getAuthHeader() }
            );
            return response.data.data;
        } catch (error: any) {
            console.error("Cleanup Subscriptions Error:", error);
            throw error?.response?.data || error;
        }
    },

    /**
     * Lấy VAPID public key để subscribe push notification
     */
    async getVapidPublicKey(): Promise<string> {
        try {
            const response = await axios.get(
                `${API_URL}/api/notifications/vapid-public-key`
            );
            return response.data;
        } catch (error: any) {
            console.error("Get VAPID Key Error:", error);
            throw error?.response?.data || error;
        }
    },

    /**
     * Lưu push subscription của user
     */
    async saveSubscription(subscription: { endpoint: string; p256dh: string; auth: string }): Promise<void> {
        try {
            await axios.post(
                `${API_URL}/api/notifications/subscription`,
                subscription,
                { headers: getAuthHeader() }
            );
        } catch (error: any) {
            console.error("Save Subscription Error:", error);
            throw error?.response?.data || error;
        }
    },
};
