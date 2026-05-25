import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase'; 
import { whatsappNumber } from '../config/contact';

// Gorgeous premium fallbacks guaranteed to work
const premiumFallbackImages = [
  "https://images.pexels.com/photos/3997389/pexels-photo-3997389.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/8814313/pexels-photo-8814313.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/704813/pexels-photo-704813.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/939836/pexels-photo-939836.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1033104/pexels-photo-1033104.jpeg?auto=compress&cs=tinysrgb&w=800"
];

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- WHATSAPP CONFIGURATION ---
  useEffect(() => {
    // Only fetch services where status is true (Active)
    const q = query(collection(db, 'services'), where("status", "==", true));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activeServices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // UPDATED: Sort services by price in DESCENDING order (Highest to Lowest)
      activeServices.sort((a, b) => Number(b.price) - Number(a.price));

      setServices(activeServices);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // NEW: WhatsApp Redirect Handler for Services
  const handleBookNow = (service) => {
    const message = `Hi Roshi! ✨ I'm looking at your website and I would love to book an appointment for a "${service.name}". Please let me know your availability!`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const categories = [...new Set(services.map(s => s.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-brand-pink/10 to-rose-50 py-10 md:py-20 px-4 md:px-10 relative z-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-brand-burgundy mb-8 md:mb-12 text-center">Our Services</h1>
        
        {loading ? (
          <div className="text-center text-brand-burgundy font-sans tracking-widest uppercase text-xs md:text-sm animate-pulse">
            Loading your sanctuary menu...
          </div>
        ) : services.length === 0 ? (
          <div className="text-center text-brand-burgundy">No active services available right now.</div>
        ) : (
          categories.map((category) => (
            <div key={category} className="mb-12 md:mb-16">
              <div className="mb-6 md:mb-8 inline-flex flex-col gap-2">
                <h2 className={`font-serif text-2xl md:text-3xl font-bold inline-block pb-2 md:pb-4 border-b ${category === 'Nail Art' ? 'text-rose-900 border-rose-300/70' : 'text-brand-burgundy border-brand-pink/30'}`}>
                  {category}
                </h2>
                {category === 'Nail Art' && (
                  <p className="inline-flex items-center self-start bg-rose-100 text-rose-900 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest border border-rose-200/80">
                    Signature nail designs
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
                {services.filter(s => s.category === category).map((s, index) => {
                  
                  const displayImage = s.imageUrl || premiumFallbackImages[index % premiumFallbackImages.length];
                  const isNailArt = s.category === 'Nail Art';
                  const cardClassName = isNailArt
                    ? 'bg-gradient-to-b from-rose-50/90 to-white/90 backdrop-blur-md border border-rose-300/60 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group ring-1 ring-rose-200/50'
                    : 'bg-white/70 backdrop-blur-md border border-brand-pink/30 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group';

                  return (
                    <div key={s.id} className={cardClassName}>
                      
                      <div className="h-28 md:h-56 overflow-hidden relative">
                         <div className="absolute inset-0 bg-brand-burgundy/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                         <img 
                           src={displayImage} 
                           alt={s.name} 
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                         />
                         {isNailArt && (
                           <div className="absolute top-3 left-3 z-20 bg-white/90 text-brand-burgundy px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                             Nail Art
                           </div>
                         )}
                      </div>

                      <div className="p-3 md:p-8 flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="font-serif font-bold text-brand-burgundy text-sm md:text-xl leading-tight text-center md:text-left">{s.name}</h3>
                          
                          <div className="text-center md:text-left mt-2 md:mt-4">
                            <p className="font-sans text-brand-burgundy font-bold bg-brand-pink/20 inline-block px-2 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-sm tracking-wider">
                              Rs {Number(s.price).toLocaleString()}
                            </p>
                          </div>

                          {s.details && (
                            <p className={`mt-3 text-[11px] md:text-sm leading-relaxed text-center md:text-left line-clamp-3 ${isNailArt ? 'text-brand-burgundy/85 font-medium' : 'text-brand-burgundy/70'}`}>
                              {s.details}
                            </p>
                          )}
                        </div>
                        
                        {!isNailArt && (
                          <button 
                            onClick={() => handleBookNow(s)}
                            className="mt-3 md:mt-8 w-full border border-brand-burgundy text-brand-burgundy py-2 md:py-3 rounded-full text-[9px] md:text-xs font-bold uppercase tracking-widest hover:bg-brand-burgundy hover:text-white transition-colors duration-300"
                          >
                            Book Now
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Services;