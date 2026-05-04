import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './lib/AuthContext';
import { CompareProvider } from './context/CompareContext';
import Home from './pages/Home';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Compare from './pages/Compare';
import About from './pages/About';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import WhatsAppButton from './components/WhatsAppButton';

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <CompareProvider>
          <BrowserRouter>
          <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50">
            <Header />
              <div className="flex-grow pt-20"> {/* PT-20 to account for fixed header */}
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/properties" element={<Properties />} />
                  <Route path="/property/:id" element={<PropertyDetail />} />
                  <Route path="/compare" element={<Compare />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
              </div>
            <Footer />
            <CookieBanner />
            <WhatsAppButton />
          </div>
        </BrowserRouter>
        </CompareProvider>
    </LanguageProvider>
  </AuthProvider>
  );
}
