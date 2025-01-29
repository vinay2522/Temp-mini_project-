// Feature flags to control new functionality
const features = {
    // Core features - always enabled
    core: {
        authentication: true,
        basicBooking: true,
        emergencyBooking: true,
        userProfile: true,
        contactForm: true
    },

    // Detailed booking features
    detailedBooking: {
        enabled: true,
        fareCalculation: true,
        locationServices: true,
        multipleBookings: true,
        statusTracking: true
    },

    // New features - can be toggled
    enhanced: {
        advancedPricing: true,
        realTimeTracking: false,
        notifications: false,
        analytics: false
    }
};

// Feature check middleware
const checkFeature = (featureKey) => {
    return (req, res, next) => {
        const [category, feature] = featureKey.split('.');
        if (!features[category] || !features[category][feature]) {
            return res.status(404).json({
                success: false,
                message: 'This feature is not available'
            });
        }
        next();
    };
};

module.exports = {
    features,
    checkFeature
};
