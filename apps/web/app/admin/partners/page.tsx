"use client";

import { useEffect, useState } from "react";
import {
  Users2,
  Search,
  CheckCircle2,
  XCircle,
  Ban,
  RefreshCw,
  Eye,
  AlertCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { partnerService, AdminPartnerRecord } from "@/services/partner";

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<AdminPartnerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Reject Modal State
  const [rejectModal, setRejectModal] = useState<{ open: boolean; partnerId: number | null }>({
    open: false,
    partnerId: null,
  });
  const [rejectReason, setRejectReason] = useState("");

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const loadPartners = async () => {
    try {
      setLoading(true);
      const res = await partnerService.getAdminPartners({
        status: statusFilter,
        search: search || undefined,
      });
      setPartners(res.data || []);
    } catch (err: any) {
      console.error("Failed to load partners", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPartners();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPartners();
  };

  const handleApprove = async (partnerId: number) => {
    try {
      const res = await partnerService.approvePartner(partnerId);
      setFeedbackMsg({ type: "success", text: res.message });
      loadPartners();
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Gagal menyetujui mitra." });
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModal.partnerId || !rejectReason.trim()) return;

    try {
      const res = await partnerService.rejectPartner(rejectModal.partnerId, rejectReason);
      setFeedbackMsg({ type: "success", text: res.message });
      setRejectModal({ open: false, partnerId: null });
      setRejectReason("");
      loadPartners();
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Gagal menolak mitra." });
    }
  };

  const handleSuspend = async (partnerId: number) => {
    if (!confirm("Yakin ingin menonaktifkan/suspend mitra ini?")) return;
    try {
      const res = await partnerService.suspendPartner(partnerId);
      setFeedbackMsg({ type: "success", text: res.message });
      loadPartners();
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Gagal menonaktifkan mitra." });
    }
  };

  const handleReactivate = async (partnerId: number) => {
    try {
      const res = await partnerService.reactivatePartner(partnerId);
      setFeedbackMsg({ type: "success", text: res.message });
      loadPartners();
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Gagal mengaktifkan kembali mitra." });
    }
  };

  return (
    <AdminLayout
      title="Manajemen Akun Mitra Ordexa"
      subtitle="Verifikasi pendaftaran mitra sales, pantau perolehan komisi, dan kelola status kemitraan."
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

      {/* Filter & Search Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {["all", "pending", "approved", "rejected", "suspended"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {st === "all" ? "Semua Status" : st}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-72">
          <Input
            placeholder="Cari kode, nama, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 bg-zinc-950 border-zinc-800 text-zinc-200 text-xs"
          />
          <Button type="submit" size="sm" className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs h-9">
            <Search className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>

      {/* Partners Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-zinc-500">Memuat data mitra...</div>
        ) : partners.length === 0 ? (
          <div className="py-16 text-center text-zinc-500">
            <Users2 className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-sm font-semibold">Tidak ada akun mitra ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Mitra</th>
                  <th className="py-3 px-4">Kode Referral</th>
                  <th className="py-3 px-4">Rekening Payout</th>
                  <th className="py-3 px-4">Referral</th>
                  <th className="py-3 px-4">Total Komisi</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {partners.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">{p.user_name}</span>
                      <span className="text-[11px] text-zinc-400">{p.user_email}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {p.referral_code}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-zinc-200">{p.bank_name || "-"}</span>
                      <span className="block text-[11px] text-zinc-400">
                        {p.bank_account_number ? `${p.bank_account_number} (${p.bank_account_name})` : "Belum diisi"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-white">{p.total_referrals} resto</span>
                      <span className="block text-[11px] text-emerald-400">
                        {p.converted_referrals} konversi
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">{formatPrice(p.total_earned)}</span>
                      <span className="text-[11px] text-zinc-400">
                        Saldo: {formatPrice(p.available_balance)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold capitalize ${
                          p.status === "approved"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : p.status === "pending"
                            ? "bg-amber-950 text-amber-400 border border-amber-800"
                            : p.status === "suspended"
                            ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
                            : "bg-red-950 text-red-400 border border-red-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      {p.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(p.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] h-7 px-2"
                          >
                            Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setRejectModal({ open: true, partnerId: p.id })}
                            className="text-[11px] h-7 px-2"
                          >
                            Tolak
                          </Button>
                        </>
                      )}
                      {p.status === "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSuspend(p.id)}
                          className="bg-zinc-800 border-zinc-700 text-amber-400 hover:text-amber-300 text-[11px] h-7 px-2"
                        >
                          Suspend
                        </Button>
                      )}
                      {p.status === "suspended" && (
                        <Button
                          size="sm"
                          onClick={() => handleReactivate(p.id)}
                          className="bg-zinc-800 border-zinc-700 text-emerald-400 hover:text-emerald-300 text-[11px] h-7 px-2"
                        >
                          Aktifkan
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

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-zinc-100">
            <h3 className="text-base font-bold text-white">Tolak Pendaftaran Mitra</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Masukkan alasan penolakan. Alasan ini akan ditampilkan kepada calon mitra.
            </p>

            <form onSubmit={handleRejectSubmit} className="mt-4 space-y-4">
              <textarea
                placeholder="Contoh: Dokumen verifikasi tidak valid atau tidak lengkap..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
                className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-600"
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRejectModal({ open: false, partnerId: null })}
                  className="bg-zinc-800 border-zinc-700 text-zinc-300 text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={!rejectReason.trim()}
                  className="text-xs font-semibold"
                >
                  Konfirmasi Tolak
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
