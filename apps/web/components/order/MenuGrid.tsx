"use client";

import { useState } from "react";
import { MenuCategoryData, MenuItemData } from "@/services/order";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Check } from "lucide-react";
import Image from "next/image";

interface MenuGridProps {
  categories: MenuCategoryData[];
}

export function MenuGrid({ categories }: MenuGridProps) {
  const [activeCategory, setActiveCategory] = useState<number>(
    categories[0]?.id ?? 0
  );

  const cart = useCartStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Category Pills Navigation (Sticky) */}
      <div className="sticky top-[57px] z-30 bg-white/95 backdrop-blur-sm border-b border-zinc-200/80 px-4 py-2.5 overflow-x-auto no-scrollbar flex items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeCategory === cat.id
                ? "bg-zinc-950 text-white shadow-xs"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
            }`}
          >
            {cat.name} ({cat.items.length})
          </button>
        ))}
      </div>

      {/* Category Item Sections */}
      <div className="px-4 space-y-8">
        {categories
          .filter((cat) => activeCategory === 0 || cat.id === activeCategory)
          .map((cat) => (
            <div key={cat.id} className="space-y-3">
              <h2 className="text-base font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                {cat.name}
                <span className="text-xs font-normal text-zinc-400">
                  {cat.items.length} menu
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {cat.items.map((item) => {
                  const cartItem = cart.items.find(
                    (i) => i.menuItemId === item.id
                  );
                  const qty = cartItem?.quantity || 0;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl border border-zinc-200/80 p-3.5 flex gap-3 shadow-2xs hover:border-zinc-300 transition-colors"
                    >
                      {/* Item Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="font-semibold text-sm text-zinc-900 line-clamp-1">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-xs text-zinc-500 line-clamp-2 mt-1 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="font-bold text-sm text-zinc-950">
                            {formatPrice(item.price)}
                          </span>

                          {/* Add / Quantity Button */}
                          {qty === 0 ? (
                            <Button
                              size="sm"
                              className="h-8 px-3 rounded-lg text-xs font-medium bg-zinc-950 hover:bg-zinc-800"
                              onClick={() =>
                                cart.addItem({
                                  menuItemId: item.id,
                                  name: item.name,
                                  price: item.price,
                                  quantity: 1,
                                  variant: null,
                                  notes: null,
                                })
                              }
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Tambah
                            </Button>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-zinc-100 rounded-lg p-1 border border-zinc-200">
                              <button
                                onClick={() =>
                                  cart.updateQuantity(item.id, null, qty - 1)
                                }
                                className="h-6 w-6 rounded-md bg-white flex items-center justify-center text-zinc-800 shadow-2xs hover:bg-zinc-50 active:scale-95"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-5 text-center text-xs font-semibold text-zinc-900">
                                {qty}
                              </span>
                              <button
                                onClick={() =>
                                  cart.updateQuantity(item.id, null, qty + 1)
                                }
                                className="h-6 w-6 rounded-md bg-zinc-950 flex items-center justify-center text-white shadow-2xs hover:bg-zinc-800 active:scale-95"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Item Image thumbnail */}
                      {item.image_url && (
                        <div className="h-22 w-22 rounded-lg bg-zinc-100 relative overflow-hidden shrink-0 border border-zinc-100">
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
