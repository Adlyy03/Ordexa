const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface MenuItemVariant {
  name: string;
  price_adjustment: number;
}

export interface MenuItemData {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  variants: MenuItemVariant[] | null;
}

export interface MenuCategoryData {
  id: number;
  name: string;
  sort_order: number;
  items: MenuItemData[];
}

export interface PublicMenuData {
  restaurant: {
    id: number;
    name: string;
    slug: string;
    logo_url: string | null;
  };
  branch: {
    id: number;
    name: string;
    slug: string;
    address: string | null;
    phone: string | null;
  };
  table: {
    id: number;
    name: string;
    capacity: number;
    qr_token: string;
  };
  categories: MenuCategoryData[];
}

export async function submitPublicOrder(
  tenant: string,
  branch: string,
  table: string,
  payload: {
    customer_name?: string;
    notes?: string;
    items: Array<{
      menu_item_id: number;
      quantity: number;
      variant?: string;
      notes?: string;
    }>;
  }
) {
  const res = await fetch(
    `${API_BASE}/api/public/r/${tenant}/${branch}/${table}/order`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Gagal membuat pesanan.");
  }

  return res.json();
}

export async function getPublicMenu(
  tenant: string,
  branch: string,
  table: string
): Promise<PublicMenuData> {
  const res = await fetch(
    `${API_BASE}/api/public/r/${tenant}/${branch}/${table}`,
    {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Menu tidak ditemukan.");
  }

  const json = await res.json();
  return json.data as PublicMenuData;
}
