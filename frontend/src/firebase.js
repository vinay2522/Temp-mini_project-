import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const messaging = getMessaging(app);

// Function to get FCM token and register with backend
export const initializeMessaging = async (phoneNumber) => {
    try {
        // Request notification permission
        let permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
        
        if (permission !== 'granted') {
            throw new Error('Notification permission denied');
        }

        // Get FCM token with vapid key
        const token = await getToken(messaging, {
            vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
        });

        if (!token) {
            throw new Error('Failed to get FCM token');
        }

        console.log('FCM Token:', token);

        // Clean phone number
        const cleanPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        if (cleanPhoneNumber.length !== 10) {
            throw new Error('Invalid phone number format');
        }

        // Register token with backend
        const response = await fetch('/api/driver/register-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fcmToken: token,
                phoneNumber: cleanPhoneNumber,
                vehicleNumber: 'DEFAULT'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to register FCM token with backend');
        }

        // Set up foreground message handler
        onMessage(messaging, (payload) => {
            console.log('Received foreground message:', payload);
            
            // Create and show notification for foreground messages
            if (Notification.permission === 'granted') {
                const notificationTitle = payload.notification.title;
                const notificationOptions = {
                    body: payload.notification.body,
                    icon: '/notification-icon.png',
                    badge: '/notification-badge.png',
                    data: payload.data,
                    requireInteraction: true,
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

                new Notification(notificationTitle, notificationOptions);
            }
        });

        return {
            success: true,
            token,
            phoneNumber: cleanPhoneNumber
        };
    } catch (error) {
        console.error('Error initializing messaging:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Export initialized Firebase instances
export { app, auth, messaging };
