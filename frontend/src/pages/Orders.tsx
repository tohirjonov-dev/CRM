import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Plus, Filter, X, ShoppingBag, Trash2 } from 'lucide-react';
import { 
  useOrders, useCreateOrder, useUpdateOrderStatus, 
  useClients, useProducts 
} from '../hooks/useApi';
import OrdersTable from '../components/OrdersTable';
import { Order } from '../types';
import { ORDER_STATUS_UZ } from '../lib/uz';
import { formatApiError } from '../lib/errors';

const Orders: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  
  // Order entry modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | ''>('');
  const [orderItems, setOrderItems] = useState<{ product_id: number; name: string; sku: string; price: number; quantity: number; availableStock: number }[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
  const [addItemQty, setAddItemQty] = useState(1);
  const [createError, setCreateError] = useState<string | null>(null);

  // Fetch orders
  const limit = 10;
  const { data: ordersData, isLoading } = useOrders({
    page,
    limit,
    status: statusFilter || undefined,
  });

  // Fetch clients and products for creation dropdowns
  const { data: clients } = useClients();
  const { data: productsData } = useProducts({ page: 1, limit: 100 });

  // Mutators
  const createOrderMutation = useCreateOrder();
  const updateStatusMutation = useUpdateOrderStatus();

  // Handle URL deep link (e.g. from dashboard click)
  const orderIdParam = searchParams.get('id');
  useEffect(() => {
    if (orderIdParam && ordersData) {
      const match = ordersData.items.find(o => o.id === Number(orderIdParam));
      if (match) {
        setSelectedOrder(match);
        setIsDetailOpen(true);
      }
    }
  }, [orderIdParam, ordersData]);

  const handleRowClick = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;
    try {
      const updated = await updateStatusMutation.mutateAsync({
        id: selectedOrder.id,
        status: newStatus,
      });
      setSelectedOrder(updated);
    } catch (err: any) {
      alert(formatApiError(err, 'Buyurtma holatini yangilab bo‘lmadi.'));
    }
  };

  const addOrderItem = () => {
    if (!selectedProductId) return;
    const prod = productsData?.items.find(p => p.id === Number(selectedProductId));
    if (!prod) return;

    // Check if item already added
    const existing = orderItems.find(item => item.product_id === prod.id);
    if (existing) {
      alert('Mahsulot allaqachon qo‘shilgan. Miqdorni o‘zgartiring.');
      return;
    }

    if (prod.stock_quantity < addItemQty) {
      alert(`Omborda yetarli emas. Faqat ${prod.stock_quantity} dona mavjud.`);
      return;
    }

    setOrderItems(prev => [
      ...prev,
      {
        product_id: prod.id,
        name: prod.name,
        sku: prod.sku,
        price: prod.price,
        quantity: addItemQty,
        availableStock: prod.stock_quantity
      }
    ]);
    setSelectedProductId('');
    setAddItemQty(1);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!selectedClientId) {
      setCreateError('B2B mijozni tanlang.');
      return;
    }
    if (orderItems.length === 0) {
      setCreateError('Kamida bitta mahsulot qo‘shing.');
      return;
    }

    try {
      await createOrderMutation.mutateAsync({
        client_id: Number(selectedClientId),
        items: orderItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      });
      
      // Reset
      setIsCreateOpen(false);
      setSelectedClientId('');
      setOrderItems([]);
    } catch (err: any) {
      setCreateError(formatApiError(err, 'Buyurtma yaratib bo‘lmadi.'));
    }
  };

  const totalAmount = orderItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const totalPages = ordersData ? Math.ceil(ordersData.total / limit) : 0;
  const hasClients = clients && clients.length > 0;
  const hasProducts = productsData && productsData.items.length > 0;
  const canCreateOrder = hasClients && hasProducts;

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Buyurtmalar (CRM va WMS)</h1>
          <p className="text-xs text-gray-400 mt-0.5">Ulgurji buyurtmalar, yetkazish holati va hisob-faktura</p>
        </div>
        <button
          onClick={() => {
            setCreateError(null);
            setIsCreateOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 font-bold text-black shadow-gold transition-all"
        >
          <Plus size={16} />
          <span>Yangi buyurtma</span>
        </button>
      </div>

      {/* Filters Row */}
      <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5 text-xs text-gray-300">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-gray-400">
            <Filter size={14} />
            Holat bo&apos;yicha:
          </span>
          {['', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors ${
                statusFilter === status 
                  ? 'bg-gold-500/15 border-gold-500/40 text-gold-400' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {status ? (ORDER_STATUS_UZ[status] || status) : 'Barchasi'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <OrdersTable
        orders={ordersData?.items}
        isLoading={isLoading}
        onRowClick={handleRowClick}
      />

      {/* Pagination Controls */}
      {ordersData && ordersData.total > limit && (
        <div className="flex items-center justify-between text-xs text-gray-400 mt-2">
          <span>Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, ordersData.total)} of {ordersData.total} items</span>
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

      {/* Order Details Modal */}
      {isDetailOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-xl border border-white/10 bg-[#121212] p-6 shadow-gold animate-in fade-in duration-200">
            <button
              onClick={() => setIsDetailOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/5"
            >
              <X size={18} />
            </button>

            {/* Header info */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">Buyurtma tafsilotlari</span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedOrder.order_number}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400">Holat</span>
                <div className="mt-1">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold py-1.5 px-3 rounded-lg outline-none cursor-pointer focus:border-gold-500/50"
                  >
                    {(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const).map((s) => (
                      <option key={s} value={s} className="bg-[#121212]">
                        {ORDER_STATUS_UZ[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Client profile card */}
            {selectedOrder.client && (
              <div className="p-4 rounded-xl border border-white/5 bg-black/30 mb-5 text-xs grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 font-semibold block uppercase">Mijoz</span>
                  <strong className="text-white text-sm mt-0.5 block">{selectedOrder.client.company_name}</strong>
                  <span className="text-gray-400 block mt-1">Mas&apos;ul: {selectedOrder.client.contact_person}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block uppercase">Yetkazish manzili</span>
                  <span className="text-gray-300 mt-0.5 block truncate" title={selectedOrder.client.address}>
                    {selectedOrder.client.address}
                  </span>
                  <span className="text-gray-400 block mt-1">Tel: {selectedOrder.client.phone}</span>
                </div>
              </div>
            )}

            {/* Items table */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Buyurtma qatorlari</span>
              <div className="overflow-hidden border border-white/5 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-white/5 font-bold text-gray-400 uppercase">
                      <th className="py-2.5 px-4">SKU</th>
                      <th className="py-2.5 px-4">Nom</th>
                      <th className="py-2.5 px-4 text-right">Birlik narxi</th>
                      <th className="py-2.5 px-4 text-right">Miqdor</th>
                      <th className="py-2.5 px-4 text-right">Jami</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {selectedOrder.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5 px-4 font-mono font-semibold text-gold-400">{item.product?.sku || 'N/A'}</td>
                        <td className="py-2.5 px-4 font-medium text-white">{item.product?.name || 'Noma\'lum'}</td>
                        <td className="py-2.5 px-4 text-right font-mono">${item.unit_price.toFixed(2)}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold">{item.quantity.toLocaleString()}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-white">
                          ${(item.unit_price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer total row */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-5">
              <span className="text-xs text-gray-400">Jami: {selectedOrder.items_count.toLocaleString()} dona</span>
              <div className="text-right">
                <span className="text-xs text-gray-400 block">Umumiy summa</span>
                <strong className="text-xl font-bold font-mono text-white">
                  ${selectedOrder.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Order Entry Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-xl border border-white/10 bg-[#121212] p-6 shadow-gold animate-in fade-in duration-200">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/5"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <ShoppingBag size={20} className="text-gold-400" />
              <span>Yangi B2B buyurtma</span>
            </h3>

            {!canCreateOrder && (
              <div className="mb-4 p-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs text-amber-200 space-y-2">
                <p className="font-semibold">Buyurtma yaratish uchun avval quyidagilar kerak:</p>
                {!hasClients && (
                  <p>
                    •{' '}
                    <Link to="/clients" className="text-gold-400 underline" onClick={() => setIsCreateOpen(false)}>
                      Kamida bitta mijoz (CRM)
                    </Link>
                  </p>
                )}
                {!hasProducts && (
                  <p>
                    •{' '}
                    <Link to="/inventory" className="text-gold-400 underline" onClick={() => setIsCreateOpen(false)}>
                      Kamida bitta mahsulot omborda (WMS)
                    </Link>
                  </p>
                )}
              </div>
            )}

            {createError && (
              <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-xs font-semibold text-red-400">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-400 mb-1.5">B2B mijoz</label>
                <select
                  required
                  disabled={!hasClients}
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 outline-none cursor-pointer focus:border-gold-500/50 disabled:opacity-50"
                >
                  <option value="" className="bg-[#121212]">— Mijozni tanlang —</option>
                  {clients?.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#121212]">
                      {c.company_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border border-white/5 p-4 rounded-lg bg-black/20 space-y-3">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Mahsulot qo&apos;shish</span>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase mb-1">Mahsulot</label>
                    <select
                      disabled={!hasProducts}
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full h-9 px-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 outline-none cursor-pointer focus:border-gold-500/50 disabled:opacity-50"
                    >
                      <option value="" className="bg-[#121212]">— Mahsulotni tanlang —</option>
                      {productsData?.items.map((p) => (
                        <option key={p.id} value={p.id} className="bg-[#121212]" disabled={p.stock_quantity <= 0}>
                          {p.name} ({p.sku}) [ombor: {p.stock_quantity}]
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase mb-1">Miqdor</label>
                    <input
                      type="number"
                      min="1"
                      disabled={!hasProducts}
                      value={addItemQty}
                      onChange={(e) => setAddItemQty(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white outline-none focus:border-gold-500/50 disabled:opacity-50"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={addOrderItem}
                      disabled={!selectedProductId || !hasProducts}
                      className="w-full h-9 rounded-lg bg-white/10 hover:bg-gold-500/20 text-white hover:text-gold-400 border border-white/10 hover:border-gold-500/30 text-xs font-semibold disabled:opacity-40 transition-colors"
                    >
                      Qo&apos;shish
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Savat</span>
                <div className="overflow-hidden border border-white/5 rounded-lg max-h-40 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-white/5 font-bold text-gray-400 uppercase">
                        <th className="py-2 px-3">SKU</th>
                        <th className="py-2 px-3">Nom</th>
                        <th className="py-2 px-3 text-right">Narx</th>
                        <th className="py-2 px-3 text-right">Miqdor</th>
                        <th className="py-2 px-3 text-right">Jami</th>
                        <th className="py-2 px-3 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-gray-300">
                      {orderItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 px-3 text-center text-gray-500">
                            Savat bo&apos;sh. Yuqoridan mahsulot qo&apos;shing.
                          </td>
                        </tr>
                      ) : (
                        orderItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-2 px-3 font-mono text-gold-400">{item.sku}</td>
                            <td className="py-2 px-3 font-medium text-white truncate max-w-[120px]">{item.name}</td>
                            <td className="py-2 px-3 text-right font-mono">${item.price.toFixed(2)}</td>
                            <td className="py-2 px-3 text-right font-mono font-semibold">{item.quantity}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-white">
                              ${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => removeOrderItem(idx)}
                                className="p-1 rounded text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Summary and Submit */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-5">
                <div>
                  <span className="text-xs text-gray-400">Buyurtma jami</span>
                  <strong className="text-lg font-bold font-mono text-white block">
                    ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div className="flex gap-3 text-sm font-semibold">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="py-2.5 px-4 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={!canCreateOrder || orderItems.length === 0}
                    className="py-2.5 px-5 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-black shadow-gold disabled:opacity-50"
                  >
                    Buyurtmani yuborish
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
