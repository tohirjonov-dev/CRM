import React from 'react';
import { DollarSign, ClipboardList, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { DashboardStats } from '../types';

interface KPICardsProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

const KPICards: React.FC<KPICardsProps> = ({ stats, isLoading }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const kpis = [
    {
      title: 'Umumiy daromad',
      value: stats ? formatCurrency(stats.total_revenue) : '$0',
      change: stats ? `${stats.revenue_trend >= 0 ? '+' : ''}${stats.revenue_trend}%` : '0%',
      changeType: 'up',
      icon: DollarSign,
      color: 'text-gold-400 bg-gold-400/10 border-gold-400/20',
      description: 'Bekor qilinmagan savdo'
    },
    {
      title: 'Kutilayotgan buyurtmalar',
      value: stats ? stats.pending_orders.toString() : '0',
      change: 'Faol holat',
      changeType: 'neutral',
      icon: ClipboardList,
      color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      description: 'Yetkazib berish kutilmoqda'
    },
    {
      title: 'Kam zaxira signallari',
      value: stats ? stats.low_stock_alerts.toString() : '0',
      change: stats && stats.low_stock_alerts > 0 ? 'Chora kerak' : 'Normal',
      changeType: stats && stats.low_stock_alerts > 0 ? 'down' : 'neutral',
      icon: AlertTriangle,
      color: stats && stats.low_stock_alerts > 0 
        ? 'text-red-400 bg-red-400/10 border-red-400/20 animate-pulse-glow' 
        : 'text-green-400 bg-green-400/10 border-green-400/20',
      description: 'Minimal darajadan past mahsulotlar'
    },
    {
      title: 'Faol B2B mijozlar',
      value: stats ? stats.active_clients.toString() : '0',
      change: 'B2B hisoblar',
      changeType: 'neutral',
      icon: Users,
      color: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
      description: 'Ma\'lumotlar bazasidagi xaridorlar'
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-xl border border-white/5 bg-black/40 p-5 glass-card transition-all duration-300 hover:-translate-y-1 hover:border-gold-500/30"
          >
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-white/5 rounded w-1/2" />
                <div className="h-8 bg-white/5 rounded w-3/4" />
                <div className="h-4 bg-white/5 rounded w-2/3" />
              </div>
            ) : (
              <>
                {/* Header Row */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {kpi.title}
                  </span>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg border ${kpi.color}`}>
                    <Icon size={16} />
                  </div>
                </div>

                {/* Main Values */}
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight text-white transition-all group-hover:text-gold-400">
                    {kpi.value}
                  </span>
                  {kpi.changeType === 'up' && (
                    <span className="flex items-center gap-0.5 text-xs font-semibold text-gold-400">
                      <TrendingUp size={12} />
                      {kpi.change}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                  <span>{kpi.description}</span>
                  {kpi.changeType === 'down' && (
                    <span className="font-semibold text-red-400">
                      {kpi.change}
                    </span>
                  )}
                  {kpi.changeType === 'neutral' && (
                    <span className="text-gray-500 font-medium">
                      {kpi.change}
                    </span>
                  )}
                </div>

                {/* Gold accent border line that lights up on hover */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;
