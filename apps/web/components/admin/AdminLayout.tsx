"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Building2,
  Users2,
  Receipt,
  Wallet,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function AdminLayout({ children, title, subtitle, action }: AdminLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Platform Overview", href: "/super-admin", icon: Building2 },
    { label: "Kelola Mitra", href: "/admin/partners", icon: Users2 },
    { label: "Transaksi Komisi", href: "/admin/partner-commissions", icon: Receipt },
    { label: "Penarikan Dana", href: "/admin/partner-withdrawals", icon: Wallet },
    { label: "Pengaturan Mitra", href: "/admin/partner-settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Top Navbar */}
      <header className="h-16 px-6 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-black">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">Super Admin Platform Control</h1>
            <p className="text-xs text-zinc-400 mt-1">Ordexa SaaS Platform & Partner Program</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/partner">
            <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 text-zinc-200 text-xs rounded-xl">
              Portal Mitra View <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
          <Link href="/restaurant">
            <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 text-zinc-200 text-xs rounded-xl">
              Restoran View
            </Button>
          </Link>
        </div>
      </header>

      {/* Admin Subnav */}
      <div className="bg-zinc-900/60 border-b border-zinc-800 px-6 py-2.5 overflow-x-auto flex items-center space-x-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5 mr-1.5" />
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
            {subtitle && <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>

        {children}
      </main>
    </div>
  );
}
