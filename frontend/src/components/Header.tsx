import React, { useEffect, useRef, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, Search, Menu, Settings, LogOut, ChevronRight } from 'lucide-react';
import { FOCUS_SEARCH_EVENT } from '../lib/preferences';
import { ROLE_UZ } from '../lib/uz';

interface HeaderProps {
  onMenuToggle: () => void;
  user: { full_name: string; email: string; role: string } | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, user, onLogout }) => {
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Breadcrumbs calculation
  const pathnames = location.pathname.split('/').filter((x) => x);
  const breadcrumbMap: Record<string, string> = {
    inventory: 'Ombor (WMS)',
    orders: 'Buyurtmalar (CRM)',
    clients: 'Mijozlar (CRM)',
    suppliers: "Ta'minotchilar (SRM)",
    analytics: 'Tahlil',
    settings: 'Sozlamalar',
  };

  const focusSearch = () => searchInputRef.current?.focus();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        focusSearch();
      }
    };
    const handleFocusEvent = () => focusSearch();
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener(FOCUS_SEARCH_EVENT, handleFocusEvent);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener(FOCUS_SEARCH_EVENT, handleFocusEvent);
    };
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
      {/* Left side: Hamburger (mobile) + Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 lg:hidden"
        >
          <Menu size={22} />
        </button>

        {/* Breadcrumb Navigation */}
        <nav className="hidden md:flex items-center gap-2 text-sm">
          <Link to="/" className="text-gray-400 hover:text-gold-400 transition-colors">
            ApparelCloud
          </Link>
          {pathnames.length > 0 && <ChevronRight size={14} className="text-white/20" />}
          {pathnames.map((value, index) => {
            const last = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            const label = breadcrumbMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

            return last ? (
              <span key={to} className="text-gold-400 font-medium capitalize">
                {label}
              </span>
            ) : (
              <React.Fragment key={to}>
                <Link to={to} className="text-gray-400 hover:text-gold-400 transition-colors capitalize">
                  {label}
                </Link>
                <ChevronRight size={14} className="text-white/20" />
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Right side: Global Search + Notifications + Profile dropdown */}
      <div className="flex items-center gap-4">
        {/* Global Search Bar */}
        <div className="relative hidden sm:block w-60 md:w-72">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Qidiruv... (⌘K)"
            className="w-full h-9 pl-10 pr-12 rounded-lg bg-white/5 hover:bg-white/10 focus:bg-[#121212] border border-white/10 focus:border-gold-500/50 text-sm placeholder-gray-400 text-white outline-none transition-all"
          />
          <kbd className="absolute right-3 top-2 flex h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/5 px-1.5 font-mono text-[10px] font-medium text-gray-400">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
          <Bell size={20} />
          {/* Badge */}
          <span className="absolute top-1 right-1 flex h-2 w-2 rounded-full bg-gold-500 ring-2 ring-[#0a0a0a] animate-pulse-glow" />
        </button>

        {/* Profile Avatar & Dropdown */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full border border-white/10 hover:border-gold-500/50 transition-colors outline-none"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gold-500/20 text-gold-400 font-bold text-sm uppercase">
                {user.full_name.charAt(0)}
              </div>
            </button>

            {/* Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#121212] shadow-gold p-1 animate-in fade-in duration-200">
                <div className="px-3 py-2.5 border-b border-white/5">
                  <p className="text-sm font-semibold text-white truncate">{user.full_name}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                </div>
                <div className="p-1 space-y-0.5">
                  <Link
                    to="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  >
                    <Settings size={16} className="text-gray-400" />
                    <span>Sozlamalar</span>
                  </Link>
                </div>
                <div className="p-1 border-t border-white/5">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Chiqish</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
