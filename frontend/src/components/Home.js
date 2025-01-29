import React from 'react';
import { Link as ScrollLink, Element } from 'react-scroll';
import { FaAmbulance, FaUserMd, FaPhoneAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Section from './Section';
import ContactForm from './ContactForm';

const Home = () => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate('/quick-book');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero gradient-bg text-white p-4 sm:p-8 rounded-lg mb-8">
        <div className="container mx-auto">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 text-shadow">
            Your Emergency, Our Priority
          </h1>
          <p className="text-xl sm:text-2xl mb-4 pulse-animation">GIVE WAY TO AMBULANCE</p>
          <p className="mb-6 text-base sm:text-lg">
            24/7 emergency & medical transportation support. Ensuring professional medical care throughout the journey.
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleBookNow}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
            >
              Book Now
            </button>
          </div>
        </div>
      </section>

      {/* Book Now Section */}
      <section className="book-now-section bg-white p-4 sm:p-8 rounded-lg shadow-lg mb-8">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-4 md:mb-0">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-red-600">Emergency Services</h2>
            <p className="text-base sm:text-lg mb-4 text-gray-700">
              Need an ambulance urgently? We provide immediate assistance with our professional medical team.
            </p>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3">
                <FaAmbulance className="text-red-600 text-xl" />
                <span className="text-gray-700">24/7 Emergency Response</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaUserMd className="text-red-600 text-xl" />
                <span className="text-gray-700">Professional Medical Staff</span>
              </div>
              <div className="flex items-center space-x-3">
                <FaPhoneAlt className="text-red-600 text-xl" />
                <span className="text-gray-700">Quick Response Time</span>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 mt-4 md:mt-0 flex justify-center items-center">
            <div className="relative w-full max-w-2xl mx-auto h-[280px] md:h-[320px] lg:h-[380px] overflow-hidden rounded-lg shadow-xl">
              <img
                src="/images/ambulance.gif"
                alt="Emergency Ambulance Service"
                className="absolute inset-0 w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
                style={{ 
                  imageRendering: 'high-quality',
                  objectFit: 'cover',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <Element name="about">
        <Section id="about" title="About Us" className="mb-8 rounded-lg shadow-lg p-4 sm:p-8 bg-gray-50">
          <div className="container mx-auto">
            <p className="text-base sm:text-lg mb-6 text-gray-700 text-center max-w-3xl mx-auto">
              Welcome to <strong className="text-red-500">SevaDrive</strong>, your trusted partner in emergency medical services. 
              We are a dedicated team of healthcare professionals and drivers united by a mission to save lives and provide 
              compassionate care during medical emergencies.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {/* Mission Card */}
              <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-blue-500">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Our Mission</h3>
                <p className="text-gray-600">
                  To deliver prompt, professional, and compassionate ambulance services, ensuring every patient receives the care they deserve, 
                  every step of the way.
                </p>
              </div>

              {/* Services Card */}
              <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-green-500">
                <h3 className="text-xl font-bold mb-4 text-gray-800">What We Offer</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  <li>Basic Life Support (BLS) Ambulances</li>
                  <li>Advanced Cardiac Life Support (ACLS)</li>
                  <li>Neonatal & Pediatric Transfers</li>
                  <li>Pet Ambulance Services</li>
                  <li>Inter-city Medical Transport</li>
                </ul>
              </div>

              {/* Features Card */}
              <div className="bg-white p-6 rounded-lg shadow-md border-t-4 border-orange-500">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Why Choose Us?</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <FaAmbulance className="text-2xl text-red-600" />
                    <p className="text-gray-600">Modern, well-equipped ambulances</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaUserMd className="text-2xl text-red-600" />
                    <p className="text-gray-600">Expert medical professionals</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <FaPhoneAlt className="text-2xl text-red-600" />
                    <p className="text-gray-600">24/7 emergency response</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <div className="max-w-2xl mx-auto">
                <img
                  src="/images/ambulance.webp"
                  alt="Our Dedicated Ambulance Team"
                  className="w-full h-auto object-cover rounded-lg shadow-lg"
                />
              </div>
              <p className="text-lg font-medium mt-6 text-gray-800 max-w-2xl mx-auto">
                Join us in creating a safer, healthier tomorrow. Let SevaDrive be your trusted partner in times of need.
              </p>
            </div>
          </div>
        </Section>
      </Element>

      {/* Contact Section */}
      <Element name="contact">
        <Section id="contact" title="Connect With Us" className="mb-8">
          <ContactForm />
        </Section>
      </Element>
    </div>
  );
};

export default Home;