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

      // Sort services by price in Ascending order (Lowest to Highest)
      activeServices.sort((a, b) => Number(a.price) - Number(b.price));

      setServices(activeServices);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // UPDATED: WhatsApp Redirect Handler with professional greeting
  const handleBookNow = (service) => {
    const message = `Hello Roshi! ✨ I'm interested in the ${service.name} service. Could you please provide me with more information about it?`;
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
              <h2 className="font-serif text-2xl md:text-3xl text-brand-burgundy font-bold mb-6 md:mb-8 border-b border-brand-pink/30 pb-2 md:pb-4 inline-block">
                {category}
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
                {services.filter(s => s.category === category).map((s, index) => {
                  
                  // Use the custom image from Admin if provided, otherwise fallback
                  const displayImage = s.imageUrl || premiumFallbackImages[index % premiumFallbackImages.length];

                  return (
                    <div key={s.id} className="bg-white/70 backdrop-blur-md border border-brand-pink/30 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                      
                      <div className="h-28 md:h-56 overflow-hidden relative">
                         <div className="absolute inset-0 bg-brand-burgundy/10 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
                         <img 
                           src={displayImage} 
                           alt={s.name} 
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                         />
                      </div>

                      <div className="p-3 md:p-8 flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="font-serif font-bold text-brand-burgundy text-sm md:text-xl leading-tight text-center md:text-left">{s.name}</h3>
                          
                          {/* Show additional details if added in the admin panel */}
                          {s.details && (
                            <p className="hidden md:block font-sans text-xs text-brand-burgundy/70 mt-2 line-clamp-2">
                              {s.details}
                            </p>
                          )}
                          
                          <div className="text-center md:text-left mt-2 md:mt-4">
                            <p className="font-sans text-brand-burgundy font-bold bg-brand-pink/20 inline-block px-2 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-sm tracking-wider">
                              Rs {Number(s.price).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        {/* UPDATED: Only show the Book Now button if the category is NOT 'Nail Art' */}
                        {s.category !== 'Nail Art' && (
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