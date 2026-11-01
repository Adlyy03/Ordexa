"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  RefreshCw,
  ChefHat,
  Flame,
  Check,
  UtensilsCrossed,
} from "lucide-react";

interface OrderItem {
  id: number;
  name: string;
  variant: string | null;
  quantity: number;
  notes: string | null;
  price: number;
  subtotal: number;
}

interface OrderData {
  id: number;
  order_number: string;
  table?: { name: string };
  customer_name: string | null;
  status: "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  payment_status: string;
  order_type: string;
  notes: string | null;
  created_at: string;
  items: OrderItem[];
}

export default function KitchenDisplayPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "ready" | "all">("active");
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);
  const [completedItemIds, setCompletedItemIds] = useState<Record<number, boolean>>({});

  const previousOrderCountRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play kitchen bell chime using standard Web Audio API
  const playChime = useCallback(() => {
    if (!audioEnabled) return;
    try {
      const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio autoplay policy fallback
    }
  }, [audioEnabled]);

  const fetchOrders = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = { Accept: "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:8000/api/orders?status=pending,confirmed,preparing,ready", {
        headers,
      });

      if (res.ok) {
        const json = await res.json();
        const data: OrderData[] = json.data || [];
        setOrders(data);

        // Detect new orders and trigger sound
        if (previousOrderCountRef.current > 0 && data.length > previousOrderCountRef.current) {
          playChime();
        }
        previousOrderCountRef.current = data.length;
      }
    } catch (err) {
      console.error("Failed to fetch KDS orders", err);
    } finally {
      setLoading(false);
    }
  }, [playChime]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000); // 4-second reactive polling fallback
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: number, nextStatus: string) => {
    setActionInProgress(orderId);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:8000/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus as any } : o))
        );
      }
    } catch (err) {
      console.error("Failed to update order status", err);
    } finally {
      setActionInProgress(null);
    }
  };

  const toggleItemDone = (itemId: number) => {
    setCompletedItemIds((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const calculateMinutesElapsed = (createdAt: string) => {
    const elapsedMs = Date.now() - new Date(createdAt).getTime();
    return Math.floor(elapsedMs / 60000);
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "active") return ["pending", "confirmed", "preparing"].includes(order.status);
    if (activeTab === "ready") return order.status === "ready";
    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* KDS Header Bar */}
      <header className="h-16 px-6 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <ChefHat className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              Kitchen Display System
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-semibold">
                Live
              </span>
            </h1>
            <p className="text-xs text-zinc-400">Station Dapur & Pemrosesan Pesanan</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === "active"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Aktif ({orders.filter((o) => ["pending", "confirmed", "preparing"].includes(o.status)).length})
          </button>
          <button
            onClick={() => setActiveTab("ready")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === "ready"
                ? "bg-emerald-900/50 text-emerald-300 border border-emerald-800/40"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Siap Saji ({orders.filter((o) => o.status === "ready").length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === "all"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Semua ({orders.length})
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              audioEnabled
                ? "bg-zinc-800 border-zinc-700 text-white"
                : "bg-zinc-900 border-zinc-800 text-zinc-500"
            }`}
            title="Toggle Bell Sound"
          >
            {audioEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <button
            onClick={() => fetchOrders()}
            className="p-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Orders Grid Display */}
      <main className="flex-1 p-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-zinc-500 text-sm">
            Memuat pesanan dapur...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mb-4">
              <UtensilsCrossed className="h-7 w-7" />
            </div>
            <p className="text-base font-semibold text-zinc-300">Tidak ada antrean pesanan</p>
            <p className="text-xs text-zinc-500 mt-1">Pesanan baru akan muncul secara instan di layar ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredOrders.map((order) => {
              const minutes = calculateMinutesElapsed(order.created_at);
              const isUrgent = minutes >= 15;
              const isWarning = minutes >= 7 && minutes < 15;

              return (
                <div
                  key={order.id}
                  className={`flex flex-col rounded-2xl bg-zinc-900 border transition-all ${
                    order.status === "ready"
                      ? "border-emerald-600/40 bg-emerald-950/20"
                      : isUrgent
                      ? "border-red-600/50 shadow-lg shadow-red-950/20"
                      : isWarning
                      ? "border-amber-500/40"
                      : "border-zinc-800"
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black text-white tracking-tight">
                          {order.table?.name || "Meja ?"}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded font-mono bg-zinc-800 text-zinc-400">
                          #{order.order_number.slice(-4)}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 truncate max-w-[160px]">
                        {order.customer_name || "Tamu"}
                      </p>
                    </div>

                    {/* Timer Badge */}
                    <div
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                        isUrgent
                          ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                          : isWarning
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-zinc-800 text-zinc-300"
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      {minutes}m
                    </div>
                  </div>

                  {/* Customer Notes */}
                  {order.notes && (
                    <div className="mx-4 mt-3 px-3 py-2 rounded-xl bg-amber-950/30 border border-amber-800/40 text-amber-300 text-xs flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{order.notes}</span>
                    </div>
                  )}

                  {/* Items List */}
                  <div className="p-4 flex-1 space-y-2.5 overflow-y-auto max-h-72">
                    {order.items.map((item) => {
                      const isDone = completedItemIds[item.id];
                      return (
                        <div
                          key={item.id}
                          onClick={() => toggleItemDone(item.id)}
                          className={`p-2.5 rounded-xl border cursor-pointer select-none transition-all flex items-start justify-between gap-3 ${
                            isDone
                              ? "bg-zinc-950/60 border-zinc-800/50 opacity-40 line-through"
                              : "bg-zinc-800/40 border-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="h-6 w-6 rounded-lg bg-orange-600/20 text-orange-400 text-xs font-black flex items-center justify-center shrink-0">
                                {item.quantity}x
                              </span>
                              <span className="text-sm font-bold text-zinc-100">{item.name}</span>
                            </div>
                            {item.variant && (
                              <p className="text-xs text-orange-400 font-medium ml-8 mt-0.5">
                                {item.variant}
                              </p>
                            )}
                            {item.notes && (
                              <p className="text-xs text-zinc-400 italic ml-8 mt-0.5">
                                Catatan: {item.notes}
                              </p>
                            )}
                          </div>
                          <div
                            className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                              isDone
                                ? "bg-emerald-600 border-emerald-500 text-white"
                                : "border-zinc-700 bg-zinc-900"
                            }`}
                          >
                            {isDone && <Check className="h-3 w-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Touch Action Buttons */}
                  <div className="p-4 border-t border-zinc-800 bg-zinc-950/40 rounded-b-2xl">
                    {order.status === "pending" && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, "confirmed")}
                        disabled={actionInProgress === order.id}
                        className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Terima Pesanan
                      </button>
                    )}

                    {order.status === "confirmed" && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, "preparing")}
                        disabled={actionInProgress === order.id}
                        className="w-full h-12 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Flame className="h-4 w-4" />
                        Mulai Masak
                      </button>
                    )}

                    {order.status === "preparing" && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, "ready")}
                        disabled={actionInProgress === order.id}
                        className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
                      >
                        <UtensilsCrossed className="h-4 w-4" />
                        Pesanan Siap Saji
                      </button>
                    )}

                    {order.status === "ready" && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, "completed")}
                        disabled={actionInProgress === order.id}
                        className="w-full h-12 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-sm flex items-center justify-center gap-2 border border-zinc-700"
                      >
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        Selesai Disajikan
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
