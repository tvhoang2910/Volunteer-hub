import { useEffect } from 'react';
import { messaging } from '../configs/firebaseConfig';
import { getToken, onMessage } from 'firebase/messaging';
import { useToast } from "@/hooks/use-toast";

const useFirebaseNotification = () => {
    const { toast } = useToast();

    useEffect(() => {
        const requestPermission = async () => {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    // Get Service Worker Registration
                    const registration = await navigator.serviceWorker.ready;

                    if (messaging) {
                        const token = await getToken(messaging, {
                            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY, // Optional: needed for web push certificates
                            serviceWorkerRegistration: registration
                        });
                        console.log('FCM Token:', token);
                        // Here you would typically send this token to your backend
                    }
                } else {
                    console.log('Notification permission not granted');
                }
            } catch (error) {
                console.error('Error requesting notification permission:', error);
            }
        };

        requestPermission();

        if (messaging) {
            const unsubscribe = onMessage(messaging, (payload) => {
                console.log('Foreground message received:', payload);
                const { title, body } = payload.notification;

                // Show toast or custom UI for foreground notification
                toast({
                    title: title,
                    description: body,
                    duration: 5000,
                });
            });

            return () => {
                unsubscribe();
            };
        }
    }, [toast]);
};

export default useFirebaseNotification;
