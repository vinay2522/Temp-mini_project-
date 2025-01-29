const { sendPredictionNotification } = require('./services/predictionNotification');

async function testPredictionNotification() {
    try {
        // Sample prediction data
        const prediction = {
            risk_level: "High",
            probability: "85%",
            recommendation: "Immediate attention required"
        };

        // Additional context data
        const additionalData = {
            location: "Bangalore",
            timestamp: new Date().toISOString()
        };

        // Test phone number - replace with your test number
        const phoneNumber = '9632598430';  // Using the same test number as in test-notification.js

        console.log('Sending test prediction notification...');
        const response = await sendPredictionNotification(prediction, phoneNumber, additionalData);
        
        console.log('Notification Response:', response);
        
        process.exit(0);
    } catch (error) {
        console.error('Test Error:', error);
        process.exit(1);
    }
}

// Run the test
testPredictionNotification();
