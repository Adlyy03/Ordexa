import Link from "next/link";
import { UtensilsCrossed, QrCode, MonitorCheck, ShieldCheck, ArrowRight, Store } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              O
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900">Ordexa</span>
            <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-medium ml-1 border border-zinc-200">
              SaaS F&B
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
            <a href="#fitur" className="hover:text-zinc-900 transition-colors">Fitur</a>
            <a href="#solusi" className="hover:text-zinc-900 transition-colors">Solusi</a>
            <a href="#harga" className="hover:text-zinc-900 transition-colors">Paket Langganan</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900 px-3 py-2 transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 px-4 py-2 rounded-lg transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              Mulai Sekarang
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Ekosistem Operasional Restoran Terpadu
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 leading-[1.1]">
            Kelola Banyak Cabang, Menu & Pesanan QR dalam Satu Platform
          </h1>

          <p className="text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            Ordexa membantu pelaku UMKM kuliner hingga grup restoran mengotomasi pemesanan meja tanpa aplikasi, KDS dapur real-time, dan pemantauan multi-cabang tanpa batas.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-xl text-base shadow-sm transition-all inline-flex items-center justify-center gap-2"
            >
              Daftarkan Restoran Anda
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#fitur"
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-200 font-medium rounded-xl text-base transition-colors inline-flex items-center justify-center"
            >
              Pelajari Alur Kerja
            </a>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Cabang Tanpa Batas di Semua Paket
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Pemisahan Jalur Pembayaran Resmi
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              PWA Dashboard & Standalone POS
            </span>
          </div>
        </div>
      </section>

      {/* 3 Pillars Grid */}
      <section id="fitur" className="py-16 px-4 bg-white border-y border-zinc-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
              Arsitektur Operasional yang Efisien & Andal
            </h2>
            <p className="text-zinc-600 text-sm sm:text-base">
              Dirancang untuk mengatasi friksi pesanan manual dari meja hingga dapur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-zinc-200 bg-zinc-50/50 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-zinc-900">Customer QR Ordering</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Pelanggan scan QR code di meja menggunakan kamera smartphone. Tanpa download aplikasi dan tanpa registrasi wajib, langsung pesan dan bayar via QRIS.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-200 bg-zinc-50/50 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                <MonitorCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-zinc-900">Kitchen Display System (KDS)</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Pesanan yang dikonfirmasi langsung muncul di layar dapur secara real-time via WebSocket Laravel Reverb, lengkap dengan suara notifikasi dan tiket pesanan.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-200 bg-zinc-50/50 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-zinc-900">Unlimited Multi-Branch</h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Satu akun pemilik dapat mengelola 1 hingga ratusan cabang tanpa batas kuota cabang. Pantau omset dan performa tiap cabang dalam satu tampilan dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 px-4 border-t border-zinc-200 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-zinc-900 text-white flex items-center justify-center font-bold text-[10px]">
              O
            </div>
            <span>© 2026 Ordexa. National Restaurant Ordering & Management Ecosystem.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-zinc-900">Syarat & Ketentuan</a>
            <a href="#" className="hover:text-zinc-900">Kebijakan Privasi</a>
            <a href="#" className="hover:text-zinc-900">Bantuan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
