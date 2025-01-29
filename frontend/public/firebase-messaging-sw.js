importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyAL9FKmHqjFf8uH9svsTzD43QwZ00dvqNE",
    authDomain: "sevadrive-9c592.firebaseapp.com",
    projectId: "sevadrive-9c592",
    storageBucket: "sevadrive-9c592.appspot.com",
    messagingSenderId: "454579964481",
    appId: "1:454579964481:web:3d1f0f9f9f9f9f9f9f9f9f"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/notification-icon.png',
        badge: '/notification-badge.png',
        tag: payload.data?.bookingId || 'test-notification',
        data: payload.data,
        requireInteraction: true,
        vibrate: [200, 100, 200],
        actions: [
            {
                action: 'accept',
                title: 'Accept'
            },
            {
                action: 'reject',
                title: 'Reject'
            }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked:', event);

    const bookingId = event.notification.tag;
    const action = event.action;

    event.notification.close();

    if (action === 'accept' || action === 'reject') {
        const status = action.toUpperCase();
        
        // Update booking status
        event.waitUntil(
            fetch(`/api/emergency-booking/status/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            })
        );
    }

    // Open or focus the app
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            for (let client of windowClients) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Handle push event
self.addEventListener('push', function(event) {
    console.log('Push message received:', event);
    
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.notification.body,
            icon: '/notification-icon.png',
            badge: '/notification-badge.png',
            tag: data.data?.bookingId || 'test-notification',
            data: data.data,
            requireInteraction: true,
            vibrate: [200, 100, 200],
            actions: [
                {
                    action: 'accept',
                    title: 'Accept'
                },
                {
                    action: 'reject',
                    title: 'Reject'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.notification.title, options)
        );
    }
});
