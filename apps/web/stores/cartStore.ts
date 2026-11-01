import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  variant: string | null;
  notes: string | null;
  subtotal: number;
}

export interface CartStore {
  items: CartItem[];
  customerName: string;
  notes: string;
  tableToken: string | null;
  setCustomerInfo: (name: string, notes?: string) => void;
  setTableToken: (token: string) => void;
  addItem: (item: Omit<CartItem, "subtotal">) => void;
  removeItem: (menuItemId: number, variant: string | null) => void;
  updateQuantity: (menuItemId: number, variant: string | null, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      customerName: "",
      notes: "",
      tableToken: null,

      setCustomerInfo: (customerName, notes = "") => set({ customerName, notes }),
      setTableToken: (tableToken) => set({ tableToken }),

      addItem: (item) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.menuItemId === item.menuItemId && i.variant === item.variant
          );

          if (existingIndex > -1) {
            const updated = [...state.items];
            const existing = updated[existingIndex];
            const newQty = existing.quantity + item.quantity;
            updated[existingIndex] = {
              ...existing,
              quantity: newQty,
              subtotal: newQty * existing.price,
              notes: item.notes || existing.notes,
            };
            return { items: updated };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                subtotal: item.quantity * item.price,
              },
            ],
          };
        });
      },

      removeItem: (menuItemId, variant) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.menuItemId === menuItemId && i.variant === variant)
          ),
        }));
      },

      updateQuantity: (menuItemId, variant, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId, variant);
          return;
        }

        set((state) => ({
          items: state.items.map((i) =>
            i.menuItemId === menuItemId && i.variant === variant
              ? { ...i, quantity, subtotal: quantity * i.price }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [], customerName: "", notes: "" }),
      total: () => get().items.reduce((sum, i) => sum + i.subtotal, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: "ordexa-customer-cart",
    }
  )
);
