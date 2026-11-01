"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Receipt,
  RotateCcw,
  PlusCircle,
  AlertCircle,
  Check,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  partnerService,
  AdminCommissionRecord,
  AdminPartnerRecord,
} from "@/services/partner";

export default function AdminCommissionsPage() {
  const [commissions, setCommissions] = useState<AdminCommissionRecord[]>([]);
  const [partners, setPartners] = useState<AdminPartnerRecord[]>([]);
  const [summary, setSummary] = useState<{ total_commissions_count: number; total_commissions_amount: number; pending_commissions_amount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Manual Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustPartnerId, setAdjustPartnerId] = useState<number | "">("");
  const [adjustAmount, setAdjustAmount] = useState<string>("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);

  // Reverse Modal
  const [reverseModal, setReverseModal] = useState<{ open: boolean; commissionId: number | null }>({
    open: false,
    commissionId: null,
  });
  const [reverseReason, setReverseReason] = useState("");
  const [reversing, setReversing] = useState(false);

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
      const [commRes, partnerRes] = await Promise.all([
        partnerService.getAdminCommissions({ status: statusFilter }),
        partnerService.getAdminPartners({ status: "approved" }),
      ]);
      setCommissions(commRes.data || []);
      setSummary(commRes.summary || null);
      setPartners(partnerRes.data || []);
    } catch (err: any) {
      console.error("Failed to load admin commissions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustPartnerId || !adjustAmount || !adjustReason) return;

    try {
      setAdjusting(true);
      const res = await partnerService.adjustCommission({
        partner_id: Number(adjustPartnerId),
        amount: parseInt(adjustAmount, 10),
        reason: adjustReason,
      });

      setFeedbackMsg({ type: "success", text: res.message });
      setShowAdjustModal(false);
      setAdjustAmount("");
      setAdjustReason("");
      loadData();
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Gagal menyesuaikan komisi." });
    } finally {
      setAdjusting(false);
    }
  };

  const handleReverseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reverseModal.commissionId || !reverseReason.trim()) return;

    try {
      setReversing(true);
      const res = await partnerService.reverseCommission(reverseModal.commissionId, reverseReason);
      setFeedbackMsg({ type: "success", text: res.message });
      setReverseModal({ open: false, commissionId: null });
      setReverseReason("");
      loadData();
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Gagal mereverse komisi." });
    } finally {
      setReversing(false);
    }
  };

  return (
    <AdminLayout
      title="Manajemen Transaksi Komisi Mitra"
      subtitle="Audit seluruh komisi dari pembayaran langganan, lakukan penyesuaian manual, atau reversal komisi."
      action={
        <Button
          onClick={() => setShowAdjustModal(true)}
          className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs h-9 border border-zinc-700"
        >
          <PlusCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
          Penyesuaian Manual
        </Button>
      }
    >
      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2 text-xs font-semibold ${
            feedbackMsg.type === "success"
              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
              : "bg-red-950/80 text-red-300 border border-red-800"
          }`}
        >
          {feedbackMsg.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Komisi Platform</span>
          <p className="text-2xl font-black text-white mt-2">
            {formatPrice(summary?.total_commissions_amount ?? 0)}
          </p>
          <span className="text-xs text-zinc-500 mt-1 block">Dari seluruh mitra sepanjang waktu</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Jumlah Transaksi Komisi</span>
          <p className="text-2xl font-black text-white mt-2">
            {summary?.total_commissions_count ?? 0}
          </p>
          <span className="text-xs text-zinc-500 mt-1 block">Transaksi pembayaran terproses</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Aturan Komisi</span>
          <p className="text-sm font-bold text-emerald-400 mt-2">Tersinkronisasi Otomatis</p>
          <Link href="/admin/partner-settings" className="text-xs text-zinc-400 hover:text-white underline mt-1 block">
            Kelola persentase & durasi &rarr;
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-1.5 overflow-x-auto">
        {["all", "available", "paid", "reversed"].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
              statusFilter === st
                ? "bg-zinc-800 text-white border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {st === "all" ? "Semua Status" : st === "available" ? "Tersedia" : st === "paid" ? "Sudah Ditarik" : "Direverse"}
          </button>
        ))}
      </div>

      {/* Commissions Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-zinc-500">Memuat transaksi komisi...</div>
        ) : commissions.length === 0 ? (
          <div className="py-16 text-center text-zinc-500">
            <Receipt className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-sm font-semibold">Tidak ada transaksi komisi</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Mitra & Kode</th>
                  <th className="py-3 px-4">Restoran Sumber</th>
                  <th className="py-3 px-4">Tipe Komisi</th>
                  <th className="py-3 px-4">Nominal</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {commissions.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-zinc-400">
                      {new Date(c.created_at).toLocaleDateString("id-ID", { dateStyle: "short" })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">{c.partner_name}</span>
                      <span className="font-mono text-[11px] text-emerald-400">{c.referral_code}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-zinc-200">{c.restaurant_name}</span>
                      {c.note && <span className="block text-[11px] text-zinc-500">{c.note}</span>}
                    </td>
                    <td className="py-3.5 px-4 capitalize text-zinc-400">
                      {c.commission_type}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white text-sm">
                      {formatPrice(c.commission_amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          c.status === "available"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : c.status === "paid"
                            ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                            : "bg-red-950 text-red-400 border border-red-800"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {c.status !== "reversed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReverseModal({ open: true, commissionId: c.id })}
                          className="bg-zinc-800 border-zinc-700 text-red-400 hover:text-red-300 text-[11px] h-7 px-2"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Reverse
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Adjustment Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-zinc-100">
            <h3 className="text-base font-bold text-white">Penyesuaian Manual Komisi</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Tambahkan komisi penyesuaian khusus (misal: bonus performa atau koreksi perhitungan).
            </p>

            <form onSubmit={handleAdjustSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Pilih Mitra
                </label>
                <select
                  value={adjustPartnerId}
                  onChange={(e) => setAdjustPartnerId(Number(e.target.value))}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200"
                >
                  <option value="">-- Pilih Mitra Terverifikasi --</option>
                  {partners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user_name} ({p.referral_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Nominal Komisi (IDR)
                </label>
                <Input
                  type="number"
                  placeholder="Contoh: 100000"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Alasan Penyesuaian (Audit Trail)
                </label>
                <textarea
                  placeholder="Contoh: Bonus referral kampanye Ramadan 2026..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  required
                  className="w-full h-20 bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAdjustModal(false)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-300 text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={adjusting}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  {adjusting ? "Menyimpan..." : "Simpan Komisi"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reverse Modal */}
      {reverseModal.open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-zinc-100">
            <h3 className="text-base font-bold text-white">Reverse / Batalkan Komisi</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Komisi ini akan ditarik kembali dan tidak lagi dapat dicairkan oleh mitra.
            </p>

            <form onSubmit={handleReverseSubmit} className="mt-4 space-y-4">
              <textarea
                placeholder="Alasan pembatalan komisi (contoh: Pembayaran langganan direfund/fraud)..."
                value={reverseReason}
                onChange={(e) => setReverseReason(e.target.value)}
                required
                className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none"
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReverseModal({ open: false, commissionId: null })}
                  className="bg-zinc-800 border-zinc-700 text-zinc-300 text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={reversing || !reverseReason.trim()}
                  className="text-xs font-semibold"
                >
                  {reversing ? "Memproses..." : "Konfirmasi Reversal"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
