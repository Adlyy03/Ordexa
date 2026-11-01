import { apiFetch } from "./auth";

export interface PartnerMeResponse {
  is_partner: boolean;
  partner: {
    id: number;
    referral_code: string;
    status: "pending" | "approved" | "rejected" | "suspended";
    rejection_reason?: string | null;
    bank_name?: string | null;
    bank_account_number?: string | null;
    bank_account_name?: string | null;
    approved_at?: string | null;
    created_at: string;
  } | null;
}

export interface PartnerDashboardStats {
  stats: {
    total_referrals: number;
    converted_referrals: number;
    active_subscriptions: number;
    total_earned: number;
    available_balance: number;
    pending_withdrawal: number;
    paid_withdrawal: number;
  };
  recent_referrals: Array<{
    id: number;
    restaurant_name: string;
    status: string;
    registered_at: string;
    converted_at?: string | null;
  }>;
  recent_commissions: Array<{
    id: number;
    restaurant_name: string;
    commission_type: string;
    commission_amount: number;
    status: string;
    created_at: string;
  }>;
}

export interface PartnerReferralsResponse {
  referral_code: string;
  referral_link: string;
  data: Array<{
    id: number;
    restaurant_name: string;
    restaurant_slug: string;
    subscription_status: string;
    package_name: string;
    conversion_status: string;
    registered_at: string;
    converted_at?: string | null;
  }>;
}

export interface PartnerCommissionsResponse {
  summary: {
    total_earned: number;
    available_balance: number;
  };
  data: Array<{
    id: number;
    restaurant_name: string;
    commission_type: string;
    commission_rate?: number | null;
    commission_amount: number;
    status: "pending" | "available" | "paid" | "reversed";
    note?: string | null;
    created_at: string;
  }>;
}

export interface PartnerWithdrawalsResponse {
  balance: {
    available_balance: number;
    pending_withdrawal: number;
    paid_withdrawal: number;
    minimum_withdrawal: number;
  };
  saved_payout_info: {
    bank_name?: string | null;
    bank_account_number?: string | null;
    bank_account_name?: string | null;
  };
  data: Array<{
    id: number;
    amount: number;
    payout_method: string;
    payout_provider: string;
    payout_account_number: string;
    payout_account_name: string;
    status: "pending" | "approved" | "rejected" | "paid";
    admin_note?: string | null;
    payment_reference?: string | null;
    created_at: string;
    processed_at?: string | null;
  }>;
}

export interface PartnerRegisterPayload {
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
  terms_accepted: boolean;
}

export interface PartnerWithdrawalPayload {
  amount: number;
  payout_provider: string;
  payout_account_number: string;
  payout_account_name: string;
  payout_method?: string;
}

// Admin Types
export interface AdminPartnerRecord {
  id: number;
  user_name: string;
  user_email: string;
  referral_code: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
  total_referrals: number;
  converted_referrals: number;
  total_earned: number;
  available_balance: number;
  rejection_reason?: string | null;
  approved_at?: string | null;
  created_at: string;
}

export interface AdminCommissionRecord {
  id: number;
  partner_id: number;
  partner_name: string;
  partner_email: string;
  referral_code: string;
  restaurant_name: string;
  commission_type: string;
  commission_rate?: number | null;
  commission_amount: number;
  status: string;
  note?: string | null;
  created_at: string;
}

export interface AdminWithdrawalRecord {
  id: number;
  partner_id: number;
  partner_name: string;
  partner_email: string;
  referral_code: string;
  amount: number;
  payout_method: string;
  payout_provider: string;
  payout_account_number: string;
  payout_account_name: string;
  status: "pending" | "approved" | "rejected" | "paid";
  admin_note?: string | null;
  payment_reference?: string | null;
  processed_by_name?: string | null;
  created_at: string;
  processed_at?: string | null;
}

export interface PartnerSettingsData {
  id: number;
  commission_type: "percentage" | "fixed";
  commission_rate: number;
  fixed_amount: number;
  is_recurring: boolean;
  commission_duration_months: number;
  minimum_withdrawal: number;
  attribution_days: number;
  is_active: boolean;
}

export const partnerService = {
  // Public
  async validateCode(code: string) {
    return apiFetch<{ valid: boolean; code?: string; partner_name?: string }>(
      `/api/partner/public/validate-code/${code}`
    );
  },

  // Partner Portal
  async getMe() {
    return apiFetch<PartnerMeResponse>("/api/partner/me");
  },

  async register(payload: PartnerRegisterPayload) {
    return apiFetch<{ message: string; data: any }>("/api/partner/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async getDashboard() {
    return apiFetch<PartnerDashboardStats>("/api/partner/dashboard");
  },

  async getReferrals() {
    return apiFetch<PartnerReferralsResponse>("/api/partner/referrals");
  },

  async getCommissions(status?: string) {
    const query = status ? `?status=${status}` : "";
    return apiFetch<PartnerCommissionsResponse>(`/api/partner/commissions${query}`);
  },

  async getWithdrawals() {
    return apiFetch<PartnerWithdrawalsResponse>("/api/partner/withdrawals");
  },

  async requestWithdrawal(payload: PartnerWithdrawalPayload) {
    return apiFetch<{ message: string; data: any }>("/api/partner/withdrawals", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Admin Portal
  async getAdminPartners(params: { status?: string; search?: string } = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.search) query.set("search", params.search);
    return apiFetch<{ data: AdminPartnerRecord[] }>(`/api/super-admin/partners?${query.toString()}`);
  },

  async approvePartner(partnerId: number) {
    return apiFetch<{ message: string; data: any }>(`/api/super-admin/partners/${partnerId}/approve`, {
      method: "POST",
    });
  },

  async rejectPartner(partnerId: number, reason: string) {
    return apiFetch<{ message: string; data: any }>(`/api/super-admin/partners/${partnerId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  async suspendPartner(partnerId: number, reason?: string) {
    return apiFetch<{ message: string; data: any }>(`/api/super-admin/partners/${partnerId}/suspend`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  async reactivatePartner(partnerId: number) {
    return apiFetch<{ message: string; data: any }>(`/api/super-admin/partners/${partnerId}/reactivate`, {
      method: "POST",
    });
  },

  async getAdminCommissions(params: { status?: string; partner_id?: number } = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== "all") query.set("status", params.status);
    if (params.partner_id) query.set("partner_id", String(params.partner_id));
    return apiFetch<{
      summary: { total_commissions_count: number; total_commissions_amount: number; pending_commissions_amount: number };
      data: AdminCommissionRecord[];
    }>(`/api/super-admin/partner-commissions?${query.toString()}`);
  },

  async adjustCommission(payload: { partner_id: number; amount: number; reason: string }) {
    return apiFetch<{ message: string; data: any }>("/api/super-admin/partner-commissions/adjust", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async reverseCommission(commissionId: number, reason: string) {
    return apiFetch<{ message: string; data: any }>(
      `/api/super-admin/partner-commissions/${commissionId}/reverse`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      }
    );
  },

  async getAdminWithdrawals(params: { status?: string } = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== "all") query.set("status", params.status);
    return apiFetch<{
      summary: { pending_count: number; pending_amount: number; paid_count: number; paid_amount: number };
      data: AdminWithdrawalRecord[];
    }>(`/api/super-admin/partner-withdrawals?${query.toString()}`);
  },

  async approveWithdrawal(withdrawalId: number, admin_note?: string) {
    return apiFetch<{ message: string; data: any }>(
      `/api/super-admin/partner-withdrawals/${withdrawalId}/approve`,
      {
        method: "POST",
        body: JSON.stringify({ admin_note }),
      }
    );
  },

  async rejectWithdrawal(withdrawalId: number, reason: string) {
    return apiFetch<{ message: string; data: any }>(
      `/api/super-admin/partner-withdrawals/${withdrawalId}/reject`,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      }
    );
  },

  async markWithdrawalPaid(withdrawalId: number, payment_reference: string, admin_note?: string) {
    return apiFetch<{ message: string; data: any }>(
      `/api/super-admin/partner-withdrawals/${withdrawalId}/pay`,
      {
        method: "POST",
        body: JSON.stringify({ payment_reference, admin_note }),
      }
    );
  },

  async getSettings() {
    return apiFetch<{ data: PartnerSettingsData }>("/api/super-admin/partner-settings");
  },

  async updateSettings(payload: Partial<PartnerSettingsData>) {
    return apiFetch<{ message: string; data: PartnerSettingsData }>(
      "/api/super-admin/partner-settings",
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );
  },
};
