import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Overview', path: '/admin', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { name: 'Appointments', path: '/admin/appointments', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Service Menu', path: '/admin/services', icon: 'M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z' },
    { name: 'Promotions', path: '/admin/promotions', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
    { name: 'Media Gallery', path: '/admin/gallery', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  ];

  // Helper to close sidebar when a link is clicked on mobile
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-sans overflow-hidden">
      
      {/* --- MOBILE TOP HEADER --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 z-20 shadow-sm">
        <h2 className="font-serif text-xl font-bold text-brand-burgundy">Admin Dashboard</h2>
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          className="text-brand-burgundy focus:outline-none bg-brand-pink/20 p-2 rounded-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      {/* --- MOBILE OVERLAY BACKGROUND --- */}
      {/* Darkens the background when the menu is open on phones */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-brand-burgundy/40 backdrop-blur-sm z-30 lg:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* --- SIDEBAR (Sliding on Mobile, Fixed on Desktop) --- */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-white border-r border-gray-100 flex flex-col shadow-2xl z-40 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Sidebar Header */}
        <div className="p-8 flex justify-between items-start">
          <div>
            <h2 className="font-serif text-2xl font-bold text-brand-burgundy leading-tight">
              Twinkly Nails<br/>by Roshi
            </h2>
            <p className="text-xs text-gray-400 tracking-widest uppercase mt-2 font-bold">Premium Management</p>
          </div>
          
          {/* Mobile Close 'X' Button */}
          <button onClick={closeSidebar} className="lg:hidden text-gray-400 hover:text-brand-burgundy bg-gray-50 p-2 rounded-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto pb-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.name} 
                to={item.path}
                onClick={closeSidebar}
                className={`flex items-center px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive 
                  ? 'bg-brand-pink/30 text-brand-burgundy shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-brand-burgundy hover:translate-x-1'
                }`}
              >
                <svg className={`w-5 h-5 mr-3 ${isActive ? 'text-brand-burgundy' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2.5 : 2} d={item.icon} />
                </svg>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-6 border-t border-gray-50">
          <button className="flex items-center px-4 py-3 text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors w-full">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      {/* On mobile, we add top padding (pt-20) so the content isn't hidden behind the fixed top header */}
      <main className="flex-1 h-screen overflow-y-auto pt-20 lg:pt-0 relative">
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
    </div>
  );
};

export default AdminLayout;