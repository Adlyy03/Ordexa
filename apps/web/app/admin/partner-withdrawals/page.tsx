"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Check,
  AlertCircle,
  ExternalLink,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { partnerService, AdminWithdrawalRecord } from "@/services/partner";

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawalRecord[]>([]);
  const [summary, setSummary] = useState<{ pending_count: number; pending_amount: number; paid_count: number; paid_amount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Pay Modal
  const [payModal, setPayModal] = useState<{ open: boolean; item: AdminWithdrawalRecord | null }>({
    open: false,
    item: null,
  });
  const [paymentRef, setPaymentRef] = useState("");
  const [paying, setPaying] = useState(false);

  // Reject Modal
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: number | null }>({
    open: false,
    id: null,
  });
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

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
      const res = await partnerService.getAdminWithdrawals({ status: statusFilter });
      setWithdrawals(res.data || []);
      setSummary(res.summary || null);
    } catch (err: any) {
      console.error("Failed to load admin withdrawals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleApprove = async (id: number) => {
    try {
      const res = await partnerService.approveWithdrawal(id);
      setFeedbackMsg({ type: "success", text: res.message });
      loadData();
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Gagal menyetujui penarikan." });
    }
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModal.item || !paymentRef.trim()) return;

    try {
      setPaying(true);
      const res = await partnerService.markWithdrawalPaid(payModal.item.id, paymentRef);
      setFeedbackMsg({ type: "success", text: res.message });
      setPayModal({ open: false, item: null });
      setPaymentRef("");
      loadData();
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Gagal menandai lunas." });
    } finally {
      setPaying(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModal.id || !rejectReason.trim()) return;

    try {
      setRejecting(true);
      const res = await partnerService.rejectWithdrawal(rejectModal.id, rejectReason);
      setFeedbackMsg({ type: "success", text: res.message });
      setRejectModal({ open: false, id: null });
      setRejectReason("");
      loadData();
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Gagal menolak penarikan." });
    } finally {
      setRejecting(false);
    }
  };

  return (
    <AdminLayout
      title="Kelola Permintaan Penarikan Dana Mitra"
      subtitle="Tinjau pengajuan payout komisi, lakukan verifikasi rekening bank, dan konfirmasi transfer."
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Menunggu Pencairan (Pending)</span>
          <p className="text-2xl font-black text-amber-400 mt-2">
            {formatPrice(summary?.pending_amount ?? 0)}
          </p>
          <span className="text-xs text-zinc-500 mt-1 block">
            {summary?.pending_count ?? 0} permintaan penarikan belum ditransfer
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Telah Ditransfer (Paid)</span>
          <p className="text-2xl font-black text-emerald-400 mt-2">
            {formatPrice(summary?.paid_amount ?? 0)}
          </p>
          <span className="text-xs text-zinc-500 mt-1 block">
            {summary?.paid_count ?? 0} penarikan berhasil diselesaikan
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-1.5 overflow-x-auto">
        {["all", "pending", "approved", "paid", "rejected"].map((st) => (
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

      {/* Withdrawals Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-zinc-500">Memuat permintaan penarikan...</div>
        ) : withdrawals.length === 0 ? (
          <div className="py-16 text-center text-zinc-500">
            <Wallet className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
            <p className="text-sm font-semibold">Tidak ada permintaan penarikan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/60 border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tanggal Pengajuan</th>
                  <th className="py-3 px-4">Nama Mitra</th>
                  <th className="py-3 px-4">Nominal</th>
                  <th className="py-3 px-4">Rekening Tujuan Transfer</th>
                  <th className="py-3 px-4">Bukti / Ref Transfer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-zinc-400">
                      {new Date(w.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">{w.partner_name}</span>
                      <span className="text-[11px] font-mono text-emerald-400">{w.referral_code}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white text-sm">
                      {formatPrice(w.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-zinc-200 block">{w.payout_provider}</span>
                      <span className="font-mono text-xs text-zinc-400">
                        {w.payout_account_number} a.n. {w.payout_account_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {w.payment_reference ? (
                        <span className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                          {w.payment_reference}
                        </span>
                      ) : w.admin_note ? (
                        <span className="text-xs text-red-400">{w.admin_note}</span>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          w.status === "paid"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : w.status === "pending"
                            ? "bg-amber-950 text-amber-400 border border-amber-800"
                            : w.status === "approved"
                            ? "bg-blue-950 text-blue-400 border border-blue-800"
                            : "bg-red-950 text-red-400 border border-red-800"
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      {w.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(w.id)}
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] h-7 px-2 border border-zinc-700"
                          >
                            Setujui
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setPayModal({ open: true, item: w })}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] h-7 px-2 font-semibold"
                          >
                            Bayar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setRejectModal({ open: true, id: w.id })}
                            className="text-[11px] h-7 px-2"
                          >
                            Tolak
                          </Button>
                        </>
                      )}
                      {w.status === "approved" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => setPayModal({ open: true, item: w })}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] h-7 px-2 font-semibold"
                          >
                            Input Bukti Bayar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setRejectModal({ open: true, id: w.id })}
                            className="text-[11px] h-7 px-2"
                          >
                            Tolak
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mark Paid Modal */}
      {payModal.open && payModal.item && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-zinc-100">
            <h3 className="text-base font-bold text-white">Konfirmasi Pembayaran Payout</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Mitra: <span className="text-white font-bold">{payModal.item.partner_name}</span> &bull; Nominal:{" "}
              <span className="text-emerald-400 font-bold">{formatPrice(payModal.item.amount)}</span>
            </p>

            <div className="my-4 p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs space-y-1">
              <p className="text-zinc-400">Rekening Tujuan:</p>
              <p className="font-bold text-white text-sm">
                {payModal.item.payout_provider} - {payModal.item.payout_account_number}
              </p>
              <p className="text-zinc-400">a.n. {payModal.item.payout_account_name}</p>
            </div>

            <form onSubmit={handlePaySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                  Nomor Referensi Bank / Bukti Transfer
                </label>
                <Input
                  placeholder="Contoh: BCA-TRF-20261101-098273"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPayModal({ open: false, item: null })}
                  className="bg-zinc-800 border-zinc-700 text-zinc-300 text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={paying || !paymentRef.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                >
                  {paying ? "Menyimpan..." : "Tandai Telah Ditransfer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-zinc-100">
            <h3 className="text-base font-bold text-white">Tolak Permintaan Penarikan</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Dana akan otomatis dikembalikan ke saldo komisi mitra yang dapat ditarik kembali.
            </p>

            <form onSubmit={handleRejectSubmit} className="mt-4 space-y-4">
              <textarea
                placeholder="Alasan penolakan (misal: Nomor rekening tidak cocok dengan nama pemilik)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
                className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none"
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRejectModal({ open: false, id: null })}
                  className="bg-zinc-800 border-zinc-700 text-zinc-300 text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={rejecting || !rejectReason.trim()}
                  className="text-xs font-semibold"
                >
                  {rejecting ? "Memproses..." : "Tolak Penarikan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
