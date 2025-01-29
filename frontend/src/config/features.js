// Frontend feature configuration
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

// Feature check hook
export const useFeature = (featureKey) => {
    const [category, feature] = featureKey.split('.');
    return features[category] && features[category][feature];
};

export default features;
