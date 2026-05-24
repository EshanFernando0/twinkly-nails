import { HashRouter as Router, Routes, Route } from 'react-router-dom';

// Public Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SakuraOverlay from './components/SakuraOverlay';
import Home from './pages/Home';
import Services from './pages/Services';
import Promotions from './pages/Promotions';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';

// Admin Components
import AdminLayout from './components/AdminLayout';
import AdminServices from './pages/AdminServices';
import Login from './pages/Login'; // The secure login page
import AdminGallery from './pages/AdminGallery';
import AdminPromotions from './pages/AdminPromotions';
import AdminAppointments from './pages/AdminAppointments';
import AdminOverview from './pages/AdminOverview'; 
import ProtectedRoute from './components/ProtectedRoute';

// 1. Wrapper just for the Public Site
const PublicSite = ({ children }) => (
  <div className="flex flex-col min-h-screen relative">
    <SakuraOverlay /> 
    <Navbar />
    <main className="flex-grow z-10 relative">
      {children}
    </main>
    <Footer />
  </div>
);

// 2. NEW: Wrapper just for the Secure Admin Site
const SecureAdmin = ({ children }) => (
  <ProtectedRoute>
    <AdminLayout>
      {children}
    </AdminLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES - These get the Navbar, Footer, and Sakura petals */}
        <Route path="/" element={<PublicSite><Home /></PublicSite>} />
        <Route path="/services" element={<PublicSite><Services /></PublicSite>} />
        <Route path="/promotions" element={<PublicSite><Promotions /></PublicSite>} />
        <Route path="/gallery" element={<PublicSite><Gallery /></PublicSite>} />
        <Route path="/contact" element={<PublicSite><Contact /></PublicSite>} />

        {/* ADMIN LOGIN - Completely blank background, no navbar or sidebar */}
        <Route path="/admin/login" element={<Login />} />

        {/* SECURE ADMIN DASHBOARD - These get the Sidebar Layout AND Security */}
        <Route path="/admin" element={<SecureAdmin><AdminOverview /></SecureAdmin>} />
        <Route path="/admin/services" element={<SecureAdmin><AdminServices /></SecureAdmin>} />
        <Route path="/admin/gallery" element={<SecureAdmin><AdminGallery /></SecureAdmin>} />
        <Route path="/admin/promotions" element={<SecureAdmin><AdminPromotions /></SecureAdmin>} />
        <Route path="/admin/appointments" element={<SecureAdmin><AdminAppointments /></SecureAdmin>} />
        <Route path="/login" element={<Login />} />
        
      </Routes>
    </Router>
  );
}

export default App;