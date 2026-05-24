import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../assets/Logo01.png'; 

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Helper to close the menu when a link is clicked
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="bg-brand-pink text-brand-burgundy py-4 px-6 md:px-10 shadow-sm relative z-50">
      
      <div className="flex justify-between items-center">
        {/* Logo & Brand Area */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-3 group z-50">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-full p-[2px] md:p-[3px] bg-gradient-to-tr from-pink-500 via-rose-300 to-yellow-400 shadow-sm group-hover:shadow-md transition-all duration-300 shrink-0">
            <img 
              src={Logo} 
              alt="Twinkly Nails Logo" 
              className="w-full h-full object-cover rounded-full bg-white"
            />
          </div>

          <div className="font-serif text-xl md:text-3xl font-bold tracking-wide flex flex-col md:flex-row md:items-baseline md:gap-2">
            <span>Twinkly Nails</span>
            <span className="text-xs md:text-xl font-medium italic opacity-80 font-sans tracking-normal hidden sm:inline-block">
              by Roshi
            </span>
          </div>
        </Link>

        {/* DESKTOP Navigation Links */}
        <div className="hidden lg:flex space-x-10 font-sans text-sm font-medium uppercase tracking-widest">
          <Link to="/services" className={`hover:opacity-70 transition-opacity ${location.pathname === '/services' ? 'border-b-2 border-brand-burgundy pb-1' : ''}`}>Services</Link>
          <Link to="/promotions" className={`hover:opacity-70 transition-opacity ${location.pathname === '/promotions' ? 'border-b-2 border-brand-burgundy pb-1' : ''}`}>Promotions</Link>
          <Link to="/gallery" className={`hover:opacity-70 transition-opacity ${location.pathname === '/gallery' ? 'border-b-2 border-brand-burgundy pb-1' : ''}`}>Gallery</Link>
          <Link to="/contact" className={`hover:opacity-70 transition-opacity ${location.pathname === '/contact' ? 'border-b-2 border-brand-burgundy pb-1' : ''}`}>Contact</Link>
        </div>

        {/* DESKTOP Book Now Button */}
        <div className="hidden lg:block">
          <Link to="/services">
            <button className="bg-brand-burgundy text-brand-pink px-8 py-3 rounded-full font-sans text-sm font-medium uppercase tracking-widest hover:opacity-90 hover:shadow-lg transition-all hover:-translate-y-0.5">
              Book Now
            </button>
          </Link>
        </div>

        {/* MOBILE Menu Toggle Button (Hamburger) */}
        <button 
          className="lg:hidden p-2 text-brand-burgundy z-50 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            // Close (X) Icon
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            // Hamburger Icon
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {/* MOBILE Navigation Menu Dropdown */}
      <div 
        className={`lg:hidden absolute top-full left-0 w-full bg-brand-pink/95 backdrop-blur-md shadow-xl transition-all duration-300 ease-in-out origin-top ${
          isMobileMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center py-8 space-y-6 font-sans text-sm font-bold uppercase tracking-widest border-t border-brand-burgundy/10">
          <Link to="/services" onClick={closeMenu} className="text-brand-burgundy hover:text-white transition-colors w-full text-center py-2">Services</Link>
          <Link to="/promotions" onClick={closeMenu} className="text-brand-burgundy hover:text-white transition-colors w-full text-center py-2">Promotions</Link>
          <Link to="/gallery" onClick={closeMenu} className="text-brand-burgundy hover:text-white transition-colors w-full text-center py-2">Gallery</Link>
          <Link to="/contact" onClick={closeMenu} className="text-brand-burgundy hover:text-white transition-colors w-full text-center py-2">Contact</Link>
          
          <div className="pt-6 w-full px-10">
            <Link to="/services" onClick={closeMenu}>
              <button className="w-full bg-brand-burgundy text-brand-pink px-8 py-4 rounded-full font-sans text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-md">
                Book Now
              </button>
            </Link>
          </div>
        </div>
      </div>

    </nav>
  );
};

export default Navbar;