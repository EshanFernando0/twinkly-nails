import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase'; 
import { whatsappNumber } from '../config/contact';

// Import your new logo
import Logo from '../assets/Logo01.png'; 

const Home = () => {
  // --- HERO SLIDESHOW LOGIC ---
  const heroImages = [
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=2000&auto=format&fit=crop", 
    "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=2000&auto=format&fit=crop", 
  ];
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === heroImages.length - 1 ? 0 : prev + 1));
    }, 5000); 
    return () => clearInterval(timer);
  }, [heroImages.length]);


  // --- PROMOTIONS SLIDER LOGIC ---
  const [promotions, setPromotions] = useState([]);
  const [currentPromoSlide, setCurrentPromoSlide] = useState(0);
  const [loadingPromos, setLoadingPromos] = useState(true);
  useEffect(() => {
    const q = query(collection(db, 'promotions'), where("status", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activePromos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPromotions(activePromos);
      setLoadingPromos(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (promotions.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentPromoSlide((prev) => (prev + 1) % promotions.length);
    }, 4000); 
    return () => clearInterval(timer);
  }, [promotions.length]);

  const handleClaimOffer = (promo) => {
    const message = `Hi Roshi! ✨ I saw the "${promo.title}" offer on your website and would love to claim it using the code: *${promo.code}*.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  // --- INSPIRATION (LIVE GALLERY) LOGIC ---
  const [galleryImages, setGalleryImages] = useState([]);
  
  const fallbackImages = [
    "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=800&auto=format&fit=crop"
  ];

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'gallery'), (snapshot) => {
      const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort to get the newest uploads first
      images.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      // Grab only the top 3 images for the home page
      setGalleryImages(images.slice(0, 3));
    });
    return () => unsubscribe();
  }, []);

  // Use live images if available, otherwise use fallbacks
  const displayImages = [
    galleryImages[0]?.imageUrl || fallbackImages[0],
    galleryImages[1]?.imageUrl || fallbackImages[1],
    galleryImages[2]?.imageUrl || fallbackImages[2],
  ];

  return (
    <div className="flex flex-col w-full">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[80vh] w-full flex items-center bg-brand-pink transition-all duration-1000 ease-in-out">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 opacity-60"
          style={{ backgroundImage: `url(${heroImages[currentSlide]})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 to-transparent"></div>
        
        <div className="relative z-20 max-w-6xl mx-auto px-10 w-full">
          
          {/* ROUNDED LOGO AREA */}
          <div className="w-40 h-40 md:w-48 md:h-48 mb-6 rounded-full overflow-hidden shadow-2xl border-4 border-white bg-white">
            <img 
              src={Logo} 
              alt="Twinkly Nails by Roshi Logo" 
              className="w-full h-full object-cover scale-[1.05]" 
            />
          </div>
          
          <h1 className="font-serif text-5xl md:text-6xl text-brand-burgundy font-bold mb-4 drop-shadow-sm leading-tight">
            Twinkly Nails <br/>by Roshi
          </h1>
          <p className="font-sans text-brand-burgundy opacity-80 text-lg mb-8 max-w-md font-medium">
            Experience the pinnacle of nail artistry in an oasis of serenity.
          </p>
          <Link to="/services">
            <button className="bg-brand-pink text-brand-burgundy border-2 border-brand-burgundy/20 px-8 py-3 rounded-full font-sans text-sm font-bold uppercase tracking-widest hover:bg-brand-burgundy hover:text-brand-pink transition-colors shadow-sm">
              Explore Services
            </button>
          </Link>
        </div>
      </section>

      {/* 2. THE BENEFITS OF NAIL CARE SECTION (NEW) */}
      <section className="py-24 bg-gradient-to-b from-white to-brand-pink/10 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 md:px-10 relative z-10">
          
          <div className="text-center mb-20">
            <p className="font-sans text-xs tracking-widest text-brand-burgundy uppercase mb-4">Wellness & Beauty</p>
            <h2 className="font-serif text-4xl md:text-5xl text-brand-burgundy font-bold mb-6">More Than Just Polish</h2>
            <p className="font-sans text-brand-burgundy/70 text-lg max-w-2xl mx-auto">
              Professional nail care is an essential part of your wellness routine. Discover why regular manicures and pedicures are the ultimate act of self-care.
            </p>
          </div>

          {/* Manicure Block (Text Left, Image Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
            <div className="order-2 lg:order-1 space-y-6">
              <h3 className="font-serif text-3xl font-bold text-brand-burgundy">Revitalizing Manicures</h3>
              <p className="font-sans text-gray-600 leading-relaxed text-lg">
                Our hands are constantly exposed to the elements and daily wear. A professional manicure goes beyond a beautiful coat of paint—it deeply exfoliates, moisturizes, and treats your cuticles. 
              </p>
              <p className="font-sans text-gray-600 leading-relaxed text-lg">
                Regular care prevents hangnails, promotes healthy nail growth, and provides a deeply relaxing massage that relieves tension in your hands and wrists.
              </p>
              <ul className="space-y-4 font-sans text-brand-burgundy/90 font-medium mt-6">
                <li className="flex items-center gap-4 bg-white/60 p-3 rounded-xl border border-white">
                  <span className="text-2xl"></span> Promotes healthy blood circulation
                </li>
                <li className="flex items-center gap-4 bg-white/60 p-3 rounded-xl border border-white">
                  <span className="text-2xl"></span> Prevents fungal infections and nail damage
                </li>
                <li className="flex items-center gap-4 bg-white/60 p-3 rounded-xl border border-white">
                  <span className="text-2xl"></span> Leaves skin incredibly soft and youthful
                </li>
              </ul>
            </div>
            <div className="order-1 lg:order-2 relative group">
              <div className="absolute inset-0 bg-brand-pink/40 rounded-[3rem] transform translate-x-4 translate-y-4 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-500"></div>
              <img src="https://smartbeauty.co.nz/wp-content/uploads/2019/05/1_1.jpg" alt="Revitalizing Manicure" className="relative rounded-[3rem] shadow-xl object-cover h-[450px] w-full z-10" />
            </div>
          </div>

          {/* Pedicure Block (Image Left, Text Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative group">
               <div className="absolute inset-0 bg-rose-200/60 rounded-[3rem] transform -translate-x-4 translate-y-4 group-hover:-translate-x-6 group-hover:translate-y-6 transition-transform duration-500"></div>
               <img src="https://s3.amazonaws.com/salonclouds-uploads/blog/blog_17574138471186515713.png" alt="Restorative Pedicure Spa" className="relative rounded-[3rem] shadow-xl object-cover h-[450px] w-full z-10" />
            </div>
            <div className="space-y-6">
              <h3 className="font-serif text-3xl font-bold text-brand-burgundy">Restorative Pedicures</h3>
              <p className="font-sans text-gray-600 leading-relaxed text-lg">
                Your feet carry you through life, yet they are often the most neglected. A premium pedicure is a restorative treatment that removes dead skin, prevents painful calluses, and deeply hydrates. 
              </p>
              <p className="font-sans text-gray-600 leading-relaxed text-lg">
                The accompanying massage soothes aching joints, reduces stress, and leaves you feeling entirely rejuvenated from the ground up.
              </p>
              <ul className="space-y-4 font-sans text-brand-burgundy/90 font-medium mt-6">
                <li className="flex items-center gap-4 bg-white/60 p-3 rounded-xl border border-white">
                  <span className="text-2xl"></span> Eliminates calluses and rough patches
                </li>
                <li className="flex items-center gap-4 bg-white/60 p-3 rounded-xl border border-white">
                  <span className="text-2xl"></span> Improves joint mobility and foot health
                </li>
                <li className="flex items-center gap-4 bg-white/60 p-3 rounded-xl border border-white">
                  <span className="text-2xl"></span> Ultimate stress relief and relaxation
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* 3. EXCLUSIVE OFFERS */}
      <section className="bg-gradient-to-r from-brand-pink/80 to-rose-200 py-20 flex justify-center px-10 relative overflow-hidden">
        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2rem] p-10 max-w-2xl w-full text-center shadow-xl relative z-10 group min-h-[350px] flex flex-col justify-center">
          
          <p className="font-sans text-xs tracking-widest text-brand-burgundy uppercase mb-6">Exclusive Offers</p>
          <div className="flex justify-center mb-4 text-brand-burgundy">
             <svg className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </div>

          {loadingPromos ? (
             <p className="font-serif text-2xl text-brand-burgundy animate-pulse">Checking for special offers...</p>
          ) : promotions.length === 0 ? (
            <div className="animate-fade-in">
              <h3 className="font-serif text-3xl font-bold text-brand-burgundy mb-2">First-time client: 15% off</h3>
              <p className="text-brand-burgundy/70 text-sm mb-8">Welcome to your new sanctuary.</p>
              <Link to="/promotions">
                <button className="bg-gradient-to-r from-brand-burgundy to-rose-900 text-white px-10 py-4 rounded-full font-sans text-sm font-bold tracking-widest uppercase hover:opacity-90 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  View Promotions
                </button>
              </Link>
            </div>
          ) : (
            <div className="relative w-full overflow-hidden">
              <div 
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentPromoSlide * 100}%)` }}
              >
                {promotions.map((promo) => (
                  <div key={promo.id} className="w-full flex-shrink-0 px-4">
                    <h3 className="font-serif text-3xl font-bold text-brand-burgundy mb-2">
                      {promo.title}
                    </h3>
                    <p className="text-brand-burgundy/90 font-bold mb-2">
                      {promo.discount}
                    </p>
                    <p className="font-mono text-sm bg-white/50 text-brand-burgundy inline-block px-3 py-1 rounded-md mb-6 border border-brand-pink">
                      Code: {promo.code}
                    </p>
                    <br/>
                    <button 
                      onClick={() => handleClaimOffer(promo)}
                      className="bg-gradient-to-r from-brand-burgundy to-rose-900 text-white px-10 py-4 rounded-full font-sans text-sm font-bold tracking-widest uppercase hover:opacity-90 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 inline-block cursor-pointer"
                    >
                      Claim Offer
                    </button>
                  </div>
                ))}
              </div>

              {promotions.length > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                  {promotions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPromoSlide(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        currentPromoSlide === idx ? 'bg-brand-burgundy w-6' : 'bg-brand-pink/80'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 4. INSPIRATION (NOW WIRED TO LIVE FIREBASE GALLERY) */}
      <section className="py-24 bg-white text-center">
        <p className="font-sans text-xs tracking-widest text-brand-burgundy uppercase mb-10 border-b border-brand-burgundy inline-block pb-1">Inspiration</p>
        
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 px-10">
          
          {/* Map through the 3 display images (live or fallback) */}
          {displayImages.map((imgSrc, index) => (
            <div key={index} className="overflow-hidden rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-300 group">
              <img 
                src={imgSrc} 
                alt={`Nail Art Inspiration ${index + 1}`} 
                className="object-cover h-72 w-full group-hover:scale-110 transition-transform duration-700" 
                onError={(e) => {
                  e.target.src = fallbackImages[index]; 
                }}
              />
            </div>
          ))}
          
          {/* View Full Gallery Link Box */}
          <Link to="/gallery" className="bg-gradient-to-br from-brand-pink/50 to-rose-100 rounded-3xl flex flex-col items-center justify-center h-72 text-brand-burgundy hover:shadow-xl transition-all duration-300 cursor-pointer border border-white group relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 group-hover:bg-transparent transition-colors duration-500"></div>
            
            <svg className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform duration-300 z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="font-serif italic text-2xl font-bold z-10 group-hover:-translate-y-1 transition-transform duration-300">
              See More <br/>in Gallery ➔
            </p>
          </Link>

        </div>
      </section>

    </div>
  );
};

export default Home;