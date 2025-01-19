const admin = require('firebase-admin');
const path = require('path');

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

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
    });
} catch (error) {
    console.error('Firebase initialization error:', error);
}

const sendNotificationToDriver = async (phoneNumber, bookingDetails) => {
    try {
        // Create a message for the driver
        const message = {
            notification: {
                title: 'New Ambulance Booking Request',
                body: `Emergency booking request at ${bookingDetails.location.address}`
            },
            data: {
                bookingId: bookingDetails.bookingId,
                emergencyType: bookingDetails.emergencyType,
                latitude: bookingDetails.location.latitude.toString(),
                longitude: bookingDetails.location.longitude.toString(),
                address: bookingDetails.location.address,
                type: 'BOOKING_REQUEST'
            },
            topic: `driver_${phoneNumber.replace(/[^0-9]/g, '')}`
        };

        // Send the message
        const response = await admin.messaging().send(message);
        return { success: true, messageId: response };
    } catch (error) {
        console.error('Error sending notification:', error);
        // Don't throw error, just return failure status
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendNotificationToDriver
};
