const admin = require('firebase-admin');
const Driver = require('../models/Driver');

// Initialize Firebase Admin with service account
const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env.FIREBASE_PROJECT_ID
        });
        console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
        console.error('Firebase initialization error:', error);
        throw error;
    }
}

const createNotificationPayload = (bookingDetails) => {
    return {
        notification: {
            title: ' New Emergency Booking Request',
            body: `Emergency Type: ${bookingDetails.emergencyType}\nLocation: ${bookingDetails.location.address}`
        },
        data: {
            bookingId: bookingDetails.bookingId,
            emergencyType: bookingDetails.emergencyType,
            latitude: bookingDetails.location.latitude.toString(),
            longitude: bookingDetails.location.longitude.toString(),
            address: bookingDetails.location.address,
            timestamp: new Date().toISOString(),
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
        },
        android: {
            priority: 'high',
            notification: {
                channelId: 'emergency_alerts',
                priority: 'max',
                sound: 'emergency',
                defaultSound: true,
                defaultVibrateTimings: true,
                visibility: 'public',
                icon: 'notification_icon'
            }
        },
        apns: {
            payload: {
                aps: {
                    sound: 'emergency.caf',
                    badge: 1,
                    'mutable-content': 1,
                    'content-available': 1,
                    category: 'EMERGENCY_BOOKING'
                }
            },
            headers: {
                'apns-priority': '10',
                'apns-push-type': 'alert'
            }
        },
        webpush: {
            headers: {
                Urgency: 'high',
                TTL: '86400'
            },
            notification: {
                title: ' New Emergency Booking Request',
                body: `Emergency Type: ${bookingDetails.emergencyType}\nLocation: ${bookingDetails.location.address}`,
                icon: '/notification-icon.png',
                badge: '/notification-badge.png',
                tag: bookingDetails.bookingId,
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
            },
            fcmOptions: {
                link: `/booking/${bookingDetails.bookingId}`
            }
        }
    };
};

const sendNotificationToDriver = async (phoneNumber, bookingDetails) => {
    try {
        // Clean phone number
        const cleanPhoneNumber = phoneNumber.replace(/[^0-9]/g, '');
        if (cleanPhoneNumber.length !== 10) {
            throw new Error('Invalid phone number format');
        }

        const notificationPayload = createNotificationPayload(bookingDetails);
        let response;
        let usedMethod = 'topic';

        // First try to find the driver's FCM token
        const driver = await Driver.findOne({ phoneNumber: cleanPhoneNumber });
        
        if (driver?.fcmToken) {
            try {
                // Try sending to specific token
                response = await admin.messaging().send({
                    ...notificationPayload,
                    token: driver.fcmToken
                });
                usedMethod = 'token';
                console.log('Sent notification using FCM token');
            } catch (tokenError) {
                console.warn('Failed to send to token, falling back to topic:', tokenError.message);
            }
        }

        // If token sending failed or no token found, use topic
        if (!response) {
            const topic = `driver_${cleanPhoneNumber}`;
            response = await admin.messaging().send({
                ...notificationPayload,
                topic: topic
            });
            console.log('Sent notification using topic:', topic);
        }

        console.log('Successfully sent notification:', response);
        
        return { 
            success: true, 
            messageId: response,
            method: usedMethod
        };
    } catch (error) {
        console.error('Error sending notification:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
};

module.exports = {
    sendNotificationToDriver
};
