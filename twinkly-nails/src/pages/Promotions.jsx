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

  // UPDATED: Professional WhatsApp Redirect Handler (No Promo Codes)
  const handleBookNow = (promo) => {
    const message = `Hello Roshi! ✨ I am interested in booking the "${promo.title}" special offer. Could you please provide me with more information and let me know your availability?`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
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
            Treat yourself to our exclusive seasonal packages and luxurious add-ons. Book your spot today!
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
                    
                    {/* UPDATED: Floating Badge now shows Offer Price instead of Discount Percentage */}
                    <div className="absolute top-6 right-6 z-20 bg-brand-burgundy text-white px-4 py-2 rounded-full shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform">
                      <span className="font-sans font-bold tracking-wider">
                        Rs {Number(promo.offerPrice).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-8 flex-grow flex flex-col justify-between items-center text-center">
                    <div className="w-full">
                      <h3 className="font-serif font-bold text-brand-burgundy text-3xl leading-tight mb-4">
                        {promo.title}
                      </h3>
                      
                      {/* NEW: Displays additional details instead of the promo code box */}
                      {promo.details && (
                        <p className="font-sans text-brand-burgundy/70 text-sm mb-6 leading-relaxed">
                          {promo.details}
                        </p>
                      )}

                      {promo.expiryDate && (
                        <p className="text-sm font-sans text-red-400 font-bold mb-4 bg-red-50 inline-block px-4 py-1.5 rounded-full">
                          Expires: {new Date(promo.expiryDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <button 
                      onClick={() => handleBookNow(promo)}
                      className="w-full mt-4 bg-brand-burgundy text-white py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-brand-pink hover:text-brand-burgundy hover:shadow-lg transition-all duration-300"
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