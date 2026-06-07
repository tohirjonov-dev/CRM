import React, { useEffect, useState } from 'react';
import { Plus, Search, Mail, Phone, MapPin, User, X, Truck } from 'lucide-react';
import { useSuppliers, useCreateSupplier } from '../hooks/useApi';
import { formatApiError } from '../lib/errors';

const Suppliers: React.FC = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: suppliers, isLoading } = useSuppliers(debouncedSearch);
  const createSupplierMutation = useCreateSupplier();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState("O'zbekiston");
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = () => {
    const nextNum = 101 + (suppliers?.length ?? 0);
    setCode(`SUP-${nextNum}`);
    setName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setCountry("O'zbekiston");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      await createSupplierMutation.mutateAsync({
        code: code.trim().toUpperCase(),
        name,
        contact_person: contactPerson,
        email,
        phone,
        country,
      });
      setIsModalOpen(false);
    } catch (err: unknown) {
      setFormError(formatApiError(err, "Ta'minotchini qo'shib bo'lmadi."));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Ta&apos;minotchilar (SRM)</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Yetkazib beruvchilarni boshqaring, aloqa ma&apos;lumotlari va kodlarini saqlang
          </p>
        </div>
        <button
          onClick={openAddModal}
          disabled={createSupplierMutation.isPending}
          className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 font-bold text-black shadow-gold transition-all disabled:opacity-50"
        >
          <Plus size={16} />
          <span>Yangi ta&apos;minotchi</span>
        </button>
      </div>

      <div className="relative max-w-md bg-black/20 p-2 rounded-xl border border-white/5">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-gray-400">
          <Search size={16} />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nom, kod yoki email bo'yicha qidirish..."
          className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/5 border border-white/10 focus:border-gold-500/50 text-sm text-white placeholder-gray-400 outline-none transition-all"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="animate-pulse border border-white/5 bg-black/40 p-5 rounded-xl space-y-4">
              <div className="h-5 bg-white/5 rounded w-2/3" />
              <div className="h-4 bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : !suppliers || suppliers.length === 0 ? (
        <div className="text-center py-12 border border-white/5 rounded-xl bg-black/30 text-gray-400">
          Ta&apos;minotchilar topilmadi. Birinchi ta&apos;minotchini qo&apos;shing.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="group relative border border-white/5 bg-black/40 p-5 rounded-xl glass-card transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/30"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-gold-400" />
                  <span className="text-sm font-bold text-white group-hover:text-gold-400 transition-colors">
                    {supplier.name}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold text-gold-400 bg-gold-500/10 border border-gold-500/20">
                  {supplier.code}
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-gray-300">
                <div className="flex items-center gap-2.5 text-gray-400">
                  <User size={14} className="text-gold-500/70" />
                  <span>
                    Mas&apos;ul: <strong className="text-white font-medium">{supplier.contact_person}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-400">
                  <Mail size={14} className="text-gold-500/70" />
                  <span className="truncate">{supplier.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-gray-400">
                  <Phone size={14} className="text-gold-500/70" />
                  <span>{supplier.phone}</span>
                </div>
                <div className="flex items-start gap-2.5 text-gray-400">
                  <MapPin size={14} className="mt-0.5 text-gold-500/70 flex-shrink-0" />
                  <span>{supplier.country}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-xl border border-white/10 bg-[#121212] p-6 shadow-gold">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/5"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Yangi ta&apos;minotchi qo&apos;shish</h3>

            {formError && (
              <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-xs font-semibold text-red-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Kod (SKU)</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="SUP-109"
                    className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white font-mono outline-none focus:border-gold-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Mamlakat</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-gold-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Kompaniya nomi</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masalan: Toshkent Tekstil"
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
                    placeholder="+998901234567"
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
                  className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-gold-500/50"
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
                  disabled={createSupplierMutation.isPending}
                  className="py-2.5 px-5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black shadow-gold disabled:opacity-50"
                >
                  {createSupplierMutation.isPending ? 'Saqlanmoqda...' : "Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
