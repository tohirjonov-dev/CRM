import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Boxes, FileSpreadsheet, Users, Truck,
  LineChart, Settings, LogOut, X, Cloud 
} from 'lucide-react';
import { ROLE_UZ } from '../lib/uz';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  user: { full_name: string; email: string; role: string } | null;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, user, onLogout }) => {
  const navigate = useNavigate();
  const navigation = [
    { name: 'Boshqaruv paneli', to: '/', icon: LayoutDashboard },
    { name: 'Ombor (WMS)', to: '/inventory', icon: Boxes },
    { name: 'Buyurtmalar (CRM)', to: '/orders', icon: FileSpreadsheet },
    { name: 'Mijozlar (CRM)', to: '/clients', icon: Users },
    { name: "Ta'minotchilar (SRM)", to: '/suppliers', icon: Truck },
    { name: 'Tahlil', to: '/analytics', icon: LineChart },
    { name: 'Sozlamalar', to: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-60 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 h-full border-r border-white/10 glass-panel transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 text-black shadow-gold font-bold">
              <Cloud size={20} className="text-black" />
            </div>
            <span className="text-lg font-bold tracking-wider bg-gradient-to-r from-white via-white to-gold-400 bg-clip-text text-transparent">
              ApparelCloud
            </span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-md text-gray-400 hover:text-white lg:hidden hover:bg-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => 
                  `flex items-center gap-4 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    isActive 
                      ? 'text-gold-400 bg-gold-500/10 border-l-4 border-gold-500 pl-3 shadow-gold' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 pl-4'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon 
                      size={18} 
                      className={`transition-colors duration-200 ${
                        isActive ? 'text-gold-400' : 'text-gray-400 group-hover:text-white'
                      }`}
                    />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer Profile */}
        {user && (
          <div className="p-4 border-t border-white/10 bg-black/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 border border-white/10 text-gold-400 font-semibold uppercase">
                {user.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-white">{user.full_name}</p>
                <p className="text-xs truncate text-gray-400">{ROLE_UZ[user.role] || user.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-lg transition-all"
            >
              <LogOut size={14} />
              <span>Chiqish</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
