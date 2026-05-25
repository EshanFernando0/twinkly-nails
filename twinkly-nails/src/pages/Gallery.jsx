import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const Gallery = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase for real-time images
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'gallery'), (snapshot) => {
      const imageList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort newest to oldest
      imageList.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setPortfolio(imageList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-brand-pink/20 to-rose-100 relative overflow-hidden py-20 px-6 md:px-10">
      
      {/* Glossy Background Blobs */}
      <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-brand-pink/60 rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-rose-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-60"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Area */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-white/70 backdrop-blur-md border border-white text-brand-burgundy font-sans text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
            Portfolio
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-brand-burgundy font-bold mb-6 drop-shadow-sm">
            Our Masterpieces
          </h1>
          <p className="font-sans text-brand-burgundy/70 text-base md:text-lg max-w-2xl mx-auto mb-10">
            Get inspired by our latest creations. From timeless elegance to avant-garde designs, find the perfect look for your next appointment.
          </p>
        </div>

        {/* 2-Column Grid for Mobile, 3-4 Columns for Desktop */}
        {loading ? (
           <div className="text-center text-brand-burgundy font-sans tracking-widest uppercase text-sm animate-pulse py-20">
             Loading our masterpieces...
           </div>
        ) : portfolio.length === 0 ? (
           <div className="text-center text-brand-burgundy/60 py-20 font-serif text-xl">
             We are currently updating our portfolio. Check back soon!
           </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8 mb-24 px-1 md:px-0">
            {portfolio.map((item) => (
              <div 
                key={item.id} 
                className="w-full relative group cursor-pointer"
              >
                <div className="bg-white/40 backdrop-blur-sm border md:border-2 border-white/60 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-brand-pink/40 transition-all duration-500 aspect-[4/5]">
                  <div className="relative w-full h-full overflow-hidden">
                    <div className="absolute inset-0 bg-brand-burgundy/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?q=80&w=400";
                      }}
                    />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 bg-gradient-to-t from-brand-burgundy/90 via-brand-burgundy/50 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-20 flex flex-col justify-end">
                      <p className="text-white/80 font-sans text-[9px] md:text-xs tracking-widest uppercase mb-1">{item.category}</p>
                      <h3 className="text-white font-serif text-sm md:text-xl font-bold leading-tight truncate">{item.title}</h3>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- SOCIAL MEDIA CALL TO ACTION --- */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 text-center max-w-4xl mx-auto shadow-2xl shadow-brand-pink/30 relative overflow-hidden">
          
          <div className="absolute top-10 left-10 w-4 h-4 bg-brand-pink rounded-full opacity-50 blur-[2px]"></div>
          <div className="absolute bottom-10 right-10 w-6 h-6 bg-rose-300 rounded-full opacity-50 blur-[2px]"></div>

          <h2 className="font-serif text-2xl md:text-4xl text-brand-burgundy font-bold mb-4">Want to see more of Twinkly's magic? ✨</h2>
          <p className="font-sans text-brand-burgundy/70 text-sm md:text-lg mb-8 md:mb-10 max-w-2xl mx-auto">
            Follow us on social media for daily nail inspiration, client transformations, and the latest trendy designs straight from the salon!
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            
            <a 
              href="https://www.instagram.com/twinkly_nails_by_roshi?igsh=aXR6ZGdyeHBmeTNq&utm_source=qr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-3.5 md:py-4 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white font-sans text-sm md:text-base font-bold tracking-widest uppercase hover:scale-105 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              Instagram
            </a>

            <a 
              href="https://www.tiktok.com/@twinkly_nails_by_?_r=1&_t=ZS-96Y9xiTCbYK" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-3.5 md:py-4 rounded-full bg-black text-white font-sans text-sm md:text-base font-bold tracking-widest uppercase hover:scale-105 hover:shadow-lg hover:shadow-black/30 transition-all duration-300 relative overflow-hidden group"
            >
              <svg className="w-5 h-5 z-10 relative group-hover:text-cyan-400 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.34 2.88 2.88 0 012.31-4.63 2.93 2.93 0 01.88.13V9a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/></svg>
              <span className="z-10 relative">TikTok</span>
            </a>

            <a 
              href="https://www.facebook.com/share/1BJTwKotR2/?mibextid=wwXIfr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-3.5 md:py-4 rounded-full bg-[#1877F2] text-white font-sans text-sm md:text-base font-bold tracking-widest uppercase hover:scale-105 hover:shadow-lg hover:shadow-[#1877F2]/30 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Gallery;