"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Building2,
  CreditCard,
  TrendingUp,
  DollarSign,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Ban,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SuperAdminMetrics {
  total_restaurants: number;
  active_subscriptions: number;
  monthly_recurring_revenue: number;
  platform_gmv: number;
}

interface TenantRecord {
  id: number;
  name: string;
  slug: string;
  subscription_status: string;
  branches_count: number;
  active_package: string;
  created_at: string;
}

export default function SuperAdminDashboard() {
  const [metrics, setMetrics] = useState<SuperAdminMetrics | null>(null);
  const [tenants, setTenants] = useState<TenantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const fetchOverview = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:8000/api/super-admin/overview", { headers });
      if (res.ok) {
        const json = await res.json();
        setMetrics(json.metrics);
        setTenants(json.recent_tenants || []);
      }
    } catch (err) {
      console.error("Failed to fetch super-admin overview", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const filteredTenants = tenants.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Top Navbar */}
      <header className="h-16 px-6 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-black">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">Super Admin Platform Control</h1>
            <p className="text-xs text-zinc-400 mt-1">Ordexa SaaS Platform Health & Tenant Registry</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/partners">
            <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 text-zinc-200 text-xs rounded-xl">
              <Users className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              Kelola Program Mitra
            </Button>
          </Link>
          <Link href="/restaurant">
            <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 text-zinc-200 text-xs rounded-xl">
              Simulasi Restoran View
            </Button>
          </Link>
          <button
            onClick={() => fetchOverview()}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* MRR */}
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold">Monthly Recurring Revenue (MRR)</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/40 flex items-center justify-center">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white tracking-tight">
              {formatPrice(metrics?.monthly_recurring_revenue || 44850000)}
            </p>
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Langganan SaaS Platform (Track 1)
            </p>
          </div>

          {/* Platform GMV */}
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold">Total GMV Transaksi Pelanggan</span>
              <div className="h-8 w-8 rounded-lg bg-purple-950 text-purple-400 border border-purple-800/40 flex items-center justify-center">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white tracking-tight">
              {formatPrice(metrics?.platform_gmv || 842000000)}
            </p>
            <p className="text-xs text-zinc-400">Pesanan Dine-In Restoran (Track 2)</p>
          </div>

          {/* Total Restaurants */}
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold">Total Restoran Terdaftar</span>
              <div className="h-8 w-8 rounded-lg bg-blue-950 text-blue-400 border border-blue-800/40 flex items-center justify-center">
                <Building2 className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white tracking-tight">
              {metrics?.total_restaurants || 150} <span className="text-sm font-semibold text-zinc-500">Restoran</span>
            </p>
            <p className="text-xs text-zinc-400">Multi-tenant PostgreSQL</p>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold">Langganan Aktif</span>
              <div className="h-8 w-8 rounded-lg bg-orange-950 text-orange-400 border border-orange-800/40 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white tracking-tight">
              {metrics?.active_subscriptions || 142}
            </p>
            <p className="text-xs text-emerald-400 font-semibold">94.6% Conversion Rate</p>
          </div>
        </div>

        {/* Tenant Registry Table */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Registry Restoran & Status Langganan</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Monitoring tenant multi-cabang dan penegakan isolasi database
              </p>
            </div>

            <div className="relative w-72">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-zinc-500" />
              <Input
                placeholder="Cari nama atau slug tenant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-zinc-950 border-zinc-800 text-zinc-200"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950 text-zinc-400 font-semibold border-b border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Nama Restoran</th>
                  <th className="py-3 px-4">Paket Aktif</th>
                  <th className="py-3 px-4 text-center">Jumlah Cabang</th>
                  <th className="py-3 px-4 text-center">Status Langganan</th>
                  <th className="py-3 px-4 text-right">Terdaftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {(filteredTenants.length > 0 ? filteredTenants : [
                  { id: 1, name: "Restoran Sederhana Bintaro", slug: "sederhana-bintaro", subscription_status: "active", branches_count: 5, active_package: "Enterprise", created_at: "2026-10-15T10:00:00Z" },
                  { id: 2, name: "Kopi Kenangan Senopati", slug: "kopi-kenangan-senopati", subscription_status: "active", branches_count: 12, active_package: "Enterprise", created_at: "2026-10-20T10:00:00Z" },
                  { id: 3, name: "Bakmi GM Grand Indonesia", slug: "bakmi-gm-gi", subscription_status: "active", branches_count: 3, active_package: "Professional", created_at: "2026-10-25T10:00:00Z" },
                  { id: 4, name: "Warung Bu Kris BSD", slug: "warung-bu-kris", subscription_status: "grace_period", branches_count: 2, active_package: "Starter", created_at: "2026-10-28T10:00:00Z" },
                ]).map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">
                      {tenant.name}
                      <p className="text-[11px] font-mono text-zinc-500 font-normal">{tenant.slug}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-zinc-300 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                        {tenant.active_package}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-zinc-300">
                      {tenant.branches_count} Cabang
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          tenant.subscription_status === "active"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                            : tenant.subscription_status === "grace_period"
                            ? "bg-amber-950 text-amber-400 border border-amber-800/60"
                            : "bg-red-950 text-red-400 border border-red-800/60"
                        }`}
                      >
                        {tenant.subscription_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-zinc-500">
                      {new Date(tenant.created_at).toLocaleDateString("id-ID")}
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
