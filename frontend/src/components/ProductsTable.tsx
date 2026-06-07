import React from 'react';
import { Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Product } from '../types';
import { CATEGORY_UZ } from '../lib/uz';

interface ProductsTableProps {
  products: Product[] | undefined;
  isLoading: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (id: number) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({ products, isLoading, onEdit, onDelete }) => {
  const getStockStatus = (qty: number, minLevel: number) => {
    if (qty === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
          <AlertCircle size={12} />
          Tugagan
        </span>
      );
    }
    if (qty <= minLevel) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertCircle size={12} />
          Kam qoldi
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        Normal
      </span>
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/40 glass-card">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5 text-xs font-bold uppercase tracking-wider text-gray-400">
            <th className="py-3 px-5">SKU</th>
            <th className="py-3 px-5">Mahsulot nomi</th>
            <th className="py-3 px-5">Kategoriya</th>
            <th className="py-3 px-5 text-right">Ombordagi miqdor</th>
            <th className="py-3 px-5 text-center">Holat</th>
            <th className="py-3 px-5 text-right">Narxi ($)</th>
            {(onEdit || onDelete) && <th className="py-3 px-5 text-center">Amallar</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="py-4 px-5"><div className="h-4 bg-white/5 rounded w-16" /></td>
                <td className="py-4 px-5"><div className="h-4 bg-white/5 rounded w-40" /></td>
                <td className="py-4 px-5"><div className="h-4 bg-white/5 rounded w-20" /></td>
                <td className="py-4 px-5 text-right"><div className="h-4 bg-white/5 rounded w-10 ml-auto" /></td>
                <td className="py-4 px-5 text-center"><div className="h-6 bg-white/5 rounded w-20 mx-auto" /></td>
                <td className="py-4 px-5 text-right"><div className="h-4 bg-white/5 rounded w-12 ml-auto" /></td>
                {(onEdit || onDelete) && <td className="py-4 px-5"><div className="h-8 bg-white/5 rounded w-16 mx-auto" /></td>}
              </tr>
            ))
          ) : !products || products.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 px-5 text-center text-gray-400">
                Mahsulotlar topilmadi.
              </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr 
                key={product.id}
                className="transition-colors duration-150 hover:bg-white/5"
              >
                <td className="py-3.5 px-5 font-mono font-semibold text-gold-400">
                  {product.sku}
                </td>
                <td className="py-3.5 px-5 font-semibold text-white truncate max-w-[200px]">
                  {product.name}
                </td>
                <td className="py-3.5 px-5 text-gray-400">
                  {CATEGORY_UZ[product.category] || product.category}
                </td>
                <td className={`py-3.5 px-5 text-right font-mono font-bold ${
                  product.stock_quantity <= product.min_stock_level ? 'text-amber-400' : 'text-gray-300'
                }`}>
                  {product.stock_quantity.toLocaleString()}
                </td>
                <td className="py-3.5 px-5 text-center">
                  {getStockStatus(product.stock_quantity, product.min_stock_level)}
                </td>
                <td className="py-3.5 px-5 text-right font-mono font-bold text-white">
                  ${product.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                {(onEdit || onDelete) && (
                  <td className="py-3.5 px-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {onEdit && (
                        <button 
                          onClick={() => onEdit(product)}
                          className="p-1 rounded bg-white/5 hover:bg-gold-500/20 text-gray-400 hover:text-gold-400 border border-white/5 transition-colors"
                          title="Tahrirlash"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={() => {
                            if (window.confirm(`"${product.name}" mahsulotini o'chirishni tasdiqlaysizmi?`)) {
                              onDelete(product.id);
                            }
                          }}
                          className="p-1 rounded bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/5 transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;
