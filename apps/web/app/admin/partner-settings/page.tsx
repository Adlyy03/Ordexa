"use client";

import { useEffect, useState } from "react";
import { Settings, Save, Check, AlertCircle, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { partnerService, PartnerSettingsData } from "@/services/partner";

export default function AdminPartnerSettingsPage() {
  const [settings, setSettings] = useState<PartnerSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [isActive, setIsActive] = useState(true);
  const [commissionType, setCommissionType] = useState<"percentage" | "fixed">("percentage");
  const [commissionRate, setCommissionRate] = useState<number>(10);
  const [fixedAmount, setFixedAmount] = useState<number>(50000);
  const [isRecurring, setIsRecurring] = useState(true);
  const [durationMonths, setDurationMonths] = useState<number>(12);
  const [minWithdrawal, setMinWithdrawal] = useState<number>(100000);
  const [attributionDays, setAttributionDays] = useState<number>(30);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await partnerService.getSettings();
      const s = res.data;
      setSettings(s);
      setIsActive(s.is_active);
      setCommissionType(s.commission_type);
      setCommissionRate(s.commission_rate);
      setFixedAmount(s.fixed_amount);
      setIsRecurring(s.is_recurring);
      setDurationMonths(s.commission_duration_months);
      setMinWithdrawal(s.minimum_withdrawal);
      setAttributionDays(s.attribution_days);
    } catch (err: any) {
      console.error("Failed to load partner settings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await partnerService.updateSettings({
        is_active: isActive,
        commission_type: commissionType,
        commission_rate: Number(commissionRate),
        fixed_amount: Number(fixedAmount),
        is_recurring: isRecurring,
        commission_duration_months: Number(durationMonths),
        minimum_withdrawal: Number(minWithdrawal),
        attribution_days: Number(attributionDays),
      });

      setFeedbackMsg({ type: "success", text: res.message });
      setSettings(res.data);
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Gagal memperbarui pengaturan." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout
      title="Konfigurasi Aturan Program Mitra"
      subtitle="Atur persentase komisi, skema berulang, batas penarikan minimum, dan masa atribusi referral."
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

      {loading ? (
        <div className="py-16 text-center text-xs text-zinc-500">Memuat konfigurasi...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
          {/* Activation Switch Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Status Program Mitra (Aktif / Nonaktif)</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Jika dinonaktifkan, referral baru tidak akan diatribusikan dan komisi tidak akan dihitung.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                isActive
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  : "bg-zinc-800 text-zinc-500 border border-zinc-700"
              }`}
            >
              {isActive ? "Program Aktif" : "Program Nonaktif"}
            </button>
          </div>

          {/* Commission Calculation Model */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Model Perhitungan Komisi</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`border p-4 rounded-xl cursor-pointer flex flex-col justify-between ${
                  commissionType === "percentage"
                    ? "bg-zinc-800/80 border-emerald-500"
                    : "bg-zinc-950 border-zinc-800"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name="commissionType"
                    checked={commissionType === "percentage"}
                    onChange={() => setCommissionType("percentage")}
                    className="text-emerald-500"
                  />
                  <span className="text-xs font-bold text-white">Persentase Langganan (%)</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Mitra mendapat % tertentu dari nilai transaksi pembayaran langganan restoran.
                </p>
              </label>

              <label
                className={`border p-4 rounded-xl cursor-pointer flex flex-col justify-between ${
                  commissionType === "fixed"
                    ? "bg-zinc-800/80 border-emerald-500"
                    : "bg-zinc-950 border-zinc-800"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name="commissionType"
                    checked={commissionType === "fixed"}
                    onChange={() => setCommissionType("fixed")}
                    className="text-emerald-500"
                  />
                  <span className="text-xs font-bold text-white">Komisi Tetap (Fixed IDR)</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Mitra mendapat nominal tetap per transaksi pembayaran langganan.
                </p>
              </label>
            </div>

            {commissionType === "percentage" ? (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Persentase Komisi Default (%)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                  className="bg-zinc-950 border-zinc-800 text-xs max-w-xs"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Nominal Komisi Tetap (IDR)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={fixedAmount}
                  onChange={(e) => setFixedAmount(parseInt(e.target.value, 10) || 0)}
                  className="bg-zinc-950 border-zinc-800 text-xs max-w-xs"
                  required
                />
              </div>
            )}
          </div>

          {/* Recurring & Duration Rules */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Aturan Komisi Berulang (Recurring) & Durasi</h3>

            <div className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
              <div>
                <span className="text-xs font-bold text-white block">Komisi Berulang (Setiap Perpanjangan)</span>
                <span className="text-[11px] text-zinc-400">
                  Berikan komisi setiap kali restoran referral memperpanjang langganan bulan/tahun berikutnya.
                </span>
              </div>
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Durasi Hak Komisi (Bulan)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(parseInt(e.target.value, 10) || 0)}
                  className="bg-zinc-950 border-zinc-800 text-xs"
                  required
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Isi 0 untuk durasi tanpa batas (seumur hidup langganan).
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Masa Atribusi Referral (Hari)
                </label>
                <Input
                  type="number"
                  min="1"
                  value={attributionDays}
                  onChange={(e) => setAttributionDays(parseInt(e.target.value, 10) || 30)}
                  className="bg-zinc-950 border-zinc-800 text-xs"
                  required
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">
                  Jangka waktu cookie/atribusi setelah link referral diklik.
                </span>
              </div>
            </div>
          </div>

          {/* Minimum Withdrawal Rule */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white">Batas Penarikan Dana (Withdrawal)</h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Minimal Penarikan Saldo (IDR)
              </label>
              <Input
                type="number"
                min="1000"
                step="1000"
                value={minWithdrawal}
                onChange={(e) => setMinWithdrawal(parseInt(e.target.value, 10) || 100000)}
                className="bg-zinc-950 border-zinc-800 text-xs max-w-xs"
                required
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Mitra hanya dapat mengajukan payout jika saldo mencapai batas ini (default: Rp 100.000).
              </span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 px-6"
            >
              <Save className="w-4 h-4 mr-1.5" />
              {saving ? "Menyimpan Perubahan..." : "Simpan Pengaturan Mitra"}
            </Button>
          </div>
        </form>
      )}
    </AdminLayout>
  );
}
