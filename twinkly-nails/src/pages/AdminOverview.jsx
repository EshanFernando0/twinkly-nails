import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const AdminOverview = () => {
  const [stats, setStats] = useState({ services: 0, appointments: 0, promotions: 0 });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Services Count
    const unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
      setStats(prev => ({ ...prev, services: snap.size }));
    });

    // Listen to Promotions Count
    const unsubPromos = onSnapshot(collection(db, 'promotions'), (snap) => {
      setStats(prev => ({ ...prev, promotions: snap.size }));
    });

    // Listen to Appointments Count & Fetch Recent
    const unsubAppts = onSnapshot(collection(db, 'appointments'), (snap) => {
      setStats(prev => ({ ...prev, appointments: snap.size }));
      
      const appts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by newest
      appts.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      setRecentAppointments(appts.slice(0, 5)); // Show top 5
      setLoading(false);
    });

    return () => {
      unsubServices();
      unsubPromos();
      unsubAppts();
    };
  }, []);

  return (
    <div className="w-full animate-fade-in overflow-hidden">
      
      {/* Page Header - Scaled for mobile */}
      <div className="mb-6 md:mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-brand-burgundy break-words">Business Overview</h1>
        <p className="text-gray-500 mt-2 font-sans text-base md:text-lg">Welcome back, Roshi. Here is your salon's current status.</p>
      </div>

      {/* 3-Column Stats Grid - Stacks to 1 column on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
        
        {/* Services Stat */}
        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-brand-pink/40 flex items-center gap-4 md:gap-6 hover:shadow-md transition-shadow">
          <div className="bg-rose-100 p-3 md:p-4 rounded-2xl text-brand-burgundy shrink-0">
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 truncate">Active Services</p>
            <h3 className="text-3xl md:text-4xl font-bold text-brand-burgundy">{stats.services}</h3>
          </div>
        </div>

        {/* Appointments Stat */}
        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-brand-pink/40 flex items-center gap-4 md:gap-6 hover:shadow-md transition-shadow">
          <div className="bg-pink-100 p-3 md:p-4 rounded-2xl text-pink-700 shrink-0">
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 truncate">Total Bookings</p>
            <h3 className="text-3xl md:text-4xl font-bold text-pink-700">{stats.appointments}</h3>
          </div>
        </div>

        {/* Promotions Stat */}
        <div className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-brand-pink/40 flex items-center gap-4 md:gap-6 hover:shadow-md transition-shadow">
          <div className="bg-purple-100 p-3 md:p-4 rounded-2xl text-purple-700 shrink-0">
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 truncate">Active Promos</p>
            <h3 className="text-3xl md:text-4xl font-bold text-purple-700">{stats.promotions}</h3>
          </div>
        </div>

      </div>

      {/* Recent Appointments List */}
      <div className="bg-white rounded-3xl shadow-sm border border-brand-pink/40 overflow-hidden w-full">
        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-brand-pink/10">
          <h3 className="font-serif text-xl md:text-2xl font-bold text-brand-burgundy">Recent Appointments</h3>
        </div>
        
        <div className="p-4 md:p-6">
          {loading ? (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-brand-pink/30 rounded w-3/4"></div>
                <div className="h-4 bg-brand-pink/30 rounded w-1/2"></div>
              </div>
            </div>
          ) : recentAppointments.length === 0 ? (
            <p className="text-gray-500 font-sans text-center py-6 text-base md:text-lg">No appointments recorded yet.</p>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {recentAppointments.map((appt) => (
                <div key={appt.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-start md:items-center p-4 md:p-5 bg-gray-50 rounded-2xl hover:bg-brand-pink/5 transition-colors border border-gray-100">
                  <div className="mb-3 sm:mb-0 w-full sm:w-auto break-words">
                    <p className="font-bold text-brand-burgundy text-base md:text-lg">{appt.clientName || 'Guest Client'}</p>
                    <p className="text-xs md:text-sm text-gray-500 font-medium mt-1">{appt.service || 'Nail Service'} • {appt.phone || 'No Number'}</p>
                  </div>
                  <div className="w-full sm:w-auto text-left sm:text-right shrink-0">
                    <span className="inline-block px-3 py-1 bg-brand-pink/30 text-brand-burgundy text-[10px] md:text-xs font-bold rounded-full uppercase tracking-widest">
                      {appt.status || 'Scheduled'}
                    </span>
                    <p className="text-xs text-gray-400 mt-2 font-medium">{appt.date || 'TBD'} • {appt.time || 'TBD'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminOverview;