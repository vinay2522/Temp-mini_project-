import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Services from './components/Services';
import Hospitals from './components/Hospitals';
import Blog from './components/Blog';
import Gallery from './components/Gallery';
import Download from './components/Download';
import HelpDesk from './components/HelpDesk';
import LoadingSpinner from './components/LoadingSpinner';
import BookingForm from './components/BookingForm';
import DetailedBookingForm from './components/DetailedBookingForm';
import Sidebar from './components/Sidebar';
import WhatsAppButton from './components/WhatsAppButton';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import EmergencyAmbulance from './components/services/EmergencyAmbulance';
import BloodServices from './components/services/BloodServices';
import PatientTransport from './components/services/PatientTransport';
import MedicalConsultation from './components/services/MedicalConsultation';
import AmbulanceBooking from './components/bookings/AmbulanceBooking';
import TransportBooking from './components/bookings/TransportBooking';
import ConsultationBooking from './components/bookings/ConsultationBooking';
import BloodRequest from './components/bookings/BloodRequest';
import Bookings from './components/bookings/Bookings';
import BloodDonation from './components/services/BloodDonation';
import BlogPost from './components/BlogPost';

import './styles/global.css';
import 'leaflet/dist/leaflet.css';

const Login = React.lazy(() => import('./components/Login'));
const Register = React.lazy(() => import('./components/Register'));
const Profile = React.lazy(() => import('./components/Profile'));
const PrivateRoute = React.lazy(() => import('./components/PrivateRoute'));
const ForgotPassword = React.lazy(() => import('./components/ForgotPassword'));

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="min-h-screen">
            <Sidebar />
            <div className="transition-all duration-300 ml-64 md:ml-64">
              <Header />
              <main className="min-h-screen p-4">
                <Suspense fallback={<LoadingSpinner fullScreen />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/services/emergency-ambulance" element={<EmergencyAmbulance />} />
                    <Route path="/services/blood-services" element={<BloodServices />} />
                    <Route path="/services/patient-transport" element={<PatientTransport />} />
                    <Route path="/services/consultation" element={<MedicalConsultation />} />
                    <Route path="/hospitals" element={<Hospitals />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/download" element={<Download />} />
                    <Route path="/helpdesk" element={<HelpDesk />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/quick-book" element={<BookingForm />} />
                    <Route
                      path="/book-ambulance"
                      element={
                        <PrivateRoute>
                          <DetailedBookingForm />
                        </PrivateRoute>
                      }
                    />
                    {/* Service Routes */}
                    <Route path="/emergency-ambulance" element={<EmergencyAmbulance />} />
                    <Route path="/blood-services" element={<BloodServices />} />
                    <Route path="/patient-transport" element={<PatientTransport />} />
                    <Route path="/medical-consultation" element={<MedicalConsultation />} />

                    {/* Booking Routes */}
                    <Route path="/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} />
                    <Route path="/book-ambulance" element={<PrivateRoute><AmbulanceBooking /></PrivateRoute>} />
                    <Route path="/book-transport" element={<PrivateRoute><TransportBooking /></PrivateRoute>} />
                    <Route path="/book-consultation" element={<PrivateRoute><ConsultationBooking /></PrivateRoute>} />
                    <Route path="/blood-request" element={<PrivateRoute><BloodRequest /></PrivateRoute>} />

                    {/* Blood Service Routes */}
                    <Route path="/blood-services/donate" element={<PrivateRoute><BloodDonation /></PrivateRoute>} />

                    {/* Protected Routes */}
                    <Route
                      path="/profile"
                      element={
                        <PrivateRoute>
                          <Profile />
                        </PrivateRoute>
                      }
                    />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
            <WhatsAppButton phoneNumber="+919632598430" />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
