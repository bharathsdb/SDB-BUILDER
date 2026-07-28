export interface PlanDetails {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  credits: number;
  storageGb: number;
  maxProjects: number;
  features: string[];
  unsupportedFeatures: string[];
  cta: string;
}

export const SUBSCRIPTION_PLANS: Record<string, PlanDetails> = {
  free: {
    id: "free",
    name: "Free Plan",
    priceMonthly: 0,
    priceYearly: 0,
    credits: 5,
    storageGb: 0.5,
    maxProjects: 3,
    features: [
      "Basic 2D Floor Plan creation",
      "Standard resolution export (720p)",
      "Single project active collaboration",
      "Community support"
    ],
    unsupportedFeatures: [
      "Advanced 3D Render Engine",
      "Paytm invoice generation & GST billing",
      "12-Stage Multi-Agent AI suggestions",
      "Image-to-plan computer vision converter",
      "Priority rendering queue",
      "Enterprise security controls"
    ],
    cta: "Current Plan"
  },
  pro: {
    id: "pro",
    name: "Pro Plan",
    priceMonthly: 2499,
    priceYearly: 23990,
    credits: 100,
    storageGb: 10,
    maxProjects: 50,
    features: [
      "Advanced 2D/3D Floor Plan rendering",
      "100 AI credits per month",
      "HD blueprint exports (1080p, PDF, GLB)",
      "Full 12-Stage Multi-Agent AI engine suggestions",
      "Image-to-plan computer vision converter",
      "Paytm secure billing with automated invoices",
      "Priority email support"
    ],
    unsupportedFeatures: [
      "Team collaboration dashboard (unlimited members)",
      "Custom branding & white-label reports",
      "Dedicated account manager",
      "Custom Vastu rules integrations"
    ],
    cta: "Upgrade to Pro"
  },
  business: {
    id: "business",
    name: "Business Plan",
    priceMonthly: 7999,
    priceYearly: 76790,
    credits: 500,
    storageGb: 50,
    maxProjects: 200,
    features: [
      "Everything in Pro Plan",
      "500 AI credits per month",
      "4K rendering & high-fidelity exports",
      "Team workspace (up to 5 team members)",
      "Custom branding on PDF/Blueprint reports",
      "Priority render queue",
      "Phone support & dedicated representative"
    ],
    unsupportedFeatures: [
      "Unlimited AI credits",
      "Single Sign-On (SSO) integration",
      "API access for external custom renderers"
    ],
    cta: "Upgrade to Business"
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise Plan",
    priceMonthly: 19999,
    priceYearly: 191990,
    credits: 2000,
    storageGb: 500,
    maxProjects: 9999,
    features: [
      "Everything in Business Plan",
      "2000 AI credits per month",
      "Unlimited team members & project shares",
      "Custom building code & Vastu API integration",
      "Dedicated account manager & 24/7 hotline",
      "SSO & advanced enterprise security compliance",
      "Custom service-level agreement (SLA)"
    ],
    unsupportedFeatures: [],
    cta: "Contact Enterprise"
  }
};
