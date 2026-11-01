"use client";

import { useState } from "react";
import { useCartStore } from "@/stores/cartStore";
import { submitPublicOrder } from "@/services/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, CheckCircle2, ReceiptText } from "lucide-react";
import { toast } from "sonner";

interface OrderConfirmationProps {
  tenantSlug: string;
  branchSlug: string;
  tableToken: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function OrderConfirmation({
  tenantSlug,
  branchSlug,
  tableToken,
  onSuccess,
  onBack,
}: OrderConfirmationProps) {
  const cart = useCartStore();
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState(cart.customerName || "");
  const [tableNotes, setTableNotes] = useState(cart.notes || "");

  const total = cart.total();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleConfirmOrder = async () => {
    if (!customerName.trim()) {
      toast.error("Silakan masukkan nama pemesan.");
      return;
    }

    if (cart.items.length === 0) {
      toast.error("Keranjang pesanan masih kosong.");
      return;
    }

    setLoading(true);
    cart.setCustomerInfo(customerName, tableNotes);

    try {
      const orderPayload = {
        customer_name: customerName,
        notes: tableNotes || undefined,
        items: cart.items.map((item) => ({
          menu_item_id: item.menuItemId,
          quantity: item.quantity,
          variant: item.variant || undefined,
          notes: item.notes || undefined,
        })),
      };

      const result = await submitPublicOrder(
        tenantSlug,
        branchSlug,
        tableToken,
        orderPayload
      );

      toast.success(
        result.message || "Pesanan berhasil dikirim ke dapur!"
      );
      cart.clearCart();
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirim pesanan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col max-w-lg mx-auto">
      {/* Top Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-zinc-100 px-4 py-3.5 flex items-center gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="h-9 w-9 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-700 hover:bg-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h2 className="text-base font-bold text-zinc-900">Konfirmasi Pesanan</h2>
          <p className="text-xs text-zinc-500">Periksa kembali menu pilihan Anda</p>
        </div>
      </header>

      {/* Main Form & Summary */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {/* Customer Information Form */}
        <div className="bg-zinc-50 rounded-2xl border border-zinc-200/80 p-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="customer_name" className="text-xs font-semibold">
              Nama Pemesan <span className="text-red-500">*</span>
            </Label>
            <Input
              id="customer_name"
              placeholder="Contoh: Rian / Meja Depan"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={loading}
              className="bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="table_notes" className="text-xs font-semibold">
              Catatan Pesanan (Opsional)
            </Label>
            <Input
              id="table_notes"
              placeholder="Contoh: Sambal dipisah, es sedikit"
              value={tableNotes}
              onChange={(e) => setTableNotes(e.target.value)}
              disabled={loading}
              className="bg-white"
            />
          </div>
        </div>

        {/* Order Items Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <ReceiptText className="h-3.5 w-3.5" />
            Daftar Pesanan ({cart.items.length})
          </h3>

          <div className="bg-white rounded-xl border border-zinc-200/80 divide-y divide-zinc-100 px-4">
            {cart.items.map((item) => (
              <div
                key={`${item.menuItemId}-${item.variant}`}
                className="py-3 flex items-center justify-between text-sm"
              >
                <div>
                  <p className="font-semibold text-zinc-900">
                    <span className="font-bold text-emerald-600 mr-2">
                      {item.quantity}x
                    </span>
                    {item.name}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-zinc-400 mt-0.5">Catatan: {item.notes}</p>
                  )}
                </div>
                <span className="font-semibold text-zinc-900">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total calculation */}
        <div className="bg-zinc-50 rounded-xl p-4 space-y-2 border border-zinc-200/80">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Subtotal</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-xs text-zinc-500">
            <span>Pajak Restoran (PB1)</span>
            <span>Termasuk</span>
          </div>
          <div className="pt-2 border-t border-zinc-200 flex justify-between text-base font-bold text-zinc-950">
            <span>Total Pembayaran</span>
            <span className="text-emerald-600">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="p-4 border-t border-zinc-200 bg-white">
        <Button
          onClick={handleConfirmOrder}
          disabled={loading || cart.items.length === 0}
          className="w-full h-12 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-bold shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mengirim ke Dapur...
            </>
          ) : (
            <>
              Kirim Pesanan ke Dapur
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
