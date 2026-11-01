"use client";

import { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight, X, Plus, Minus, Trash2 } from "lucide-react";

interface CartDrawerProps {
  onCheckout: () => void;
}

export function CartDrawer({ onCheckout }: CartDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const cart = useCartStore();

  const count = cart.itemCount();
  const total = cart.total();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (count === 0) return null;

  return (
    <>
      {/* Floating Bottom Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 p-4 bg-gradient-to-t from-zinc-950/20 to-transparent pointer-events-none">
        <div className="max-w-lg mx-auto pointer-events-auto">
          <div className="bg-zinc-950 text-white rounded-2xl p-3.5 shadow-xl flex items-center justify-between border border-zinc-800">
            <button
              onClick={() => setIsOpen(true)}
              className="flex items-center gap-3 text-left pl-1"
            >
              <div className="h-9 w-9 rounded-xl bg-zinc-800 flex items-center justify-center font-bold text-sm text-emerald-400">
                {count}
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-medium">Total Pesanan</p>
                <p className="text-sm font-bold tracking-tight text-white">
                  {formatPrice(total)}
                </p>
              </div>
            </button>

            <Button
              onClick={onCheckout}
              className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold h-10 px-5 rounded-xl shadow-xs"
            >
              Pesan Sekarang
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Cart Modal / Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-zinc-950/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Header */}
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-zinc-900 text-base">Rincian Pesanan</h3>
                <p className="text-xs text-zinc-500">{count} menu dipilih</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 hover:bg-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-5 py-3 divide-y divide-zinc-100 space-y-2">
              {cart.items.map((item) => (
                <div
                  key={`${item.menuItemId}-${item.variant}`}
                  className="pt-2 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 bg-zinc-100 rounded-lg p-1 border border-zinc-200">
                    <button
                      onClick={() =>
                        cart.updateQuantity(item.menuItemId, item.variant, item.quantity - 1)
                      }
                      className="h-6 w-6 rounded-md bg-white flex items-center justify-center text-zinc-800 shadow-2xs hover:bg-zinc-50 active:scale-95"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-semibold text-zinc-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        cart.updateQuantity(item.menuItemId, item.variant, item.quantity + 1)
                      }
                      className="h-6 w-6 rounded-md bg-zinc-950 flex items-center justify-center text-white shadow-2xs hover:bg-zinc-800 active:scale-95"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <span className="w-20 text-right text-xs font-bold text-zinc-950">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Sheet Footer */}
            <div className="p-5 border-t border-zinc-100 space-y-3 bg-zinc-50 rounded-b-2xl">
              <div className="flex items-center justify-between text-sm font-semibold text-zinc-900">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => cart.clearCart()}
                  className="text-zinc-600 hover:text-red-600 hover:bg-red-50 border-zinc-200"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    onCheckout();
                  }}
                  className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white font-bold h-11 rounded-xl"
                >
                  Lanjut Konfirmasi
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
