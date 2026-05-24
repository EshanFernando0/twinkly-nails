import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase'; 

const AdminGallery = () => {
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Nail Art',
    imageUrl: '' 
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'gallery'), (snapshot) => {
      const imageList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      imageList.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setImages(imageList);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveWork = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) return alert("Please provide an image link!");
    
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'gallery'), {
        title: formData.title,
        category: formData.category,
        imageUrl: formData.imageUrl,
        createdAt: new Date()
      });
      
      setFormData({ title: '', category: 'Nail Art', imageUrl: '' });
      
    } catch (error) {
      console.error("Error saving artwork: ", error);
      alert("Failed to save: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (imageObj) => {
    if (window.confirm(`Are you sure you want to delete "${imageObj.title}"?`)) {
      try {
        await deleteDoc(doc(db, 'gallery', imageObj.id));
      } catch (error) {
        console.error("Error deleting: ", error);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto relative">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-2">Gallery Portfolio</h1>
        <p className="text-gray-500 text-base md:text-lg">Curate your premium portfolio using external image links (Pinterest, Imgur, etc).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        
        {/* Left Column: Upload Form (Stacks on top for mobile) */}
        <div className="lg:col-span-1 order-1 lg:order-none">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 lg:sticky lg:top-10">
            <h3 className="font-serif text-xl md:text-2xl font-bold text-gray-900 mb-6">Add New Work</h3>
            
            <form onSubmit={handleSaveWork} className="space-y-4 md:space-y-5">
              
              <div>
                <label className="block font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Image Link (URL)</label>
                <input 
                  type="url" 
                  name="imageUrl"
                  required
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full border border-brand-pink/50 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-burgundy transition-all bg-brand-pink/5"
                  placeholder="https://i.pinimg.com/..."
                />
                <p className="text-xs text-gray-400 mt-2 text-center">Paste direct image links here.</p>
              </div>

              <div>
                <label className="block font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Artwork Title</label>
                <input 
                  type="text" 
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-pink"
                  placeholder="e.g. Rose Gold Chrome"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-pink"
                >
                  <option value="Acrylics">Acrylics</option>
                  <option value="Gels">Gels</option>
                  <option value="Nail Art">Nail Art</option>
                </select>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-burgundy text-white py-3.5 md:py-4 rounded-full font-sans text-sm font-bold tracking-wider hover:opacity-90 hover:shadow-lg transition-all disabled:opacity-50 mt-2"
              >
                {isSubmitting ? 'Saving...' : 'Save to Portfolio'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Image Grid */}
        <div className="lg:col-span-2 order-2 lg:order-none">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 min-h-[400px] md:min-h-[500px]">
             <div className="flex justify-between items-center mb-6 md:mb-8">
               <h3 className="font-serif text-xl md:text-2xl font-bold text-gray-900">Recent Additions</h3>
               <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider">
                 {images.length} Items
               </span>
             </div>

             {images.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-48 md:h-64 text-gray-400">
                 <p className="font-sans text-sm md:text-base text-center px-4">Your gallery is empty. Add some Pinterest links!</p>
               </div>
             ) : (
               <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                 {images.map((img) => (
                   <div key={img.id} className="group relative rounded-2xl overflow-hidden aspect-square border border-gray-100 shadow-sm">
                     <img 
                       src={img.imageUrl} 
                       alt={img.title} 
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                       onError={(e) => {
                         e.target.src = "https://images.unsplash.com/photo-1519014816548-bf5fe059e98b?q=80&w=400";
                       }}
                     />
                     
                     {/* Hover Overlay */}
                     <div className="absolute inset-0 bg-gray-900/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 md:p-4">
                       <div className="flex justify-end">
                         <button 
                           onClick={() => handleDelete(img)}
                           className="bg-white/20 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                           title="Delete Image"
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                         </button>
                       </div>
                       <div>
                         <p className="text-white font-sans text-[10px] font-bold uppercase tracking-wider opacity-80">{img.category}</p>
                         <p className="text-white font-serif font-bold text-sm md:text-base truncate">{img.title}</p>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminGallery;