"use client";

import { useEffect, useState } from "react";
import {
  Wallet,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { partnerService, PartnerWithdrawalsResponse } from "@/services/partner";

export default function PartnerWithdrawalsPage() {
  const [data, setData] = useState<PartnerWithdrawalsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [amount, setAmount] = useState<string>("");
  const [payoutProvider, setPayoutProvider] = useState("");
  const [payoutAccountNumber, setPayoutAccountNumber] = useState("");
  const [payoutAccountName, setPayoutAccountName] = useState("");

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
      const res = await partnerService.getWithdrawals();
      setData(res);

      // Pre-fill form from saved payout info
      if (res.saved_payout_info) {
        setPayoutProvider(res.saved_payout_info.bank_name || "");
        setPayoutAccountNumber(res.saved_payout_info.bank_account_number || "");
        setPayoutAccountName(res.saved_payout_info.bank_account_name || "");
      }
    } catch (err: any) {
      console.error("Failed to load withdrawals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseInt(amount, 10);
    const minWd = data?.balance.minimum_withdrawal ?? 100000;
    const availBal = data?.balance.available_balance ?? 0;

    if (isNaN(numericAmount) || numericAmount < minWd) {
      setErrorMsg(`Jumlah penarikan minimal ${formatPrice(minWd)}.`);
      return;
    }

    if (numericAmount > availBal) {
      setErrorMsg(`Jumlah penarikan melebihi saldo tersedia (${formatPrice(availBal)}).`);
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      await partnerService.requestWithdrawal({
        amount: numericAmount,
        payout_provider: payoutProvider,
        payout_account_number: payoutAccountNumber,
        payout_account_name: payoutAccountName,
      });

      setSuccessMsg("Pengajuan penarikan dana berhasil dikirim.");
      setShowModal(false);
      setAmount("");
      await loadData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengajukan penarikan dana.");
    } finally {
      setSubmitting(false);
    }
  };

  const balance = data?.balance;
  const list = data?.data || [];
  const minWd = balance?.minimum_withdrawal ?? 100000;

  return (
    <PartnerLayout
      title="Penarikan Saldo Komisi"
      subtitle="Tarik komisi yang telah Anda peroleh langsung ke rekening bank atau e-wallet Anda."
      action={
        <Button
          onClick={() => {
            setErrorMsg(null);
            setShowModal(true);
          }}
          disabled={!balance || balance.available_balance < minWd}
          className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs h-9"
        >
          <Wallet className="w-3.5 h-3.5 mr-1.5" />
          Ajukan Penarikan Dana
        </Button>
      }
    >
      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border-2 border-zinc-900 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider">Saldo Tersedia</span>
          <p className="text-2xl font-black text-emerald-700 mt-2">{formatPrice(balance?.available_balance ?? 0)}</p>
          <span className="text-xs text-zinc-500 mt-1 block">Minimal penarikan {formatPrice(minWd)}</span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Sedang Diproses</span>
          <p className="text-2xl font-black text-amber-700 mt-2">{formatPrice(balance?.pending_withdrawal ?? 0)}</p>
          <span className="text-xs text-zinc-400 mt-1 block">Menunggu transfer admin</span>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Telah Ditransfer</span>
          <p className="text-2xl font-black text-zinc-900 mt-2">{formatPrice(balance?.paid_withdrawal ?? 0)}</p>
          <span className="text-xs text-zinc-400 mt-1 block">Berhasil masuk ke rekening Anda</span>
        </div>
      </div>

      {/* Withdrawal Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-zinc-200">
            <h3 className="text-lg font-bold text-zinc-900">Form Pengajuan Penarikan</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Saldo tersedia: <span className="font-bold text-zinc-800">{formatPrice(balance?.available_balance ?? 0)}</span>
            </p>

            {errorMsg && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleWithdrawalSubmit} className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                    Jumlah Penarikan (IDR)
                  </label>
                  <button
                    type="button"
                    onClick={() => setAmount(String(balance?.available_balance ?? 0))}
                    className="text-xs text-zinc-600 hover:text-zinc-900 font-semibold underline"
                  >
                    Tarik Semua
                  </button>
                </div>
                <Input
                  type="number"
                  placeholder={`Minimal ${minWd}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Bank / Penyedia Payout
                </label>
                <Input
                  placeholder="Contoh: BCA, Mandiri, BRI"
                  value={payoutProvider}
                  onChange={(e) => setPayoutProvider(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Nomor Rekening
                </label>
                <Input
                  placeholder="Nomor rekening tujuan"
                  value={payoutAccountNumber}
                  onChange={(e) => setPayoutAccountNumber(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Nama Pemilik Rekening
                </label>
                <Input
                  placeholder="Nama sesuai buku rekening"
                  value={payoutAccountName}
                  onChange={(e) => setPayoutAccountName(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold"
                >
                  {submitting ? "Memproses..." : "Kirim Pengajuan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal History Table */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-zinc-100">
          <h3 className="text-base font-bold text-zinc-900">Riwayat Penarikan Dana</h3>
          <p className="text-xs text-zinc-500">Daftar permintaan pencairan komisi ke rekening bank Anda</p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-zinc-400">Memuat riwayat penarikan...</div>
        ) : list.length === 0 ? (
          <div className="py-16 text-center">
            <Wallet className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-700">Belum ada riwayat penarikan dana</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Saat saldo mencapai minimum penarikan, Anda dapat mengajukan pencairan dana kapan saja.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tanggal Pengajuan</th>
                  <th className="py-3 px-4">Jumlah Penarikan</th>
                  <th className="py-3 px-4">Rekening Tujuan</th>
                  <th className="py-3 px-4">Referensi Transfer</th>
                  <th className="py-3 px-4 text-right">Status Penarikan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {list.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-zinc-500">
                      {new Date(item.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-zinc-900 text-sm">
                      {formatPrice(item.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-zinc-800">{item.payout_provider}</span>
                      <span className="block text-[11px] text-zinc-500 font-mono">
                        {item.payout_account_number} ({item.payout_account_name})
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {item.payment_reference ? (
                        <span className="font-mono text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {item.payment_reference}
                        </span>
                      ) : item.admin_note ? (
                        <span className="text-xs text-red-600">{item.admin_note}</span>
                      ) : (
                        <span className="text-xs text-zinc-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.status === "paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.status === "pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : item.status === "approved"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {item.status === "paid"
                          ? "Berhasil Ditransfer"
                          : item.status === "pending"
                          ? "Menunggu Konfirmasi"
                          : item.status === "approved"
                          ? "Disetujui"
                          : "Ditolak"}
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
