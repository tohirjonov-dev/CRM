import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Clients from './pages/Clients';
import Suppliers from './pages/Suppliers';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import api from './lib/api';
import { applyPreferences, loadPreferences } from './lib/preferences';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const AppContent: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    applyPreferences(loadPreferences());
  }, []);

  // Load user profile on mount or token changes
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!token) {
        setUser(null);
        setIsLoadingUser(false);
        return;
      }

      setIsLoadingUser(true);
      try {
        const res = await api.get('/api/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error('Failed to load user profile, purging token', err);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUserProfile();
  }, [token]);

  const handleLoginSuccess = (newToken: string, loggedUser: any) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(loggedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (isLoadingUser && token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gold-500" />
        <span className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Tizimga ulanmoqda...</span>
      </div>
    );
  }

  if (!token || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top Header */}
        <Header 
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)} 
          user={user} 
          onLogout={handleLogout} 
        />

        {/* Page Container */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
