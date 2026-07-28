import { create } from "zustand";
import { apiClient } from "../api-client";

export type Plan = "free" | "pro" | "business" | "enterprise";

export interface DBTransaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  orderId: string;
  txnId: string | null;
  gatewayName: string | null;
  paymentMode: string | null;
  respMsg: string | null;
  planName: string;
  createdAt: string;
  updatedAt: string;
}

interface BillingState {
  currentPlan: Plan;
  transactions: DBTransaction[];
  aiCreditsUsed: number;
  aiCreditsTotal: number;
  storageUsedMb: number;
  storageQuotaMb: number;
  isLoading: boolean;
  upgradeLoading: boolean;
  fetchBillingData: () => Promise<void>;
  upgradePlan: (planId: Plan) => Promise<{
    success: boolean;
    paytmUrl?: string;
    orderId?: string;
    isMock?: boolean;
    txnToken?: string;
    mid?: string;
    error?: string;
    amount?: string;
  }>;
  downloadInvoice: (orderId: string) => void;
}

export const useBillingStore = create<BillingState>((set, _get) => ({
  currentPlan: "free",
  transactions: [],
  aiCreditsUsed: 0,
  aiCreditsTotal: 5,
  storageUsedMb: 0,
  storageQuotaMb: 512,
  isLoading: false,
  upgradeLoading: false,

  fetchBillingData: async () => {
    set({ isLoading: true });
    try {
      // Fetch user profile to get current plan and usage stats
      const userRes = await apiClient("/api/auth/me");
      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData?.user) {
          set({
            currentPlan: (userData.user.plan as Plan) || "free",
            aiCreditsUsed: userData.user.aiCreditsUsed || 0,
            aiCreditsTotal: userData.user.aiCreditsTotal || 5,
            storageUsedMb: userData.user.storageUsedMb || 0,
            storageQuotaMb: userData.user.storageQuotaMb || 512,
          });
        }
      }

      // Fetch transactions
      const txnsRes = await apiClient("/api/payments/paytm/history");
      if (txnsRes.ok) {
        const data = await txnsRes.json();
        set({ transactions: data.transactions || [] });
      }
    } catch (error) {
      console.error("Failed to fetch billing data", error);
    } finally {
      set({ isLoading: false });
    }
  },

  upgradePlan: async (planId) => {
    set({ upgradeLoading: true });
    try {
      const response = await apiClient("/api/payments/paytm/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || "Checkout request failed" };
      }

      if (planId === "free") {
        set({ currentPlan: "free" });
        return { success: true };
      }

      return {
        success: true,
        orderId: data.orderId,
        txnToken: data.txnToken,
        amount: data.amount,
        mid: data.mid,
        isMock: data.isMock,
        paytmUrl: data.paytmUrl,
      };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : "Failed to contact payment API" };
    } finally {
      set({ upgradeLoading: false });
    }
  },

  downloadInvoice: (orderId) => {
    window.open(`/api/payments/paytm/invoice?orderId=${orderId}`, "_blank");
  },
}));
