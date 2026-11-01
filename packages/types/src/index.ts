// ============================================================
// Ordexa Shared TypeScript Types
// Used by apps/web and any future client packages
// ============================================================

// --------------- Auth ---------------
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
}

// --------------- Tenant / Restaurant ---------------
export type SubscriptionStatus =
  | "registered"
  | "pending_payment"
  | "active"
  | "grace_period"
  | "expired"
  | "suspended";

export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  subscription_status: SubscriptionStatus;
  active_package: Package | null;
  created_at: string;
}

// --------------- Branch ---------------
export interface DayHours {
  open: string;  // "08:00"
  close: string; // "22:00"
}

export type OperationalHours = Partial<
  Record<
    "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday",
    DayHours | null
  >
>;

export interface Branch {
  id: number;
  restaurant_id: number;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  operational_hours: OperationalHours | null;
  is_active: boolean;
  created_at: string;
}

// --------------- Table ---------------
export interface Table {
  id: number;
  branch_id: number;
  name: string;
  qr_token: string;
  qr_image_url: string | null;
  capacity: number;
  is_active: boolean;
}

// --------------- Menu ---------------
export interface MenuVariant {
  id: number;
  name: string;
  price_adjustment: number;
}

export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  variants: MenuVariant[];
  sort_order: number;
}

export interface MenuCategory {
  id: number;
  restaurant_id: number;
  name: string;
  sort_order: number;
  is_active: boolean;
  items: MenuItem[];
}

// --------------- Order ---------------
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "expired";
export type OrderType = "qr_order" | "pos_order";

export interface OrderItem {
  id: number;
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  variant: string | null;
  notes: string | null;
  subtotal: number;
}

export interface Order {
  id: number;
  order_number: string;
  branch_id: number;
  table_id: number;
  table?: Table;
  status: OrderStatus;
  payment_status: PaymentStatus;
  order_type: OrderType;
  subtotal: number;
  discount: number;
  total_amount: number;
  notes: string | null;
  customer_name: string | null;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

// --------------- Subscription & Packages ---------------
export type PackageName = "Starter" | "Professional" | "Enterprise";

export interface Package {
  id: number;
  name: PackageName;
  slug: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  sort_order: number;
  is_active: boolean;
}

export interface Subscription {
  id: number;
  restaurant_id: number;
  package: Package;
  status: Exclude<SubscriptionStatus, "registered">;
  billing_period: "monthly" | "yearly";
  amount: number;
  starts_at: string | null;
  ends_at: string | null;
  grace_ends_at: string | null;
  created_at: string;
}

// --------------- Membership ---------------
export type MembershipRole =
  | "owner"
  | "admin"
  | "manager"
  | "cashier"
  | "kitchen";

export interface RestaurantMembership {
  id: number;
  user_id: number;
  restaurant_id: number;
  role: MembershipRole;
  branch_id: number | null;
  is_active: boolean;
  restaurant?: Restaurant;
}

// --------------- API Helpers ---------------
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface ValidationError {
  field: string;
  messages: string[];
}
