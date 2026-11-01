"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users2,
  Receipt,
  Wallet,
  LogOut,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PartnerLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PartnerLayout({
  children,
  title,
  subtitle,
  action,
}: PartnerLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Ringkasan", href: "/partner", icon: LayoutDashboard },
    { label: "Referral & Link", href: "/partner/referrals", icon: Users2 },
    { label: "Riwayat Komisi", href: "/partner/commissions", icon: Receipt },
    { label: "Penarikan Dana", href: "/partner/withdrawals", icon: Wallet },
  ];

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ordexa_token");
      localStorage.removeItem("token");
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link href="/" className="font-black text-xl tracking-tight text-zinc-900 flex items-center gap-2">
                <span className="bg-zinc-900 text-white px-2 py-0.5 rounded text-sm font-bold">ORDEXA</span>
                <span className="text-zinc-600 font-semibold text-sm tracking-normal">Program Mitra</span>
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/restaurant">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-zinc-600 hover:text-zinc-900 text-xs">
                  Restoran Saya
                  <ArrowUpRight className="ml-1 w-3.5 h-3.5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-xs text-zinc-600 hover:text-red-600"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Keluar
              </Button>
            </div>
          </div>

          {/* Sub Navigation Bar */}
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 -mb-px border-t border-zinc-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 mr-1.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">{title}</h1>
            {subtitle && <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>

        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs text-zinc-400">
          Ordexa Partner Ecosystem &copy; {new Date().getFullYear()} — Ekosistem Digitalisasi Restoran & UMKM Kuliner Indonesia
        </div>
      </footer>
    </div>
  );
}
