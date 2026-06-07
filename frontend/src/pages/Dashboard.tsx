import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ClipboardList, Boxes } from 'lucide-react';
import KPICards from '../components/KPICards';
import SalesChart from '../components/SalesChart';
import InventoryChart from '../components/InventoryChart';
import OrdersTable from '../components/OrdersTable';
import { useDashboardStats, useSalesChart, useInventoryDistribution, useOrders } from '../hooks/useApi';
import { Order } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // Queries
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: salesChart, isLoading: salesLoading } = useSalesChart(30);
  const { data: invChart, isLoading: invLoading } = useInventoryDistribution();
  const { data: ordersData, isLoading: ordersLoading } = useOrders({ page: 1, limit: 5 });

  const handleOrderClick = (order: Order) => {
    navigate(`/orders?id=${order.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Ulgurji ko&apos;rinish</h1>
          <p className="text-xs text-gray-400 mt-0.5">Ombor, mijozlar va buyurtmalar holati real vaqtda</p>
        </div>
        <div className="flex gap-3 text-xs">
          <Link 
            to="/inventory"
            className="flex items-center gap-1.5 py-2 px-3 rounded-lg border border-white/10 hover:border-gold-500/30 hover:bg-white/5 font-semibold text-gray-300 transition-colors"
          >
            <Boxes size={14} className="text-gold-400" />
            <span>Omborni boshqarish</span>
          </Link>
          <Link 
            to="/orders"
            className="flex items-center gap-1.5 py-2 px-3 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 font-bold text-black shadow-gold transition-all"
          >
            <ClipboardList size={14} />
            <span>Buyurtmalarni ko&apos;rish</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <KPICards stats={stats} isLoading={statsLoading} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart data={salesChart} isLoading={salesLoading} />
        </div>
        <div>
          <InventoryChart data={invChart} isLoading={invLoading} />
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white">So&apos;nggi buyurtmalar</h2>
            <p className="text-xs text-gray-400 mt-0.5">Eng yangi B2B buyurtmalar</p>
          </div>
          <Link 
            to="/orders"
            className="flex items-center gap-1 text-xs font-semibold text-gold-400 hover:text-gold-300 transition-colors"
          >
            <span>Barcha buyurtmalar</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {!ordersLoading && (!ordersData?.items || ordersData.items.length === 0) ? (
          <div className="text-center py-10 border border-white/5 rounded-xl bg-black/30 text-gray-400 text-sm">
            <p>So&apos;nggi buyurtmalar yo&apos;q.</p>
            <Link to="/orders" className="inline-block mt-3 text-gold-400 font-semibold hover:text-gold-300">
              Yangi buyurtma yaratish →
            </Link>
          </div>
        ) : (
          <OrdersTable
            orders={ordersData?.items}
            isLoading={ordersLoading}
            onRowClick={handleOrderClick}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
