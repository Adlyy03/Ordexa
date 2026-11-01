"use client";

import { useEffect, useState } from "react";
import { Receipt, Filter, Download, ArrowDownLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { partnerService, PartnerCommissionsResponse } from "@/services/partner";

export default function PartnerCommissionsPage() {
  const [data, setData] = useState<PartnerCommissionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const loadCommissions = async () => {
    try {
      setLoading(true);
      const res = await partnerService.getCommissions(statusFilter === "all" ? undefined : statusFilter);
      setData(res);
    } catch (err: any) {
      console.error("Failed to load commissions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommissions();
  }, [statusFilter]);

  const summary = data?.summary;
  const list = data?.data || [];

  return (
    <PartnerLayout
      title="Riwayat Komisi"
      subtitle="Daftar seluruh komisi yang dihasilkan dari pembayaran paket langganan restoran mitra."
    >
      {/* Commission Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Komisi Diterima</span>
          <p className="text-2xl font-black text-zinc-900 mt-2">{formatPrice(summary?.total_earned ?? 0)}</p>
          <span className="text-xs text-zinc-400 mt-1 block">Akumulasi komisi berstatus Tersedia dan Telah Ditarik</span>
        </div>

        <div className="bg-white border-2 border-zinc-900 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Saldo Komisi Siap Ditarik</span>
          <p className="text-2xl font-black text-emerald-700 mt-2">{formatPrice(summary?.available_balance ?? 0)}</p>
          <span className="text-xs text-zinc-500 mt-1 block">Dapat ditarik ke rekening bank terdaftar Anda</span>
        </div>
      </div>

      {/* Filter Tabs & Transactions Table */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Catatan Transaksi Komisi</h3>
            <p className="text-xs text-zinc-500">Transparansi perhitungan komisi per transaksi langganan</p>
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {["all", "available", "paid", "reversed"].map((st) => (
              <Button
                key={st}
                size="sm"
                variant={statusFilter === st ? "default" : "outline"}
                onClick={() => setStatusFilter(st)}
                className="text-xs capitalize h-8"
              >
                {st === "all" ? "Semua Status" : st === "available" ? "Tersedia" : st === "paid" ? "Sudah Ditarik" : "Direverse"}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-zinc-400">Memuat transaksi komisi...</div>
        ) : list.length === 0 ? (
          <div className="py-16 text-center">
            <Receipt className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-700">Tidak ada transaksi komisi ditemukan</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Komisi otomatis tercatat saat restoran referral membayar paket langganan bulanan atau tahunan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Sumber Restoran</th>
                  <th className="py-3 px-4">Tipe Komisi</th>
                  <th className="py-3 px-4">Nominal Komisi</th>
                  <th className="py-3 px-4 text-right">Status Komisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {list.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-zinc-500">
                      {new Date(item.created_at).toLocaleDateString("id-ID", {
                        dateStyle: "medium",
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-zinc-900">
                      {item.restaurant_name}
                      {item.note && <span className="block text-[11px] font-normal text-zinc-400">{item.note}</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="capitalize font-medium text-zinc-700">
                        {item.commission_type}
                      </span>
                      {item.commission_rate && (
                        <span className="text-[11px] text-zinc-400 ml-1">({item.commission_rate}%)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-zinc-900 text-sm">
                      {formatPrice(item.commission_amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.status === "available"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.status === "paid"
                            ? "bg-zinc-100 text-zinc-700 border border-zinc-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {item.status === "available"
                          ? "Siap Ditarik"
                          : item.status === "paid"
                          ? "Sudah Ditarik"
                          : item.status === "reversed"
                          ? "Dibatalkan"
                          : item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PartnerLayout>
  );
}
