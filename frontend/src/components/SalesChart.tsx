import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { SalesChartPoint } from '../types';

interface SalesChartProps {
  data: SalesChartPoint[] | undefined;
  isLoading: boolean;
}

const SalesChart: React.FC<SalesChartProps> = ({ data, isLoading }) => {
  const hasData = data && data.some((p) => p.sales > 0 || p.orders > 0);
  const formatDateLabel = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    } catch {
      return dateStr;
    }
  };

  const formatSalesVal = (val: number) => {
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val}`;
  };

  // Custom tooltips matching the premium dark theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-xl border border-white/10 bg-[#121212] p-4 shadow-gold text-xs">
          <p className="font-semibold text-white mb-2">{formatDateLabel(label)}</p>
          <p className="text-gold-400 font-medium">
            Revenue: <span className="font-bold text-white">${payload[0].value.toLocaleString()}</span>
          </p>
          <p className="text-gray-400 mt-1 font-medium">
            Orders count: <span className="font-bold text-white">{payload[1].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-white/5 bg-black/40 p-5 glass-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-white">Daromad va buyurtmalar</h3>
          <p className="text-xs text-gray-400 mt-0.5">So&apos;nggi 30 kun — faqat haqiqiy buyurtmalar</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-gold-400">
            <span className="w-3 h-3 rounded bg-gold-500" />
            Daromad ($)
          </span>
          <span className="flex items-center gap-1.5 text-gray-400">
            <span className="w-3 h-3 rounded bg-white/30" />
            Buyurtmalar
          </span>
        </div>
      </div>

      <div className="h-80 w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-full w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500" />
          </div>
        ) : !hasData ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-500 text-center px-4">
            Hali buyurtma yo&apos;q. Birinchi buyurtmani yaratgandan keyin grafik shakllanadi.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDateLabel} 
                stroke="rgba(255, 255, 255, 0.4)" 
                tick={{ fontSize: 10 }}
                dy={10}
                tickLine={false}
              />
              <YAxis 
                yAxisId="left"
                tickFormatter={formatSalesVal}
                stroke="rgba(255, 255, 255, 0.4)" 
                tick={{ fontSize: 10 }}
                tickLine={false}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="rgba(255, 255, 255, 0.2)"
                tick={{ fontSize: 10 }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="sales" 
                stroke="#D4AF37" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorSales)" 
              />
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="orders" 
                stroke="rgba(255, 255, 255, 0.4)" 
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorOrders)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default SalesChart;
