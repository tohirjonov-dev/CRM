import React from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  useSalesChart,
  useInventoryDistribution,
  useTopClients,
  useTopProducts,
} from '../hooks/useApi';
import { CATEGORY_UZ } from '../lib/uz';

const formatMoney = (v: number) =>
  `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const Analytics: React.FC = () => {
  const { data: salesChart, isLoading: salesLoading } = useSalesChart(30);
  const { data: invChart, isLoading: invLoading } = useInventoryDistribution();
  const { data: topClients, isLoading: clientsLoading } = useTopClients(5);
  const { data: topProducts, isLoading: productsLoading } = useTopProducts(5);

  const hasSales = salesChart?.some((p) => p.sales > 0 || p.orders > 0);
  const hasInventory = invChart && invChart.length > 0;
  const hasTopClients = topClients && topClients.length > 0;
  const hasTopProducts = topProducts && topProducts.length > 0;

  const ChartLoader = () => (
    <div className="flex items-center justify-center h-full min-h-[220px]">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold-500" />
    </div>
  );

  const EmptyHint = ({ text, linkTo, linkLabel }: { text: string; linkTo?: string; linkLabel?: string }) => (
    <div className="flex flex-col items-center justify-center h-full min-h-[220px] text-center px-4">
      <p className="text-sm text-gray-400">{text}</p>
      {linkTo && linkLabel && (
        <Link to={linkTo} className="mt-3 text-xs font-semibold text-gold-400 hover:text-gold-300">
          {linkLabel} →
        </Link>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Tahlil va hisobotlar</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Barcha ko&apos;rsatkichlar ma&apos;lumotlar bazasidagi haqiqiy buyurtma va ombor yozuvlaridan olinadi
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/5 bg-black/40 p-5 glass-card">
          <h3 className="text-base font-semibold text-white mb-1">Kunlik savdo (30 kun)</h3>
          <p className="text-xs text-gray-500 mb-4">Bekor qilinmagan buyurtmalar summasi</p>
          <div className="h-72 w-full">
            {salesLoading ? (
              <ChartLoader />
            ) : !hasSales ? (
              <EmptyHint
                text="Hali buyurtma yo'q — savdo grafigi bo'sh."
                linkTo="/orders"
                linkLabel="Buyurtma yaratish"
              />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={salesChart} margin={{ left: -10, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => d.slice(5)}
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fontSize: 9 }}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.4)"
                    tickFormatter={(v) => `$${v / 1000}k`}
                    tick={{ fontSize: 9 }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === 'sales' ? formatMoney(value) : value,
                      name === 'sales' ? 'Savdo' : 'Buyurtmalar',
                    ]}
                    labelFormatter={(l) => `Sana: ${l}`}
                    contentStyle={{
                      background: '#121212',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Line type="monotone" dataKey="sales" name="sales" stroke="#D4AF37" strokeWidth={2.5} dot={false} />
                </RechartsLineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-black/40 p-5 glass-card">
          <h3 className="text-base font-semibold text-white mb-1">Eng yaxshi mijozlar</h3>
          <p className="text-xs text-gray-500 mb-4">Jami xarid summasi bo&apos;yicha</p>
          <div className="h-72 w-full">
            {clientsLoading ? (
              <ChartLoader />
            ) : !hasTopClients ? (
              <EmptyHint text="Mijoz buyurtmalari hali yo'q." linkTo="/clients" linkLabel="Mijoz qo'shish" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topClients} margin={{ left: -10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fontSize: 8 }}
                    angle={-20}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis stroke="rgba(255,255,255,0.4)" tickFormatter={(v) => `$${v / 1000}k`} tick={{ fontSize: 9 }} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === 'revenue' ? formatMoney(value) : value,
                      name === 'revenue' ? 'Daromad' : 'Buyurtmalar',
                    ]}
                    contentStyle={{
                      background: '#121212',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="revenue" name="revenue" fill="#D4AF37" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-black/40 p-5 glass-card">
          <h3 className="text-base font-semibold text-white mb-1">Eng ko&apos;p sotilgan mahsulotlar</h3>
          <p className="text-xs text-gray-500 mb-4">Daromad bo&apos;yicha</p>
          <div className="h-72 w-full">
            {productsLoading ? (
              <ChartLoader />
            ) : !hasTopProducts ? (
              <EmptyHint text="Sotuv ma'lumoti yo'q." linkTo="/inventory" linkLabel="Mahsulot qo'shish" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" horizontal={false} />
                  <XAxis type="number" stroke="rgba(255,255,255,0.4)" tickFormatter={(v) => `$${v / 1000}k`} tick={{ fontSize: 9 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={110}
                    stroke="rgba(255,255,255,0.4)"
                    tick={{ fontSize: 9 }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === 'revenue' ? formatMoney(value) : value,
                      name === 'revenue' ? 'Daromad' : 'Sotilgan dona',
                    ]}
                    contentStyle={{
                      background: '#121212',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="revenue" name="revenue" fill="#EFEFEF" radius={[0, 4, 4, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-white/5 bg-black/40 p-5 glass-card">
          <h3 className="text-base font-semibold text-white mb-1">Ombor — kategoriya bo&apos;yicha</h3>
          <p className="text-xs text-gray-500 mb-4">Joriy zaxira miqdori</p>
          <div className="h-72 w-full overflow-y-auto">
            {invLoading ? (
              <ChartLoader />
            ) : !hasInventory ? (
              <EmptyHint text="Omborda mahsulot yo'q." linkTo="/inventory" linkLabel="Mahsulot qo'shish" />
            ) : (
              <div className="space-y-4 py-2">
                {invChart?.map((cat) => {
                  const total = invChart.reduce((a, b) => a + b.count, 0) || 1;
                  return (
                    <div key={cat.category} className="p-3 border border-white/5 rounded-lg bg-black/20 text-xs">
                      <div className="flex items-center justify-between text-gray-400 font-semibold mb-1.5">
                        <span>{CATEGORY_UZ[cat.category] || cat.category}</span>
                        <span className="text-white font-bold">{cat.count.toLocaleString()} dona</span>
                      </div>
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gold-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, (cat.count / total) * 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
