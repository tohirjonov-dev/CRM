import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, MapPin, User, X } from 'lucide-react';
import { useClients, useCreateClient } from '../hooks/useApi';
import { formatApiError } from '../lib/errors';

const Clients: React.FC = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch B2B clients
  const { data: clients, isLoading } = useClients(debouncedSearch);

  // Mutator
  const createClientMutation = useCreateClient();

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = () => {
    setCompanyName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setAddress('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      company_name: companyName,
      contact_person: contactPerson,
      email,
      phone,
      address,
    };

    try {
      await createClientMutation.mutateAsync(payload);
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(formatApiError(err, "Mijozni ro'yxatdan o'tkazib bo'lmadi."));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">B2B mijozlar (CRM)</h1>
          <p className="text-xs text-gray-400 mt-0.5">Ulgurji mijozlar, xaridorlar va aloqa ma&apos;lumotlari</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 font-bold text-black shadow-gold transition-all"
        >
          <Plus size={16} />
          <span>Yangi mijoz</span>
        </button>
      </div>

      {/* Search Filter Row */}
      <div className="relative max-w-md bg-black/20 p-2 rounded-xl border border-white/5">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400">
          <Search size={16} />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Kompaniya yoki kontakt bo'yicha qidirish..."
          className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/5 border border-white/10 focus:border-gold-500/50 text-sm text-white placeholder-gray-400 outline-none transition-all"
        />
      </div>

      {/* Main Grid View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="animate-pulse border border-white/5 bg-black/40 p-5 rounded-xl space-y-4">
              <div className="h-5 bg-white/5 rounded w-2/3" />
              <div className="h-4 bg-white/5 rounded w-1/2" />
              <div className="h-4 bg-white/5 rounded w-3/4" />
              <div className="h-4 bg-white/5 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : !clients || clients.length === 0 ? (
        <div className="text-center py-12 border border-white/5 rounded-xl bg-black/30 text-gray-400">
          Mijozlar topilmadi.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clients.map((client) => (
            <div
              key={client.id}
              className="group relative border border-white/5 bg-black/40 p-5 rounded-xl glass-card transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/30"
            >
              {/* Active Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-white group-hover:text-gold-400 transition-colors">
                  {client.company_name}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  client.is_active 
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                    : 'text-gray-400 bg-white/5 border-white/10'
                }`}>
                  {client.is_active ? 'Faol' : 'Nofaol'}
                </span>
              </div>

              {/* Contact Details List */}
              <div className="space-y-2.5 text-xs text-gray-300">
                <div className="flex items-center gap-2.5 text-gray-400">
                  <User size={14} className="text-gold-500/70" />
                  <span>Mas&apos;ul: <strong className="text-white font-medium">{client.contact_person}</strong></span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-400">
                  <Mail size={14} className="text-gold-500/70" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-400">
                  <Phone size={14} className="text-gold-500/70" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-start gap-2.5 text-gray-400">
                  <MapPin size={14} className="mt-0.5 text-gold-500/70 flex-shrink-0" />
                  <span className="line-clamp-2" title={client.address}>{client.address}</span>
                </div>
              </div>

              {/* Gold border overlay */}
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-xl border border-white/10 bg-[#121212] p-6 shadow-gold animate-in fade-in duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/5"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Yangi B2B mijoz</h3>

            {formError && (
              <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-xs font-semibold text-red-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Kompaniya nomi</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Fashion Hub Ltd"
                  className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-gold-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Mas&apos;ul shaxs</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-gold-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Telefon</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1-555-0199"
                    className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-gold-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. purchase@fashionhub.com"
                  className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-gold-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Yetkazib berish manzili</label>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 100 Fashion Blvd, Suite 10, New York, NY 10001"
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-gold-500/50 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={createClientMutation.isPending}
                  className="py-2.5 px-5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black shadow-gold disabled:opacity-50"
                >
                  {createClientMutation.isPending ? 'Saqlanmoqda...' : "Ro'yxatdan o'tkazish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
