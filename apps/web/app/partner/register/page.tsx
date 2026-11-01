"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Building2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { partnerService, PartnerMeResponse } from "@/services/partner";

export default function PartnerRegisterPage() {
  const router = useRouter();
  const [partnerStatus, setPartnerStatus] = useState<PartnerMeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const res = await partnerService.getMe();
      setPartnerStatus(res);
      if (res.is_partner && res.partner?.status === "approved") {
        router.push("/partner");
      }
    } catch (err: any) {
      console.error("Failed to check partner status", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      setErrorMsg("Anda wajib menyetujui syarat & ketentuan Program Mitra Ordexa.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      await partnerService.register({
        bank_name: bankName,
        bank_account_number: bankAccountNumber,
        bank_account_name: bankAccountName,
        terms_accepted: true,
      });

      await checkStatus();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal mengajukan pendaftaran mitra.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <p className="text-sm text-zinc-500">Memeriksa status akun kemitraan...</p>
      </div>
    );
  }

  const partner = partnerStatus?.partner;

  // View 1: Application Pending
  if (partnerStatus?.is_partner && partner?.status === "pending") {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 border border-zinc-200 shadow-sm rounded-xl sm:px-10 text-center">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">Pendaftaran Sedang Ditinjau</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Pengajuan Program Mitra Anda sedang ditinjau oleh tim administrator Ordexa.
            </p>

            <div className="mt-6 bg-zinc-50 border border-zinc-200 rounded-lg p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Kode Referral:</span>
                <span className="font-mono font-bold text-zinc-800">{partner.referral_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Status:</span>
                <span className="font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Pending Approval</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Tanggal Pengajuan:</span>
                <span className="text-zinc-700">{new Date(partner.created_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}</span>
              </div>
            </div>

            <p className="mt-6 text-xs text-zinc-400">
              Notifikasi persetujuan akan diberikan segera. Anda dapat kembali ke halaman utama.
            </p>

            <div className="mt-6 flex flex-col gap-2">
              <Button onClick={checkStatus} variant="outline" className="w-full text-xs">
                Periksa Status Terbaru
              </Button>
              <Link href="/restaurant">
                <Button variant="ghost" className="w-full text-xs text-zinc-600">
                  Kembali ke Dashboard Restoran
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View 2: Application Rejected (allow re-apply)
  if (partnerStatus?.is_partner && partner?.status === "rejected") {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-6 border border-zinc-200 shadow-sm rounded-xl sm:px-10 text-center">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
              <XCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">Pengajuan Belum Disetujui</h2>
            <p className="mt-2 text-sm text-zinc-600">
              Mohon maaf, pengajuan kemitraan Anda ditolak oleh administrator.
            </p>

            {partner.rejection_reason && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-left">
                <p className="text-xs font-semibold text-red-800">Alasan:</p>
                <p className="text-xs text-red-700 mt-0.5">{partner.rejection_reason}</p>
              </div>
            )}

            <p className="mt-4 text-xs text-zinc-500">
              Anda dapat memperbaiki informasi rekening atau melengkapi data dan mengajukan kembali.
            </p>

            <div className="mt-6">
              <Button
                onClick={() => setPartnerStatus({ ...partnerStatus, partner: null, is_partner: false })}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs"
              >
                Ajukan Ulang Pendaftaran Mitra
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View 3: Registration Form
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="text-center mb-6">
          <Link href="/" className="inline-block font-black text-2xl tracking-tight text-zinc-900">
            ORDEXA <span className="text-zinc-500 font-medium text-base">Partner Program</span>
          </Link>
          <h2 className="mt-2 text-2xl font-bold text-zinc-900">Daftar Sebagai Mitra Sales Ordexa</h2>
          <p className="text-sm text-zinc-600 mt-1 max-w-md mx-auto">
            Promosikan ekosistem Ordexa kepada pemilik restoran & UMKM kuliner di Indonesia dan dapatkan bagi hasil komisi hingga 10% setiap pembayaran langganan.
          </p>
        </div>

        <div className="bg-white py-8 px-6 border border-zinc-200 shadow-sm rounded-xl sm:px-10">
          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Nama Bank / E-Wallet Payout
              </label>
              <Input
                placeholder="Contoh: BCA, Mandiri, BRI, Bank Jago"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Nomor Rekening
              </label>
              <Input
                placeholder="Nomor rekening penerima komisi"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Nama Pemilik Rekening
              </label>
              <Input
                placeholder="Nama lengkap sesuai buku tabungan"
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                required
              />
            </div>

            {/* Terms & Conditions Box */}
            <div className="border border-zinc-200 rounded-lg p-4 bg-zinc-50 text-xs text-zinc-600 space-y-2 max-h-40 overflow-y-auto">
              <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-zinc-700" />
                Syarat & Ketentuan Program Mitra Ordexa:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Mitra berhak mendapatkan komisi dari pembayaran paket langganan restoran yang dirujuk.</li>
                <li>Komisi tidak dihitung dari transaksi pesanan QRIS makanan pelanggan.</li>
                <li>Mitra dilarang merujuk akun atau restoran milik sendiri.</li>
                <li>Penarikan saldo komisi dapat diajukan setelah mencapai batas minimum penarikan.</li>
                <li>Komisi dari pembayaran langganan yang direfund atau dibatalkan akan dibatalkan/direverse.</li>
                <li>Ordexa berhak menonaktifkan akun mitra yang terindikasi melakukan kecurangan atau manipulasi.</li>
              </ul>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
              />
              <label htmlFor="terms" className="text-xs text-zinc-700 leading-normal">
                Saya telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan Program Mitra Ordexa di atas.
              </label>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-semibold py-2.5"
              >
                {submitting ? "Mengirim Pendaftaran..." : "Kirim Pendaftaran Mitra"}
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
            <Link href="/" className="hover:text-zinc-900">
              &larr; Kembali ke Beranda
            </Link>
            <Link href="/login" className="hover:text-zinc-900">
              Ganti Akun
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
