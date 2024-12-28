import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaAmbulance, FaHeart, FaHospital, FaPhone, FaUserMd, FaWheelchair } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Services = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const services = [
    {
      id: 1,
      title: 'Emergency Ambulance',
      description: 'Immediate medical response with fully equipped ambulances and trained paramedics for critical emergencies.',
      features: [
        '24/7 Emergency Response',
        'Advanced Life Support',
        'GPS Tracking',
        'Trained Medical Staff'
      ],
      icon: <FaAmbulance className="w-12 h-12 text-seva-red" />,
      path: '/services/emergency-ambulance',
      bookPath: '/book-ambulance',
      color: 'bg-red-50',
      buttonText: 'Book Now'
    },
    {
      id: 2,
      title: 'Patient Transport',
      description: 'Non-emergency medical transportation for scheduled hospital visits or inter-facility transfers.',
      features: [
        'Scheduled Transport',
        'Wheelchair Access',
        'Comfortable Journey',
        'Medical Assistance'
      ],
      icon: <FaWheelchair className="w-12 h-12 text-blue-600" />,
      path: '/services/patient-transport',
      bookPath: '/book-transport',
      color: 'bg-blue-50',
      buttonText: 'Schedule Transport'
    },
    {
      id: 3,
      title: 'Hospital Network',
      description: 'Access our network of partner hospitals for immediate medical attention and specialized care.',
      features: [
        'Partner Hospitals',
        'Specialty Centers',
        'Quick Admission',
        'Medical Records'
      ],
      icon: <FaHospital className="w-12 h-12 text-green-600" />,
      path: '/hospitals',
      color: 'bg-green-50',
      buttonText: 'View Hospitals'
    },
    {
      id: 4,
      title: 'Medical Consultation',
      description: 'Connect with healthcare professionals for medical advice and consultation during transport.',
      features: [
        'Expert Doctors',
        'Video Consultation',
        'Medical History',
        'Prescription Support'
      ],
      icon: <FaUserMd className="w-12 h-12 text-purple-600" />,
      path: '/services/consultation',
      bookPath: '/book-consultation',
      color: 'bg-purple-50',
      buttonText: 'Book Consultation'
    },
    {
      id: 5,
      title: '24/7 Helpline',
      description: 'Round-the-clock emergency helpline for immediate assistance and guidance.',
      features: [
        'Emergency Support',
        'Medical Guidance',
        'Quick Response',
        'Multiple Languages'
      ],
      icon: <FaPhone className="w-12 h-12 text-yellow-600" />,
      path: '/helpdesk',
      color: 'bg-yellow-50',
      buttonText: 'Contact Helpdesk'
    },
    {
      id: 6,
      title: 'Blood Services',
      description: 'Emergency blood requirement support and donor network for critical situations.',
      features: [
        'Blood Bank Network',
        'Donor Connect',
        'Emergency Supply',
        'Blood Type Match'
      ],
      icon: <FaHeart className="w-12 h-12 text-pink-600" />,
      path: '/services/blood-services',
      bookPath: '/request-blood',
      color: 'bg-pink-50',
      buttonText: 'Request Blood'
    }
  ];

  const handleServiceClick = (path, bookPath) => {
    if (!user) {
      toast.info('Please login to access this service');
      navigate('/login', { state: { from: { pathname: bookPath || path } } });
      return;
    }
    navigate(path);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Emergency Medical Services
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Providing immediate medical assistance and transportation services to save lives.
          Our services are available 24/7 to ensure you get help when you need it most.
        </p>
      </div>

      {/* Services Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      >
        {services.map((service) => (
          <motion.div
            key={service.id}
            variants={itemVariants}
            className={`${service.color} rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300`}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center mb-6">
                {service.icon}
                <h3 className="text-2xl font-semibold ml-4 text-gray-900">
                  {service.title}
                </h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                {service.description}
              </p>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Features:</h4>
                <ul className="space-y-2">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <span className="w-2 h-2 bg-seva-red rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-auto space-y-3">
                <button
                  onClick={() => handleServiceClick(service.path)}
                  className="w-full bg-white text-gray-800 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Learn More
                </button>
                {service.bookPath && (
                  <button
                    onClick={() => handleServiceClick(service.bookPath)}
                    className="w-full bg-seva-red text-white px-4 py-2 rounded-lg hover:bg-seva-red/90 transition-colors"
                  >
                    {service.buttonText}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Services;
