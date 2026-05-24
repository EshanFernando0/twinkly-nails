import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase'; 

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    service: 'Classic Acrylics', // Default fallback
    date: '',
    time: '',
    status: 'Confirmed' // Phone/Walk-in bookings are usually confirmed instantly
  });

  // Listen to the 'appointments' collection
  useEffect(() => {
    // Sort by date so upcoming appointments show first
    const q = query(collection(db, 'appointments'), orderBy('date', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apptList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(apptList);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenModal = () => {
    setFormData({ clientName: '', phone: '', service: 'Classic Acrylics', date: '', time: '', status: 'Confirmed' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Add a new manual appointment (Walk-in or Phone Call)
  const handleSaveAppointment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'appointments'), {
        ...formData,
        source: 'Manual', // To track that Roshi added this herself
        createdAt: new Date()
      });
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to save appointment: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Change Status (Pending -> Confirmed -> Completed)
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status: newStatus });
    } catch (error) {
      console.error("Error updating status: ", error);
    }
  };

  // Cancel/Delete Appointment
  const handleDeleteAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel and remove this appointment?')) {
      await deleteDoc(doc(db, 'appointments', id));
    }
  };

  // Filter Logic
  const filteredAppointments = activeFilter === 'All' 
    ? appointments 
    : appointments.filter(appt => appt.status === activeFilter);

  // Status Badge Styling Helper
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Confirmed': return 'bg-brand-pink/30 text-brand-burgundy border-brand-pink/50';
      case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto relative">
      
      {/* Header - Mobile Adjusted */}
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900 mb-2">Schedule</h1>
          <p className="text-gray-500 text-base md:text-lg">Manage your bookings, walk-ins, and client agenda.</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="bg-brand-burgundy text-white px-6 py-3 rounded-full font-sans text-sm font-bold tracking-wider hover:opacity-90 transition-opacity shadow-md w-full md:w-auto"
        >
          + Add Booking
        </button>
      </div>

      {/* Filter Tabs - Scrollable on mobile */}
      <div className="flex space-x-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {['All', 'Pending', 'Confirmed', 'Completed'].map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
              activeFilter === filter 
              ? 'bg-gray-900 text-white shadow-md' 
              : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Appointments Table - Mobile Scroll Wrapper Applied */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 md:px-8 py-5 font-sans text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Client & Contact</th>
                <th className="px-6 md:px-8 py-5 font-sans text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Service Needed</th>
                <th className="px-6 md:px-8 py-5 font-sans text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Date & Time</th>
                <th className="px-6 md:px-8 py-5 font-sans text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">Status</th>
                <th className="px-6 md:px-8 py-5 font-sans text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-16 text-center text-gray-400 font-sans">
                    <p className="text-lg font-bold text-gray-500 mb-1">No appointments found.</p>
                    <p>Your schedule is clear. Time for a coffee break!</p>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-gray-50/50 transition-colors group">
                    
                    {/* Client Info */}
                    <td className="px-6 md:px-8 py-5">
                      <p className="font-serif font-bold text-lg text-gray-900">{appt.clientName}</p>
                      <p className="font-sans text-sm text-gray-500 flex items-center mt-1">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        {appt.phone}
                      </p>
                    </td>

                    {/* Service Info */}
                    <td className="px-6 md:px-8 py-5 font-sans font-bold text-gray-700">
                      {appt.service}
                    </td>

                    {/* Date & Time */}
                    <td className="px-6 md:px-8 py-5">
                      <p className="font-sans font-bold text-gray-900">{new Date(appt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      <p className="font-sans text-sm text-brand-burgundy font-bold mt-1">{appt.time}</p>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 md:px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${getStatusBadge(appt.status)}`}>
                        {appt.status}
                      </span>
                    </td>

                    {/* Actions Dropdown / Buttons */}
                    <td className="px-6 md:px-8 py-5 text-right opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <select 
                        value=""
                        onChange={(e) => {
                          if (e.target.value === 'delete') handleDeleteAppointment(appt.id);
                          else if (e.target.value) handleUpdateStatus(appt.id, e.target.value);
                        }}
                        className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-brand-pink focus:border-brand-pink block w-full p-2"
                      >
                        <option value="" disabled>Action...</option>
                        <option value="Confirmed">Mark Confirmed</option>
                        <option value="Completed">Mark Completed</option>
                        <option value="Pending">Mark Pending</option>
                        <option value="delete" className="text-red-500">Cancel Booking</option>
                      </select>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD MANUAL BOOKING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm transition-all p-4">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-xl md:text-2xl font-bold text-gray-900">Add Walk-in / Call</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSaveAppointment} className="space-y-4">
              <div>
                <label className="block font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Client Name</label>
                <input 
                  type="text" name="clientName" required value={formData.clientName} onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-brand-pink"
                  placeholder="Jane Doe"
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Phone Number</label>
                <input 
                  type="tel" name="phone" required value={formData.phone} onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-brand-pink"
                  placeholder="077..."
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Requested Service</label>
                <input 
                  type="text" name="service" required value={formData.service} onChange={handleInputChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-brand-pink"
                  placeholder="e.g. Classic Acrylics"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Date</label>
                  <input 
                    type="date" name="date" required value={formData.date} onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-brand-pink"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Time</label>
                  <input 
                    type="time" name="time" required value={formData.time} onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-brand-pink"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end sm:space-x-3 pt-6 gap-3 sm:gap-0">
                <button type="button" onClick={handleCloseModal} className="w-full sm:w-auto px-6 py-2.5 rounded-full font-sans text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto bg-brand-burgundy text-white px-6 py-2.5 rounded-full font-sans text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Confirm Booking'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminAppointments;