import { Link } from 'react-router-dom';
import { whatsappNumber } from '../config/contact';

const Footer = () => {
  return (
    <footer className="bg-brand-burgundy text-white/80 py-16 px-6 md:px-10 border-t-4 border-brand-pink">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand Section */}
        <div className="md:col-span-1">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">Twinkly Nails</h2>
          <p className="font-sans text-sm text-white/60 mb-6">
            Your premium sanctuary for flawless nails and perfect moments.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-brand-pink mb-4">Explore</h3>
          <ul className="space-y-3 font-sans text-sm font-medium">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/services" className="hover:text-white transition-colors">Services</Link></li>
            <li><Link to="/promotions" className="hover:text-white transition-colors">Promotions</Link></li>
            <li><Link to="/gallery" className="hover:text-white transition-colors">Gallery</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Updated Contact Info (Landline Removed) */}
        <div>
          <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-brand-pink mb-4">Contact</h3>
          <ul className="space-y-3 font-sans text-sm">
            <li className="leading-relaxed">
              No 64, Elabodawatta,<br/>Hendala, Wattala
            </li>
            <li className="pt-2">
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2">
                <span className="text-brand-pink">WhatsApp:</span> +94 70 455 3916
              </a>
            </li>
          </ul>
        </div>

        {/* Updated Opening Hours */}
        <div>
          <h3 className="font-sans text-xs font-bold uppercase tracking-widest text-brand-pink mb-4">Hours</h3>
          <ul className="space-y-3 font-sans text-sm">
            <li>
              <span className="text-white block font-bold mb-0.5">Tuesday - Sunday</span>
              9:00 AM - 9:00 PM
            </li>
            <li className="pt-2">
              <span className="text-white block font-bold mb-0.5">Poya Day</span>
              9:00 AM - 6:00 PM
            </li>
            <li className="pt-2 text-brand-pink font-bold italic">
              Mondays: Closed
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/10 text-center flex flex-col md:flex-row justify-between items-center">
        <p className="font-sans text-xs text-white/50 mb-4 md:mb-0">
          &copy; {new Date().getFullYear()} Twinkly Nails by Roshi. All rights reserved.
        </p>
        
        {/* Minimal Social Links */}
        <div className="flex space-x-6 text-sm">
          <a href="https://www.instagram.com/twinkly_nails_by_roshi?igsh=aXR6ZGdyeHBmeTNq&utm_source=qr" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
          <a href="https://www.tiktok.com/@twinkly_nails_by_?_r=1&_t=ZS-96Y9xiTCbYK" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">TikTok</a>
          <a href="https://www.facebook.com/share/1BJTwKotR2/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;