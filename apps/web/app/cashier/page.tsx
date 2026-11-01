"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  QrCode,
  Banknote,
  Receipt,
  Search,
  CheckCircle2,
  Printer,
  ChevronRight,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
}

interface OrderRecord {
  id: number;
  order_number: string;
  table?: { name: string };
  customer_name: string | null;
  status: string;
  payment_status: "unpaid" | "pending" | "paid";
  total_amount: number;
  subtotal: number;
  created_at: string;
  items: OrderItem[];
}

export default function CashierStationPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris" | "card">("cash");
  const [cashAmount, setCashAmount] = useState<string>("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const fetchOrders = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:8000/api/orders?per_page=50", {
        headers,
      });

      if (res.ok) {
        const json = await res.json();
        const data = json.data || [];
        setOrders(data);
        if (!selectedOrder && data.length > 0) {
          setSelectedOrder(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load cashier orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleSettlePayment = async () => {
    if (!selectedOrder) return;

    if (paymentMethod === "cash") {
      const paid = parseInt(cashAmount.replace(/\D/g, ""), 10) || 0;
      if (paid < selectedOrder.total_amount) {
        toast.error("Jumlah uang tunai kurang dari total tagihan.");
        return;
      }
    }

    setProcessingPayment(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // In real backend, updates payment status
      await new Promise((r) => setTimeout(r, 600));

      toast.success(`Pembayaran untuk Meja ${selectedOrder.table?.name || ""} berhasil dicatat!`);

      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id ? { ...o, payment_status: "paid" } : o
        )
      );
      setSelectedOrder((prev) => (prev ? { ...prev, payment_status: "paid" } : null));
    } catch {
      toast.error("Gagal memproses pembayaran");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!selectedOrder) return;
    toast.info("Perintah cetak struk dikirim ke printer kasir (58/80mm)...");
    window.print();
  };

  const cashGiven = parseInt(cashAmount.replace(/\D/g, ""), 10) || 0;
  const changeAmount = selectedOrder ? Math.max(0, cashGiven - selectedOrder.total_amount) : 0;

  const filteredOrders = orders.filter((o) => {
    const tableMatch = o.table?.name.toLowerCase().includes(searchQuery.toLowerCase());
    const nameMatch = o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const numberMatch = o.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    return tableMatch || nameMatch || numberMatch;
  });

  return (
    <div className="h-screen bg-zinc-100 flex flex-col font-sans overflow-hidden">
      {/* Kasir Top Navigation */}
      <header className="h-14 px-6 bg-white border-b border-zinc-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-zinc-950 text-white flex items-center justify-center">
            <Receipt className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-900 leading-none">POS & Kasir Kasir Cabang</h1>
            <p className="text-[11px] text-zinc-500 mt-0.5">Ordexa Smart Point of Sale</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            Shift Kasir Aktif
          </span>
        </div>
      </header>

      {/* Main Split Layout: Left Orders List, Right Settlement Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Active Tables & Orders */}
        <section className="w-96 border-r border-zinc-200 bg-white flex flex-col">
          <div className="p-3 border-b border-zinc-200">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-zinc-400" />
              <Input
                placeholder="Cari Meja atau Tamu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-zinc-50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
            {loading ? (
              <div className="p-6 text-center text-xs text-zinc-400">Memuat transaksi...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-400">Tidak ada antrean pesanan</div>
            ) : (
              filteredOrders.map((order) => {
                const isSelected = selectedOrder?.id === order.id;
                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`p-3.5 cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-zinc-900 text-white"
                        : "hover:bg-zinc-50 text-zinc-800"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">
                          {order.table?.name || "Meja ?"}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                            isSelected
                              ? "bg-zinc-800 text-zinc-300"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          #{order.order_number.slice(-4)}
                        </span>
                      </div>
                      <p
                        className={`text-xs mt-0.5 ${
                          isSelected ? "text-zinc-400" : "text-zinc-500"
                        }`}
                      >
                        {order.customer_name || "Tamu"} • {order.items.length} Menu
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold font-mono">
                        {formatPrice(order.total_amount)}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                          order.payment_status === "paid"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {order.payment_status === "paid" ? "Lunas" : "Belum Bayar"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right Panel: Selected Order Settlement & Bill */}
        <section className="flex-1 bg-zinc-50 flex flex-col p-6 overflow-y-auto">
          {selectedOrder ? (
            <div className="max-w-3xl mx-auto w-full space-y-5">
              {/* Receipt Header Card */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                      Rincian Tagihan {selectedOrder.table?.name}
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          selectedOrder.payment_status === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {selectedOrder.payment_status === "paid" ? "Sudah Dibayar" : "Menunggu Pembayaran"}
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1">
                      No. Pesanan: <span className="font-mono font-medium">{selectedOrder.order_number}</span> •
                      Pelanggan: <span className="font-medium text-zinc-700">{selectedOrder.customer_name || "Tamu"}</span>
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrintReceipt}
                    className="gap-2 rounded-xl"
                  >
                    <Printer className="h-4 w-4" />
                    Cetak Struk
                  </Button>
                </div>

                {/* Items Breakdown Table */}
                <div className="divide-y divide-zinc-100 my-4 text-xs">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-zinc-900 mr-2">{item.quantity}x</span>
                        <span className="font-semibold text-zinc-800">{item.name}</span>
                        {item.notes && <p className="text-zinc-400 mt-0.5 italic">Catatan: {item.notes}</p>}
                      </div>
                      <span className="font-bold font-mono text-zinc-900">{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Total */}
                <div className="bg-zinc-50 rounded-xl p-4 space-y-1.5 border border-zinc-100 text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <span>Pajak Restoran (PB1)</span>
                    <span>Termasuk</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-200 flex justify-between text-base font-black text-zinc-900">
                    <span>Total Pembayaran</span>
                    <span className="font-mono text-emerald-600">{formatPrice(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Settlement Methods */}
              {selectedOrder.payment_status !== "paid" && (
                <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm space-y-5">
                  <h3 className="text-sm font-bold text-zinc-900">Pilih Metode Pembayaran</h3>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setPaymentMethod("cash")}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        paymentMethod === "cash"
                          ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
                          : "border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800"
                      }`}
                    >
                      <Banknote className="h-5 w-5 mb-2" />
                      <p className="text-xs font-bold">Tunai (Cash)</p>
                      <p className="text-[11px] opacity-70">Input uang diterima</p>
                    </button>

                    <button
                      onClick={() => setPaymentMethod("qris")}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        paymentMethod === "qris"
                          ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
                          : "border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800"
                      }`}
                    >
                      <QrCode className="h-5 w-5 mb-2" />
                      <p className="text-xs font-bold">QRIS Dinamis</p>
                      <p className="text-[11px] opacity-70">Scan di layar/struk</p>
                    </button>

                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        paymentMethod === "card"
                          ? "border-zinc-950 bg-zinc-950 text-white shadow-sm"
                          : "border-zinc-200 hover:border-zinc-300 bg-white text-zinc-800"
                      }`}
                    >
                      <CreditCard className="h-5 w-5 mb-2" />
                      <p className="text-xs font-bold">EDC / Kartu</p>
                      <p className="text-[11px] opacity-70">Debit atau Kredit</p>
                    </button>
                  </div>

                  {paymentMethod === "cash" && (
                    <div className="bg-zinc-50 rounded-xl p-4 space-y-3 border border-zinc-100">
                      <div>
                        <label className="text-xs font-semibold text-zinc-700">Uang Tunai Diterima</label>
                        <div className="mt-1 flex gap-2">
                          <Input
                            placeholder="Contoh: 100000"
                            value={cashAmount}
                            onChange={(e) => setCashAmount(e.target.value)}
                            className="bg-white font-mono text-sm"
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setCashAmount(String(selectedOrder.total_amount))}
                            className="text-xs shrink-0"
                          >
                            Uang Pas
                          </Button>
                        </div>
                      </div>

                      {cashGiven > 0 && (
                        <div className="pt-2 border-t border-zinc-200 flex justify-between text-xs font-bold">
                          <span className="text-zinc-600">Kembalian:</span>
                          <span className="font-mono text-sm text-emerald-600">
                            {formatPrice(changeAmount)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={handleSettlePayment}
                    disabled={processingPayment}
                    className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    {processingPayment ? (
                      "Memproses Transaksi..."
                    ) : (
                      <>
                        Konfirmasi Pembayaran ({formatPrice(selectedOrder.total_amount)})
                        <CheckCircle2 className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-400">
              <Receipt className="h-10 w-10 text-zinc-300 mb-2" />
              <p className="text-sm font-semibold text-zinc-600">Pilih meja untuk melihat transaksi</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
