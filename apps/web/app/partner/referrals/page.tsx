"use client";

import { useEffect, useState } from "react";
import { Users2, Copy, Check, ExternalLink, QrCode, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PartnerLayout } from "@/components/partner/PartnerLayout";
import { partnerService, PartnerReferralsResponse } from "@/services/partner";

export default function PartnerReferralsPage() {
  const [data, setData] = useState<PartnerReferralsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");

  const loadReferrals = async () => {
    try {
      setLoading(true);
      const res = await partnerService.getReferrals();
      setData(res);
    } catch (err: any) {
      console.error("Failed to load referrals", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferrals();
  }, []);

  const handleCopy = () => {
    if (!data?.referral_link) return;
    navigator.clipboard.writeText(data.referral_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredReferrals = (data?.data || []).filter((r) =>
    r.restaurant_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PartnerLayout
      title="Manajemen Referral"
      subtitle="Bagikan tautan pendaftaran unik Anda dan pantau status konversi restoran yang mendaftar."
    >
      {/* Referral Link & Code Banner */}
      <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-xs mb-8">
        <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-wider mb-2">Tautan Referral Anda</h2>
        <p className="text-xs text-zinc-500 mb-4">
          Pemilik restoran yang membuka link ini akan otomatis terhubung dengan akun kemitraan Anda saat mendaftar.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 flex items-center justify-between overflow-hidden">
            <span className="text-xs font-mono text-zinc-700 truncate select-all">
              {data?.referral_link || "Memuat tautan..."}
            </span>
            <span className="text-[11px] font-bold text-zinc-400 bg-white border border-zinc-200 px-2 py-0.5 rounded ml-2 shrink-0">
              KODE: {data?.referral_code}
            </span>
          </div>

          <Button
            onClick={handleCopy}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs shrink-0 h-10 px-4"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                Tersalin ke Clipboard
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1.5" />
                Salin Tautan
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Referred Restaurants Table */}
      <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Daftar Restoran Terdaftar</h3>
            <p className="text-xs text-zinc-500">
              Total {data?.data?.length ?? 0} restoran terdaftar melalui referral Anda
            </p>
          </div>

          <div className="w-full sm:w-64">
            <Input
              placeholder="Cari nama restoran..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-zinc-400">Memuat data restoran...</div>
        ) : filteredReferrals.length === 0 ? (
          <div className="py-16 text-center">
            <Users2 className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-700">Belum ada restoran yang terdaftar</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Bagikan link referral Anda melalui media sosial, WhatsApp, atau kontak langsung pemilik restoran.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nama Restoran</th>
                  <th className="py-3 px-4">Tanggal Daftar</th>
                  <th className="py-3 px-4">Paket Langganan</th>
                  <th className="py-3 px-4">Status Akun</th>
                  <th className="py-3 px-4 text-right">Status Konversi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredReferrals.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-zinc-900">
                      {item.restaurant_name}
                      <span className="block text-[11px] font-normal text-zinc-400">{item.restaurant_slug}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {new Date(item.registered_at).toLocaleDateString("id-ID", { dateStyle: "medium" })}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-zinc-700">
                      {item.package_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                          item.subscription_status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : item.subscription_status === "pending_payment"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {item.subscription_status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                          item.conversion_status === "converted"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                        }`}
                      >
                        {item.conversion_status === "converted" ? "Menghasilkan Komisi" : "Belum Berlangganan"}
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
