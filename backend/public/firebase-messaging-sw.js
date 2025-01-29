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

    const notificationTitle = payload.notification.title || 'New Notification';
    const notificationOptions = {
        body: payload.notification.body || 'You have a new notification',
        icon: '/notification-icon.png',
        badge: '/notification-badge.png',
        tag: payload.data?.bookingId || 'general-notification',
        data: payload.data || {},
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

    return self.registration.showNotification(notificationTitle, notificationOptions);
});
