const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

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
        process.exit(1);
    }
}

async function sendTestNotification() {
    try {
        const phoneNumber = '9632598430';
        const topic = `driver_${phoneNumber}`;

        const message = {
            notification: {
                title: '🔔 Test Notification',
                body: 'This is a test notification sent at ' + new Date().toLocaleString()
            },
            data: {
                type: 'TEST',
                timestamp: new Date().toISOString()
            },
            topic: topic
        };

        console.log('Sending test notification to topic:', topic);
        const response = await admin.messaging().send(message);
        console.log('Successfully sent notification:', response);
        
        process.exit(0);
    } catch (error) {
        console.error('Error sending notification:', error);
        process.exit(1);
    }
}

// Run the test
sendTestNotification();
