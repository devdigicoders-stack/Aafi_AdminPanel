import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Image, 
  LayoutGrid, 
  ClipboardList, 
  PackageCheck, 
  LogOut,
  Search,
  Bell,
  Menu,
  UserCog
} from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) return;
        const res = await fetch(`${baseUrl}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setAdminUser(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchAdmin();
  }, [baseUrl]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Sliders / Banners', path: '/sliders', icon: Image },
    { name: 'Categories', path: '/categories', icon: LayoutGrid },
    { name: 'Products', path: '/products', icon: PackageCheck },
    { name: 'Requests', path: '/requests', icon: ClipboardList },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Profile Settings', path: '/profile', icon: UserCog },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-[#0c1a32] text-white flex flex-col h-full shadow-xl z-50 fixed lg:static transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Sidebar Header / Logo */}
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
           <img src="/logo.png" alt="Logo" className="w-32 h-auto object-contain rounded-md" />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-500' 
                        : 'text-gray-300 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-blue-400' : 'text-gray-400'} />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 mt-auto border-t border-white/10">
          <button 
            onClick={() => navigate('/login')}
            className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors w-full"
          >
            <LogOut size={20} className="text-gray-400" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm z-10 w-full">
          <div className="flex items-center gap-4">
            <button 
              className="text-gray-500 hover:text-gray-700 lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800 hidden md:block">
              {navItems.find(i => location.pathname.startsWith(i.path))?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-6">
            {/* User Profile */}
            <Link to="/profile" className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-lg transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                <img src={`https://ui-avatars.com/api/?name=${adminUser?.name || 'Admin'}&background=random`} alt="Admin" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block text-sm">
                <p className="font-semibold text-gray-800 leading-none">{adminUser?.name || 'Admin'}</p>
                <p className="text-xs text-gray-500 mt-1 capitalize">{adminUser?.role || 'Super Admin'}</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content Outlet */}
        <div className="flex-1 overflow-auto bg-[#f8f9fc] p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
