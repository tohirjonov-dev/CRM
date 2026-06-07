import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, AlertTriangle, X } from 'lucide-react';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useSuppliers } from '../hooks/useApi';
import ProductsTable from '../components/ProductsTable';
import { Product } from '../types';
import { formatApiError } from '../lib/errors';
import { CATEGORY_UZ } from '../lib/uz';

const Inventory: React.FC = () => {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const { data: suppliers } = useSuppliers();

  // Fetch products
  const limit = 10;
  const { data, isLoading } = useProducts({
    page,
    limit,
    category,
    stockStatus,
    search: debouncedSearch,
  });

  // Mutators
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  // Form states
  const [formSku, setFormSku] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState("Men's");
  const [formPrice, setFormPrice] = useState(0);
  const [formStock, setFormStock] = useState(0);
  const [formMinStock, setFormMinStock] = useState(10);
  const [formSupplier, setFormSupplier] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormSku(`WH-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormName('');
    setFormCategory("Men's");
    setFormPrice(25.0);
    setFormStock(50);
    setFormMinStock(10);
    setFormSupplier(suppliers?.[0]?.code || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormSku(product.sku);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormPrice(product.price);
    setFormStock(product.stock_quantity);
    setFormMinStock(product.min_stock_level);
    setFormSupplier(product.supplier_id || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const payload = {
      sku: formSku,
      name: formName,
      category: formCategory,
      price: Number(formPrice),
      stock_quantity: Number(formStock),
      min_stock_level: Number(formMinStock),
      supplier_id: formSupplier || null,
    };

    if (payload.price <= 0 || payload.stock_quantity < 0 || payload.min_stock_level < 0) {
      setFormError("Noto'g'ri raqamlar. Narx 0 dan katta, miqdorlar 0 dan katta yoki teng bo'lishi kerak.");
      return;
    }

    try {
      if (editingProduct) {
        await updateProductMutation.mutateAsync({
          id: editingProduct.id,
          data: payload,
        });
      } else {
        await createProductMutation.mutateAsync(payload);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(formatApiError(err, "Mahsulotni saqlab bo'lmadi."));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProductMutation.mutateAsync(id);
    } catch (err: any) {
      alert(formatApiError(err, "Mahsulotni o'chirib bo'lmadi."));
    }
  };

  // Filter handlers
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setPage(1);
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStockStatus(e.target.value);
    setPage(1);
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Ombor katalogi (WMS)</h1>
          <p className="text-xs text-gray-400 mt-0.5">Ulgurji ombor, minimal zaxira signallari va mahsulot parametrlari</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 font-bold text-black shadow-gold transition-all"
        >
          <Plus size={16} />
          <span>Yangi mahsulot</span>
        </button>
      </div>

      {/* Low Stock Alerts Banner (If any) */}
      {data && data.items.some(p => p.stock_quantity <= p.min_stock_level) && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 animate-pulse-glow">
          <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold">Kam zaxira ogohlantirishi</h4>
            <p className="text-xs text-gray-300 mt-0.5">Ba&apos;zi mahsulotlar minimal darajadan past. Tez orada to&apos;ldirish buyurtmasi bering.</p>
          </div>
        </div>
      )}

      {/* Filters & Search Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 bg-black/20 p-4 rounded-xl border border-white/5">
        {/* Search */}
        <div className="relative md:col-span-2">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom yoki SKU bo'yicha qidirish..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/5 border border-white/10 focus:border-gold-500/50 text-sm text-white placeholder-gray-400 outline-none transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <Filter size={14} />
          </div>
          <select
            value={category}
            onChange={handleCategoryChange}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 outline-none appearance-none cursor-pointer focus:border-gold-500/50"
          >
            <option value="" className="bg-[#0a0a0a]">Barcha kategoriyalar</option>
            <option value="Men's" className="bg-[#0a0a0a]">{CATEGORY_UZ["Men's"]}</option>
            <option value="Women's" className="bg-[#0a0a0a]">{CATEGORY_UZ["Women's"]}</option>
            <option value="Kids" className="bg-[#0a0a0a]">{CATEGORY_UZ.Kids}</option>
            <option value="Accessories" className="bg-[#0a0a0a]">{CATEGORY_UZ.Accessories}</option>
          </select>
        </div>

        {/* Stock Level Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <AlertTriangle size={14} />
          </div>
          <select
            value={stockStatus}
            onChange={handleStockChange}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 outline-none appearance-none cursor-pointer focus:border-gold-500/50"
          >
            <option value="" className="bg-[#0a0a0a]">Barcha zaxira holatlari</option>
            <option value="low" className="bg-[#0a0a0a]">Kam / tugagan</option>
            <option value="out_of_stock" className="bg-[#0a0a0a]">Tugagan</option>
            <option value="normal" className="bg-[#0a0a0a]">Normal</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <ProductsTable
        products={data?.items}
        isLoading={isLoading}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      {/* Pagination Row */}
      {data && data.total > limit && (
        <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
          <span>{((page - 1) * limit) + 1}–{Math.min(page * limit, data.total)} / {data.total} ta</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="py-1 px-3 rounded bg-white/5 border border-white/10 text-gray-300 disabled:opacity-40 hover:bg-white/10 transition-colors"
            >
              Oldingi
            </button>
            <span className="font-semibold text-white">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="py-1 px-3 rounded bg-white/5 border border-white/10 text-gray-300 disabled:opacity-40 hover:bg-white/10 transition-colors"
            >
              Keyingi
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-xl border border-white/10 bg-[#121212] p-6 shadow-gold animate-in fade-in duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/5"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              {editingProduct ? `Tahrirlash: ${editingProduct.name}` : 'Yangi mahsulot'}
            </h3>

            {formError && (
              <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-xs font-semibold text-red-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">SKU kodi</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-gold-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Kategoriya</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 outline-none cursor-pointer focus:border-gold-500/50"
                  >
                    <option value="Men's">{CATEGORY_UZ["Men's"]}</option>
                    <option value="Women's">{CATEGORY_UZ["Women's"]}</option>
                    <option value="Kids">{CATEGORY_UZ.Kids}</option>
                    <option value="Accessories">{CATEGORY_UZ.Accessories}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Mahsulot nomi</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Vintage Denim Trouser"
                  className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-gold-500/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Narx ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-gold-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Ombordagi miqdor</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-gold-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Minimal zaxira</label>
                  <input
                    type="number"
                    required
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-gold-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">Ta&apos;minotchi (SRM)</label>
                <select
                  value={formSupplier}
                  onChange={(e) => setFormSupplier(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 outline-none cursor-pointer focus:border-gold-500/50"
                >
                  <option value="" className="bg-[#121212]">— Tanlanmagan —</option>
                  {suppliers?.map((s) => (
                    <option key={s.id} value={s.code} className="bg-[#121212]">
                      {s.code} — {s.name}
                    </option>
                  ))}
                </select>
                {(!suppliers || suppliers.length === 0) && (
                  <p className="text-[10px] text-amber-400 mt-1">
                    Avval SRM bo&apos;limida ta&apos;minotchi qo&apos;shing.
                  </p>
                )}
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
                  className="py-2.5 px-5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black shadow-gold"
                >
                  {editingProduct ? 'Saqlash' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
