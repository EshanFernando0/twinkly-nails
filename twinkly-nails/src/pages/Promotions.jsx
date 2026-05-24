import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase'; 
import { whatsappNumber } from '../config/contact';

const promoFallbackImages = [
  "https://images.pexels.com/photos/3997378/pexels-photo-3997378.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/3373716/pexels-photo-3373716.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/3997389/pexels-photo-3997389.jpeg?auto=compress&cs=tinysrgb&w=800"
];

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- WHATSAPP CONFIGURATION ---
  // Replace this with Roshi's actual phone number (include country code, omit the '+' sign)
  // For Sri Lanka, it starts with 94 followed by the 9 digit number.
  useEffect(() => {
    const q = query(collection(db, 'promotions'), where("status", "==", true));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activePromos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPromotions(activePromos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // WhatsApp Redirect Handler
  const handleBookNow = (promo) => {
    // This creates the custom message
    const message = `Hi Roshi! ✨ I would like to book the "${promo.title}" special offer using the promo code: *${promo.code}*.`;
    
    // We encode it so spaces and symbols work perfectly in a web URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create the official WhatsApp redirect link
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab/app
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-brand-pink/10 to-rose-50 py-20 px-10 relative z-10">
      <div className="max-w-5xl mx-auto">
        
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-white/70 backdrop-blur-md border border-brand-pink text-brand-burgundy font-sans text-xs font-bold tracking-widest uppercase mb-4 shadow-sm">
            Special Offers
          </span>
          <h1 className="font-serif text-5xl md:text-6xl text-brand-burgundy font-bold mb-6 drop-shadow-sm">
            Current Promotions
          </h1>
          <p className="font-sans text-brand-burgundy/70 text-lg max-w-2xl mx-auto">
            Treat yourself to our exclusive seasonal packages and luxurious add-ons. Mention the promo code when booking!
          </p>
        </div>

        {loading ? (
          <div className="text-center text-brand-burgundy font-sans tracking-widest uppercase text-sm animate-pulse">
            Loading special offers...
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center bg-white/50 backdrop-blur-md border border-brand-pink/30 rounded-3xl p-10 max-w-2xl mx-auto">
            <p className="font-serif text-2xl text-brand-burgundy font-bold mb-2">No active promotions right now.</p>
            <p className="font-sans text-gray-500">Check back soon for upcoming holiday specials and new packages!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {promotions.map((promo, index) => {
              const displayImage = promo.imageUrl || promoFallbackImages[index % promoFallbackImages.length];

              return (
                <div key={promo.id} className="bg-white/70 backdrop-blur-md border border-brand-pink/30 rounded-[2rem] overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                  
                  <div className="h-64 overflow-hidden relative">
                    <div className="absolute inset-0 bg-brand-burgundy/20 group-hover:bg-brand-burgundy/10 transition-colors duration-500 z-10"></div>
                    <img 
                      src={displayImage} 
                      alt={promo.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    
                    <div className="absolute top-6 right-6 z-20 bg-brand-burgundy text-white px-4 py-2 rounded-full shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform">
                      <span className="font-sans font-bold tracking-wider">{promo.discount}</span>
                    </div>
                  </div>

                  <div className="p-8 flex-grow flex flex-col justify-between items-center text-center">
                    <div className="w-full">
                      <h3 className="font-serif font-bold text-brand-burgundy text-3xl leading-tight mb-6">{promo.title}</h3>
                      
                      <div className="bg-brand-pink/20 border border-brand-pink border-dashed rounded-xl p-4 mb-6">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Use Code</p>
                        <p className="font-mono text-2xl font-bold text-brand-burgundy tracking-widest">{promo.code}</p>
                      </div>

                      {promo.expiryDate && (
                        <p className="text-sm font-sans text-red-400 font-bold mb-4">
                          Expires: {new Date(promo.expiryDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* NEW: Wired up the WhatsApp onClick handler */}
                    <button 
                      onClick={() => handleBookNow(promo)}
                      className="w-full bg-brand-burgundy text-white py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-brand-pink hover:text-brand-burgundy hover:shadow-lg transition-all duration-300"
                    >
                      Book This Offer
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Promotions;