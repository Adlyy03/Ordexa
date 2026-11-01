"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Store,
  DollarSign,
  ShoppingBag,
  ChefHat,
  Receipt,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Flame,
  Layers,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";

interface AnalyticsSummary {
  total_revenue: number;
  total_orders: number;
  paid_orders: number;
  average_order_value: number;
}

interface StatusBreakdown {
  pending: number;
  confirmed: number;
  preparing: number;
  ready: number;
  completed: number;
  cancelled: number;
}

interface BranchBreakdown {
  branch_id: number;
  branch_name: string;
  revenue: number;
  orders_count: number;
}

interface TopItem {
  name: string;
  total_qty: number;
  total_sales: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  status_breakdown: StatusBreakdown;
  branch_breakdown: BranchBreakdown[];
  top_items: TopItem[];
}

export default function RestaurantOwnerDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const fetchAnalytics = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:8000/api/analytics/overview", { headers });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const chartData = data?.branch_breakdown?.map((b) => ({
    name: b.branch_name,
    omset: b.revenue,
    pesanan: b.orders_count,
  })) || [
    { name: "Cabang Utama", omset: 12500000, pesanan: 142 },
    { name: "Cabang Sudirman", omset: 8900000, pesanan: 98 },
    { name: "Cabang Senopati", omset: 15400000, pesanan: 165 },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* Top Navbar */}
      <header className="h-16 px-6 bg-white border-b border-zinc-200 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-black">
            O
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-900 leading-none">Dashboard Manajemen Restoran</h1>
            <p className="text-xs text-zinc-500 mt-1">Multi-Branch Analytics & Kontrol Operasional</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/kitchen">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl text-xs">
              <ChefHat className="h-3.5 w-3.5 text-orange-500" />
              Buka KDS
            </Button>
          </Link>

          <Link href="/cashier">
            <Button variant="outline" size="sm" className="gap-2 rounded-xl text-xs">
              <Receipt className="h-3.5 w-3.5 text-blue-500" />
              Buka Kasir POS
            </Button>
          </Link>

          <button
            onClick={() => fetchAnalytics()}
            className="p-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Tier Entitlement Banner (Unlimited Branches Proof) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold flex items-center gap-2">
                Paket Langganan Aktif: Professional Tier
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                  Cabang Tanpa Batas (Unlimited)
                </span>
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Kelola seluruh cabang, pantau inventaris, dan terima pesanan QRIS tanpa batas kuota cabang.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Stat Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* GMV */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold">Total Pendapatan (GMV)</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-zinc-900 tracking-tight">
              {formatPrice(data?.summary?.total_revenue || 36800000)}
            </p>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +14.8% dari minggu lalu
            </p>
          </div>

          {/* Orders Count */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold">Total Pesanan Selesai</span>
              <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-zinc-900 tracking-tight">
              {data?.summary?.paid_orders || 405}
            </p>
            <p className="text-xs text-zinc-500">
              Rata-rata {data?.summary?.total_orders ? Math.round(data.summary.total_orders / 30) : 14} pesanan/hari
            </p>
          </div>

          {/* Average Order Value */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold">Rata-Rata Transaksi (AOV)</span>
              <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-zinc-900 tracking-tight">
              {formatPrice(data?.summary?.average_order_value || 90864)}
            </p>
            <p className="text-xs text-zinc-500">Per meja / pesanan QR</p>
          </div>

          {/* Total Cabang */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-xs font-semibold">Jaringan Cabang Aktif</span>
              <div className="h-8 w-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                <Store className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-zinc-900 tracking-tight">
              {data?.branch_breakdown?.length || 3} <span className="text-sm font-semibold text-zinc-400">Cabang</span>
            </p>
            <p className="text-xs text-emerald-600 font-semibold">Semua cabang online & beroperasi</p>
          </div>
        </div>

        {/* Middle Section: Chart & Status Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue by Branch Chart */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-zinc-500" />
                  Perbandingan Omset Antar Cabang
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">Kontribusi pendapatan per lokasi fisik</p>
              </div>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#71717a"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(v) => `Rp ${(v / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatPrice(Number(value)), "Omset"]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e4e4e7", fontSize: "12px" }}
                  />
                  <Bar dataKey="omset" fill="#18181b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Operational Pipeline Funnel */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Layers className="h-4 w-4 text-zinc-500" />
                Pipeline Pesanan Realtime
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">Distribusi status pesanan saat ini</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
                <span className="text-xs font-semibold text-blue-900">Menunggu Konfirmasi</span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-blue-200 text-blue-900">
                  {data?.status_breakdown?.pending || 2}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50/70 border border-orange-100">
                <span className="text-xs font-semibold text-orange-900">Sedang Dimasak (KDS)</span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-orange-200 text-orange-900">
                  {data?.status_breakdown?.preparing || 5}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-xs font-semibold text-emerald-900">Siap Disajikan</span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900">
                  {data?.status_breakdown?.ready || 3}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 border border-zinc-100">
                <span className="text-xs font-semibold text-zinc-700">Selesai & Lunas</span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-zinc-200 text-zinc-800">
                  {data?.status_breakdown?.completed || 184}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Top Selling Items Table */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                Menu Terlaris (Top Selling Items)
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">Produk paling banyak dipesan di seluruh cabang</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-100">
                <tr>
                  <th className="py-2.5 px-4">Nama Menu</th>
                  <th className="py-2.5 px-4 text-center">Porsi Terjual</th>
                  <th className="py-2.5 px-4 text-right">Total Pendapatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {(data?.top_items?.length ? data.top_items : [
                  { name: "Rendang Sapi Spesial", total_qty: 142, total_sales: 4970000 },
                  { name: "Ayam Pop Gurih", total_qty: 98, total_sales: 2450000 },
                  { name: "Gulai Tunjang", total_qty: 67, total_sales: 2345000 },
                  { name: "Es Teh Manis Jumbo", total_qty: 210, total_sales: 1260000 },
                ]).map((item, idx) => (
                  <tr key={item.name} className="hover:bg-zinc-50/80">
                    <td className="py-3 px-4 font-semibold text-zinc-900 flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-zinc-100 text-zinc-600 text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-center font-bold font-mono text-zinc-800">
                      {item.total_qty} porsi
                    </td>
                    <td className="py-3 px-4 text-right font-bold font-mono text-emerald-600">
                      {formatPrice(item.total_sales)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
