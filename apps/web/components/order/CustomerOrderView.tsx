"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicMenu } from "@/services/order";
import { useCartStore } from "@/stores/cartStore";
import { MenuGrid } from "./MenuGrid";
import { CartDrawer } from "./CartDrawer";
import { OrderConfirmation } from "./OrderConfirmation";
import { UtensilsCrossed, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomerOrderViewProps {
  tenant: string;
  branch: string;
  table: string;
}

export function CustomerOrderView({
  tenant,
  branch,
  table,
}: CustomerOrderViewProps) {
  const [step, setStep] = useState<"menu" | "confirm" | "success">("menu");
  const cart = useCartStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["public-menu", tenant, branch, table],
    queryFn: () => getPublicMenu(tenant, branch, table),
    staleTime: 5 * 60 * 1000,
  });

  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col max-w-lg mx-auto">
        <header className="bg-white border-b border-zinc-100 px-4 py-3.5 animate-pulse">
          <div className="h-5 w-32 bg-zinc-200 rounded-md mb-1.5" />
          <div className="h-3.5 w-48 bg-zinc-100 rounded-md" />
        </header>
        <main className="p-4 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-24 bg-white rounded-xl border border-zinc-200/60 p-4 animate-pulse flex justify-between"
            >
              <div className="space-y-2 flex-1 mr-4">
                <div className="h-4 w-28 bg-zinc-200 rounded" />
                <div className="h-3 w-40 bg-zinc-100 rounded" />
                <div className="h-4 w-16 bg-zinc-200 rounded mt-2" />
              </div>
              <div className="h-16 w-16 bg-zinc-100 rounded-lg shrink-0" />
            </div>
          ))}
        </main>
      </div>
    );
  }

  // Error State
  if (error || !data) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-zinc-200/80 p-6 text-center space-y-4 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-900">
              Meja Tidak Ditemukan
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              QR code tidak valid atau restoran sedang tidak melayani pemesanan via meja ini.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="w-full text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Coba Muat Ulang
          </Button>
        </div>
      </div>
    );
  }

  // Success Screen
  if (step === "success") {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl border border-zinc-200/80 p-8 text-center space-y-5 shadow-sm">
          <div className="h-16 w-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              Pesanan Diterima Dapur
            </span>
            <h2 className="text-xl font-bold text-zinc-950 mt-3">
              Terima Kasih!
            </h2>
            <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">
              Pesanan Anda untuk <strong className="text-zinc-800">{data.table.name}</strong> sedang disiapkan oleh tim dapur {data.restaurant.name}.
            </p>
          </div>

          <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-100 text-xs text-zinc-600 space-y-1">
            <p>Cabang: {data.branch.name}</p>
            <p>Meja: {data.table.name}</p>
          </div>

          <Button
            onClick={() => setStep("menu")}
            className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-semibold h-11 rounded-xl"
          >
            Pesan Menu Tambahan
          </Button>
        </div>
      </div>
    );
  }

  // Normal Menu & Ordering View
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col max-w-lg mx-auto border-x border-zinc-200/60 shadow-xs relative">
      {/* Restaurant & Table Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-zinc-950 tracking-tight flex items-center gap-1.5">
            <UtensilsCrossed className="h-4 w-4 text-emerald-600" />
            {data.restaurant.name}
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {data.branch.name} · <strong className="text-zinc-700">{data.table.name}</strong>
          </p>
        </div>

        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          Dine-In
        </span>
      </header>

      {/* Menu Categories & Items Grid */}
      <main className="flex-1 pb-32">
        <MenuGrid categories={data.categories} />
      </main>

      {/* Floating Cart Drawer */}
      {cart.items.length > 0 && (
        <CartDrawer onCheckout={() => setStep("confirm")} />
      )}

      {/* Order Confirmation Screen */}
      {step === "confirm" && (
        <OrderConfirmation
          tenantSlug={tenant}
          branchSlug={branch}
          tableToken={table}
          onSuccess={() => setStep("success")}
          onBack={() => setStep("menu")}
        />
      )}
    </div>
  );
}
