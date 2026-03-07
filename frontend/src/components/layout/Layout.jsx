import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import api from '../../api/client';

const PAGE_TITLES = {
  '/': { title: 'Dashboard', sub: 'Welcome back! Here\'s your business overview.' },
  '/appointments': { title: 'Appointments', sub: 'Manage your daily bookings' },
  '/customers': { title: 'Customers', sub: 'Manage your customer profiles' },
  '/services': { title: 'Services', sub: 'Manage your salon services' },
  '/income': { title: 'Income', sub: 'Track your earnings' },
  '/expenses': { title: 'Expenses', sub: 'Track your business expenses' },
  '/inventory': { title: 'Inventory', sub: 'Manage your stock and supplies' },
  '/reports': { title: 'Reports', sub: 'Monthly business summary' },
  '/settings': { title: 'Settings', sub: 'Manage your profile and salon info' },
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);
  const location = useLocation();
  const pageInfo = PAGE_TITLES[location.pathname] || { title: 'Nail Saloon', sub: '' };

  useEffect(() => {
    api.get('/inventory/low-stock').then(({ data }) => setLowStockCount(data.length)).catch(() => {});
  }, [location.pathname]);

  return (
    <div className="app-layout">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        lowStockCount={lowStockCount}
      />
      <div className="main-content">
        <TopBar
          pageTitle={pageInfo.title}
          pageSubtitle={pageInfo.sub}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
