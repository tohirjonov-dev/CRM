import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { InventoryDistributionPoint } from '../types';
import { CATEGORY_UZ } from '../lib/uz';

interface InventoryChartProps {
  data: InventoryDistributionPoint[] | undefined;
  isLoading: boolean;
}

const COLORS = ['#D4AF37', '#EFEFEF', '#888888', '#444444'];

const InventoryChart: React.FC<InventoryChartProps> = ({ data, isLoading }) => {
  const totalItems = data?.reduce((acc, curr) => acc + curr.count, 0) || 0;
  const hasData = data && data.length > 0 && totalItems > 0;

  // Custom tooltips matching the premium dark theme
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      const pct = totalItems > 0 ? ((value / totalItems) * 100).toFixed(1) : 0;
      return (
        <div className="rounded-xl border border-white/10 bg-[#121212] p-3 shadow-gold text-xs">
          <p className="font-semibold text-white mb-1 capitalize">{name}</p>
          <p className="text-gold-400 font-medium">
            Miqdor: <span className="font-bold text-white">{value.toLocaleString()} dona</span>
          </p>
          <p className="text-gray-400 mt-0.5">
            Ulushi: <span className="font-bold text-white">{pct}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-white/5 bg-black/40 p-5 glass-card flex flex-col h-full">
      <div>
        <h3 className="text-base font-semibold text-white">Ombor taqsimoti</h3>
        <p className="text-xs text-gray-400 mt-0.5">Kategoriya bo&apos;yicha zaxira</p>
      </div>

      <div className="relative flex-1 min-h-[200px] mt-4 flex items-center justify-center">
        {isLoading ? (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500" />
        ) : !hasData ? (
          <p className="text-sm text-gray-500 text-center px-4">
            Omborda mahsulot yo&apos;q. Ombor bo&apos;limida mahsulot qo&apos;shing.
          </p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="category"
                >
                  {data?.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(10,10,10,0.8)" strokeWidth={2} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Total Label in Center */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-xs text-gray-400 font-medium tracking-wide">Jami zaxira</span>
              <span className="text-xl font-bold text-white tracking-tight mt-0.5">
                {totalItems.toLocaleString()}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Legend Row */}
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        {data?.map((entry, index) => {
          const pct = totalItems > 0 ? ((entry.count / totalItems) * 100).toFixed(0) : 0;
          return (
            <div key={entry.category} className="flex items-center gap-2">
              <span 
                className="w-2.5 h-2.5 rounded"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-white truncate font-medium">{CATEGORY_UZ[entry.category] || entry.category}</p>
                <p className="text-[10px] text-gray-400 truncate">{entry.count.toLocaleString()} dona ({pct}%)</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryChart;
