import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase'; 

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  
  // UPDATED: Added details and imageUrl to initial state. Changed default category to 'Services'.
  const [formData, setFormData] = useState({
    name: '',
    category: 'Services',
    price: '',
    details: '',
    imageUrl: '',
    status: true
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'services'), (snapshot) => {
      const servicesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(servicesList);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = () => {
    // UPDATED: Reset includes new fields
    setFormData({ name: '', category: 'Services', price: '', details: '', imageUrl: '', status: true });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEditService = (service) => {
    // UPDATED: Load existing fields when editing
    setFormData({
      name: service.name || '',
      category: service.category || 'Services',
      price: service.price || '',
      details: service.details || '',
      imageUrl: service.imageUrl || '',
      status: service.status ?? true
    });
    setEditingId(service.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // UPDATED: Save details and imageUrl to Firebase
      const serviceDataToSave = {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        details: formData.details,
        imageUrl: formData.imageUrl,
        status: formData.status,
        updatedAt: new Date()
      };

      if (editingId) {
        await updateDoc(doc(db, 'services', editingId), serviceDataToSave);
      } else {
        serviceDataToSave.createdAt = new Date();
        await addDoc(collection(db, 'services'), serviceDataToSave);
      }
      
      setIsModalOpen(false);
      setEditingId(null);
    } catch (error) {
      console.error("Error saving service: ", error);
      alert("Failed to save service: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this service?')) {
      try {
        await deleteDoc(doc(db, 'services', id));
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, 'services', id), {
        status: !currentStatus
      });
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto relative">
      
      {/* Header - Mobile Adjusted */}
      <div className="mb-8">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-2">Service Management</h1>
        <p className="text-gray-500 text-base md:text-lg">Manage your salon's offerings, pricing, and availability.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 md:mb-12">
        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-gray-50 p-4 rounded-full mr-4 md:mr-6 text-gray-500 shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /></svg>
          </div>
          <div>
            <p className="text-3xl font-serif font-bold text-gray-900">{services.length}</p>
            <p className="text-[10px] md:text-xs font-bold text-gray-400 tracking-widest uppercase">Active Services</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden w-full">
        
        {/* Directory Header - Stacks on mobile */}
        <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="font-serif text-xl md:text-2xl font-bold text-gray-900">Service Directory</h2>
          <button 
            onClick={handleOpenModal}
            className="w-full md:w-auto bg-brand-pink text-brand-burgundy px-6 py-3 md:py-2.5 rounded-full font-sans text-sm font-bold tracking-wider hover:bg-brand-burgundy hover:text-white transition-colors"
          >
            + Add New Service
          </button>
        </div>
        
        {/* Table Wrapper for Horizontal Scroll */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 md:px-8 py-4 font-sans text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Service Name</th>
                <th className="px-6 md:px-8 py-4 font-sans text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Category</th>
                <th className="px-6 md:px-8 py-4 font-sans text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Price</th>
                <th className="px-6 md:px-8 py-4 font-sans text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Status</th>
                <th className="px-6 md:px-8 py-4 font-sans text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-10 text-center text-gray-400 font-sans">
                    No services found. Click "+ Add New Service" to get started!
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 md:px-8 py-5 font-sans font-bold text-gray-900 flex items-center whitespace-nowrap">
                      <div className="w-10 h-10 bg-brand-pink/30 text-brand-burgundy rounded-lg mr-4 flex items-center justify-center font-serif text-lg border border-brand-pink/50 shrink-0 overflow-hidden">
                        {/* Show image thumbnail if URL exists, otherwise show letter */}
                        {service.imageUrl ? (
                          <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                        ) : (
                          service.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      {service.name}
                    </td>
                    <td className="px-6 md:px-8 py-5">
                      <span className="bg-brand-pink/20 text-brand-burgundy px-3 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap">{service.category}</span>
                    </td>
                    <td className="px-6 md:px-8 py-5 font-sans font-bold text-gray-600 whitespace-nowrap">Rs {Number(service.price).toLocaleString()}</td>
                    <td className="px-6 md:px-8 py-5">
                       <div 
                         onClick={() => handleToggleStatus(service.id, service.status)}
                         className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${service.status ? 'bg-brand-burgundy' : 'bg-gray-300'}`}
                       >
                         <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${service.status ? 'right-1' : 'left-1'}`}></div>
                       </div>
                    </td>
                    <td className="px-6 md:px-8 py-5 text-right text-gray-400 whitespace-nowrap">
                      <button onClick={() => handleEditService(service)} className="hover:text-brand-burgundy mx-2 transition-colors text-lg" title="Edit Service">✏️</button>
                      <button onClick={() => handleDeleteService(service.id)} className="hover:text-red-500 transition-colors text-lg ml-2" title="Delete Service">🗑️</button>
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
                {editingId ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 md:space-y-5">
              <div>
                <label className="block font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Service Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-all"
                  >
                    {/* UPDATED: Cleaned up categories */}
                    <option value="Services">Services</option>
                    <option value="Nail Art">Nail Art</option>
                  </select>
                </div>
                <div>
                  <label className="block font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Price (Rs)</label>
                  <input 
                    type="number" 
                    name="price"
                    required
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* NEW: Image URL Input */}
              <div>
                <label className="block font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Image URL (Optional)</label>
                <input 
                  type="url" 
                  name="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-all"
                />
              </div>

              {/* NEW: Additional Details Textarea */}
              <div>
                <label className="block font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Additional Details</label>
                <textarea 
                  name="details"
                  rows="3"
                  placeholder="Service description, benefits, or time required..."
                  value={formData.details}
                  onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-pink focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>

              <div className="flex items-center mt-2">
                <input 
                  type="checkbox" 
                  name="status"
                  id="status"
                  checked={formData.status}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-brand-burgundy border-gray-300 rounded focus:ring-brand-burgundy"
                />
                <label htmlFor="status" className="ml-2 text-sm font-medium text-gray-700">Set as Active immediately</label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end sm:space-x-3 pt-4 border-t border-gray-100 gap-3 sm:gap-0 mt-2">
                <button type="button" onClick={handleCloseModal} className="w-full sm:w-auto px-6 py-2.5 rounded-full font-sans text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-brand-burgundy text-white px-6 py-2.5 rounded-full font-sans text-sm font-bold tracking-wider hover:opacity-90 hover:shadow-lg transition-all disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : (editingId ? 'Update Service' : 'Save Service')}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminServices;