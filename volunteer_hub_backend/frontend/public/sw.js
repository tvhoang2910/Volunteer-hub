const CACHE_NAME = 'volunteer-hub-v1';
const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/favicon.ico',
];

// ================================
// Firebase Messaging (BACKGROUND)
// ================================

// Only Firebase Messaging is supported in service worker
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// ⚠️ NÊN dùng env inject lúc build, đây để placeholder
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background push from Firebase
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw] Background message:', payload);

    if (!payload?.notification) return;

    const { title, body } = payload.notification;

    self.registration.showNotification(title, {
        body,
        icon: '/logo.png',
    });
});

// ================================
// Native Web Push (Standard API)
// ================================

self.addEventListener('push', function(event) {
    console.log('[SW] Push Received');
    console.log(`[SW] Push had this data: "${event.data.text()}"`);

    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { title: 'New Notification', body: event.data.text() };
        }
    }

    const title = data.title || 'Volunteer Hub';
    const options = {
        body: data.body || 'Bạn có thông báo mới!',
        icon: '/logo.png',
        badge: '/logo.png',
        data: data.data || {}
    };

    const notificationPromise = self.registration.showNotification(title, options);
    event.waitUntil(notificationPromise);
});

self.addEventListener('notificationclick', function(event) {
    console.log('[SW] Notification click Received.');

    event.notification.close();

    const url = event.notification.data?.url || '/'; // Default to root if no URL provided

    event.waitUntil(
        clients.matchAll({type: 'window'}).then(windowClients => {
            // Check if there is already a window/tab open with the target URL
            for (var i = 0; i < windowClients.length; i++) {
                var client = windowClients[i];
                // If so, just focus it.
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, then open the target URL in a new window/tab.
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// ================================
// Service Worker Lifecycle
// ================================

self.addEventListener('install', (event) => {
    console.log('[SW] Installed');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activated');
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            )
        )
    );
    return self.clients.claim();
});

// ================================
// Fetch Strategy
// ================================

self.addEventListener('fetch', (event) => {
    // Skip cross-origin
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Network First for HTML navigation
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, clone);
                        });
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Stale-While-Revalidate for other assets
    event.respondWith(
        caches.match(event.request).then((cached) => {
            const fetchPromise = fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        const clone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, clone);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => cached);

            return cached || fetchPromise;
        })
    );
});
