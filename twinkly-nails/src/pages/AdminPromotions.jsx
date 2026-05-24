import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase'; 

const AdminPromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    discount: '',
    expiryDate: '',
    status: true,
    imageUrl: '' 
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'promotions'), (snapshot) => {
      const promoList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPromotions(promoList);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = () => {
    setFormData({ title: '', code: '', discount: '', expiryDate: '', status: true, imageUrl: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEditPromo = (promo) => {
    setFormData({
      title: promo.title,
      code: promo.code,
      discount: promo.discount,
      expiryDate: promo.expiryDate || '',
      status: promo.status,
      imageUrl: promo.imageUrl || ''
    });
    setEditingId(promo.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSavePromo = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const promoDataToSave = {
        title: formData.title,
        code: formData.code.toUpperCase(), 
        discount: formData.discount,
        expiryDate: formData.expiryDate,
        status: formData.status,
        imageUrl: formData.imageUrl,
        updatedAt: new Date()
      };

      if (editingId) {
        await updateDoc(doc(db, 'promotions', editingId), promoDataToSave);
      } else {
        promoDataToSave.createdAt = new Date();
        await addDoc(collection(db, 'promotions'), promoDataToSave);
      }
      
      setIsModalOpen(false);
      setEditingId(null);
    } catch (error) {
      alert("Failed to save promotion: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePromo = async (id) => {
    if (window.confirm('Are you sure you want to delete this promotion?')) {
      await deleteDoc(doc(db, 'promotions', id));
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    await updateDoc(doc(db, 'promotions', id), { status: !currentStatus });
  };

  return (
    <div className="max-w-5xl mx-auto relative">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-2">Promotions</h1>
        <p className="text-gray-500 text-base md:text-lg">Manage your active offers, discount codes, and seasonal sales.</p>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden w-full">
        
        {/* Header - Stacks on mobile */}
        <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="font-serif text-xl md:text-2xl font-bold text-gray-900">Active Campaigns</h2>
          <button 
            onClick={handleOpenModal}
            className="w-full md:w-auto bg-brand-pink text-brand-burgundy px-6 py-3 md:py-2.5 rounded-full font-sans text-sm font-bold tracking-wider hover:bg-brand-burgundy hover:text-white transition-colors"
          >
            + Create Promotion
          </button>
        </div>
        
        {/* Table Wrapper for Horizontal Scroll */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 md:px-8 py-4 font-sans text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Campaign Title</th>
                <th className="px-6 md:px-8 py-4 font-sans text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Promo Code</th>
                <th className="px-6 md:px-8 py-4 font-sans text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Offer</th>
                <th className="px-6 md:px-8 py-4 font-sans text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Status</th>
                <th className="px-6 md:px-8 py-4 font-sans text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-10 text-center text-gray-400 font-sans">
                    No active promotions. Run a sale to attract more clients!
                  </td>
                </tr>
              ) : (
                promotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 md:px-8 py-5 font-sans font-bold text-gray-900 flex items-center whitespace-nowrap">
                      <div className="w-10 h-10 bg-brand-pink/30 text-brand-burgundy rounded-lg mr-4 flex items-center justify-center font-serif text-lg border border-brand-pink/50 overflow-hidden shrink-0">
                         {promo.imageUrl ? (
                           <img src={promo.imageUrl} alt="promo" className="w-full h-full object-cover" />
                         ) : (
                           promo.title.charAt(0).toUpperCase()
                         )}
                      </div>
                      {promo.title}
                    </td>
                    <td className="px-6 md:px-8 py-5">
                      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded border border-gray-200 font-mono text-[10px] md:text-sm tracking-widest whitespace-nowrap">{promo.code}</span>
                    </td>
                    <td className="px-6 md:px-8 py-5 font-sans text-brand-burgundy font-bold whitespace-nowrap">{promo.discount}</td>
                    <td className="px-6 md:px-8 py-5">
                       <div 
                         onClick={() => handleToggleStatus(promo.id, promo.status)}
                         className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${promo.status ? 'bg-brand-burgundy' : 'bg-gray-300'}`}
                       >
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${promo.status ? 'right-1' : 'left-1'}`}></div>
                       </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 text-right text-gray-400 whitespace-nowrap">
                      <button onClick={() => handleEditPromo(promo)} className="hover:text-brand-burgundy mx-2 transition-colors text-lg">✏️</button>
                      <button onClick={() => handleDeletePromo(promo.id)} className="hover:text-red-500 transition-colors text-lg ml-2">🗑️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm transition-all p-4">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-xl md:text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Promotion' : 'Create Promotion'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="space-y-4 md:space-y-5">
              <div>
                <label className="block font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Campaign Title</label>
                <input 
                  type="text" name="title" required value={formData.title} onChange={handleInputChange}
                  placeholder="e.g. Bridal Glow Package"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-pink"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Image Link (URL) - Optional</label>
                <input 
                  type="url" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-pink"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Promo Code</label>
                  <input 
                    type="text" name="code" required value={formData.code} onChange={handleInputChange}
                    placeholder="GLOWUP24"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-pink uppercase"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">The Offer</label>
                  <input 
                    type="text" name="discount" required value={formData.discount} onChange={handleInputChange}
                    placeholder="e.g. 15% OFF"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-pink"
                  />
                </div>
              </div>

              <div>
                <label className="block font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Expiry Date (Optional)</label>
                <input 
                  type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-pink"
                />
              </div>

              <div className="flex items-center mt-2">
                <input 
                  type="checkbox" name="status" id="status" checked={formData.status} onChange={handleInputChange}
                  className="w-4 h-4 text-brand-burgundy border-gray-300 rounded focus:ring-brand-burgundy"
                />
                <label htmlFor="status" className="ml-2 text-sm font-medium text-gray-700">Set as Active immediately</label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end sm:space-x-3 pt-4 border-t border-gray-100 gap-3 sm:gap-0 mt-2">
                <button type="button" onClick={handleCloseModal} className="w-full sm:w-auto px-6 py-2.5 rounded-full font-sans text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-brand-burgundy text-white px-6 py-2.5 rounded-full font-sans text-sm font-bold tracking-wider hover:opacity-90 hover:shadow-lg transition-all disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : (editingId ? 'Update Promo' : 'Save Promo')}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPromotions;