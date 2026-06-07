import React from 'react';
import { Order } from '../types';
import { ORDER_STATUS_UZ } from '../lib/uz';

interface OrdersTableProps {
  orders: Order[] | undefined;
  isLoading: boolean;
  onRowClick?: (order: Order) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({ orders, isLoading, onRowClick }) => {
  const getStatusBadge = (status: Order['status']) => {
    const statusStyles = {
      Pending: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      Processing: 'text-gold-400 bg-gold-500/10 border-gold-500/20',
      Shipped: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      Delivered: 'text-green-400 bg-green-500/10 border-green-500/20',
      Cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusStyles[status] || 'text-gray-400 bg-white/5 border-white/10'}`}>
        {ORDER_STATUS_UZ[status] || status}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/40 glass-card">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5 text-xs font-bold uppercase tracking-wider text-gray-400">
            <th className="py-3 px-5">Buyurtma raqami</th>
            <th className="py-3 px-5">Mijoz</th>
            <th className="py-3 px-5">Sana</th>
            <th className="py-3 px-5 text-right">Mahsulotlar</th>
            <th className="py-3 px-5 text-center">Holat</th>
            <th className="py-3 px-5 text-right">Jami summa</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="py-4 px-5"><div className="h-4 bg-white/5 rounded w-20" /></td>
                <td className="py-4 px-5"><div className="h-4 bg-white/5 rounded w-32" /></td>
                <td className="py-4 px-5"><div className="h-4 bg-white/5 rounded w-28" /></td>
                <td className="py-4 px-5 text-right"><div className="h-4 bg-white/5 rounded w-12 ml-auto" /></td>
                <td className="py-4 px-5 text-center"><div className="h-6 bg-white/5 rounded w-16 mx-auto" /></td>
                <td className="py-4 px-5 text-right"><div className="h-4 bg-white/5 rounded w-16 ml-auto" /></td>
              </tr>
            ))
          ) : !orders || orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 px-5 text-center text-gray-400">
                Buyurtmalar topilmadi.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr 
                key={order.id}
                onClick={() => onRowClick?.(order)}
                className={`transition-colors duration-150 hover:bg-white/5 ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                <td className="py-3.5 px-5 font-semibold text-gold-400">
                  {order.order_number}
                </td>
                <td className="py-3.5 px-5 font-medium text-white truncate max-w-[150px]">
                  {order.client?.company_name || `Mijoz #${order.client_id}`}
                </td>
                <td className="py-3.5 px-5 text-gray-400">
                  {formatDate(order.order_date)}
                </td>
                <td className="py-3.5 px-5 text-right font-mono text-gray-300">
                  {order.items_count.toLocaleString()}
                </td>
                <td className="py-3.5 px-5 text-center">
                  {getStatusBadge(order.status)}
                </td>
                <td className="py-3.5 px-5 text-right font-bold font-mono text-white">
                  ${order.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
