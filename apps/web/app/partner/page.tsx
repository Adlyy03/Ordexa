"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users2,
  CheckCircle2,
  Wallet,
  ArrowUpRight,
  Receipt,
  Copy,
  Clock,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { partnerService, PartnerDashboardStats, PartnerMeResponse } from "@/services/partner";

export default function PartnerDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<PartnerDashboardStats | null>(null);
  const [partnerStatus, setPartnerStatus] = useState<PartnerMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const me = await partnerService.getMe();
      setPartnerStatus(me);

      if (!me.is_partner || !me.partner) {
        router.push("/partner/register");
        return;
      }

      if (me.partner.status !== "approved") {
        router.push("/partner/register");
        return;
      }

      const res = await partnerService.getDashboard();
      setData(res);
    } catch (err: any) {
      console.error("Failed to load partner dashboard", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyLink = () => {
    if (!partnerStatus?.partner?.referral_code) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const link = `${origin}/register?ref=${partnerStatus.partner.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <PartnerLayout title="Dashboard Mitra" subtitle="Memuat performa kemitraan Anda...">
        <div className="py-24 text-center text-zinc-500 text-sm">Memuat data dashboard mitra...</div>
      </PartnerLayout>
    );
  }

  const stats = data?.stats;

  return (
    <PartnerLayout
      title="Dashboard Mitra"
      subtitle="Pantau performa rujukan, konversi langganan, dan saldo komisi Anda secara transparan."
      action={
        <div className="flex items-center gap-2 bg-white border border-zinc-200 px-3 py-1.5 rounded-lg shadow-xs">
          <span className="text-xs text-zinc-500 font-medium">Kode Anda:</span>
          <span className="text-xs font-mono font-bold text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded">
            {partnerStatus?.partner?.referral_code}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyLink}
            className="h-7 text-xs ml-1"
          >
            <Copy className="w-3 h-3 mr-1" />
            {copied ? "Tersalin!" : "Salin Link"}
          </Button>
        </div>
      }
    >
      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Referrals */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Restoran</span>
            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-700">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-zinc-900">{stats?.total_referrals ?? 0}</span>
            <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-zinc-800">{stats?.converted_referrals ?? 0}</span> konversi langganan
            </div>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Langganan Aktif</span>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-emerald-700">{stats?.active_subscriptions ?? 0}</span>
            <div className="text-xs text-zinc-500 mt-1">Menghasilkan komisi berulang</div>
          </div>
        </div>

        {/* Total Earned Commissions */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Komisi Didapat</span>
            <div className="p-2 bg-zinc-100 rounded-lg text-zinc-700">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-zinc-900">{formatPrice(stats?.total_earned ?? 0)}</span>
            <div className="text-xs text-zinc-500 mt-1">Sepanjang waktu</div>
          </div>
        </div>

        {/* Available Balance */}
        <div className="bg-white border-2 border-zinc-900 rounded-xl p-5 shadow-sm bg-gradient-to-br from-white to-zinc-50">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Saldo Siap Ditarik</span>
            <div className="p-2 bg-zinc-900 rounded-lg text-white">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-zinc-900">{formatPrice(stats?.available_balance ?? 0)}</span>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">
                Pending: {formatPrice(stats?.pending_withdrawal ?? 0)}
              </span>
              <Link href="/partner/withdrawals">
                <Button size="sm" className="h-7 text-xs bg-zinc-900 hover:bg-zinc-800 text-white font-semibold">
                  Tarik Dana
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Referrals & Recent Commissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Referrals Activity */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-base font-bold text-zinc-900">Aktivitas Referral Terbaru</h2>
              <p className="text-xs text-zinc-500">Restoran yang mendaftar via link Anda</p>
            </div>
            <Link href="/partner/referrals">
              <Button variant="ghost" size="sm" className="text-xs text-zinc-600">
                Lihat Semua <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {!data?.recent_referrals || data.recent_referrals.length === 0 ? (
            <div className="py-12 text-center">
              <Users2 className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-zinc-700">Belum ada aktivitas referral</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                Bagikan kode referral Anda ke pemilik restoran untuk mulai menghasilkan komisi.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {data.recent_referrals.map((ref) => (
                <div key={ref.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{ref.restaurant_name}</p>
                    <p className="text-xs text-zinc-400">
                      Mendaftar: {new Date(ref.registered_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                      ref.status === "converted"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {ref.status === "converted" ? "Langganan Aktif" : "Menunggu Langganan"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Commission Transactions */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-base font-bold text-zinc-900">Riwayat Komisi Terbaru</h2>
              <p className="text-xs text-zinc-500">Pemberian komisi dari transaksi langganan</p>
            </div>
            <Link href="/partner/commissions">
              <Button variant="ghost" size="sm" className="text-xs text-zinc-600">
                Lihat Semua <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {!data?.recent_commissions || data.recent_commissions.length === 0 ? (
            <div className="py-12 text-center">
              <Receipt className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-zinc-700">Belum ada catatan komisi</p>
              <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                Komisi akan otomatis tercatat setelah restoran referral melakukan pembayaran langganan.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {data.recent_commissions.map((comm) => (
                <div key={comm.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{formatPrice(comm.commission_amount)}</p>
                    <p className="text-xs text-zinc-500">
                      Dari: {comm.restaurant_name} &bull;{" "}
                      <span className="capitalize">{comm.commission_type}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        comm.status === "available"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : comm.status === "paid"
                          ? "bg-zinc-100 text-zinc-700 border border-zinc-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {comm.status === "available" ? "Tersedia" : comm.status === "paid" ? "Sudah Ditarik" : comm.status}
                    </span>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {new Date(comm.created_at).toLocaleDateString("id-ID", { dateStyle: "short" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PartnerLayout>
  );
}
