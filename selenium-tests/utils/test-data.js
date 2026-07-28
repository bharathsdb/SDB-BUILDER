const TEST_USER = {
  email: "testuser@plancraft.test",
  password: "TestPass123!",
  name: "Test User",
  firstName: "Test",
  lastName: "User",
};

const ANON_EMAIL = "anon_test@plancraft.app";

const INVALID_EMAIL = "not-an-email";
const WEAK_PASSWORD = "12";

const PLOT_DIMENSIONS = {
  length: "60",
  width: "40",
};

const FACING_DIRECTIONS = ["North", "East", "South", "West"];

const ROOM_COUNTS = {
  bedrooms: 3,
  bathrooms: 2,
  kitchens: 1,
  livingRooms: 2,
  parking: 1,
  floors: 1,
};

const ARCHITECTURAL_STYLES = [
  "Modern",
  "Contemporary",
  "Scandinavian",
  "Mediterranean",
  "Farmhouse",
  "Minimalist",
];

const BUDGET_TIERS = ["Economy", "Standard", "Premium", "Ultra Luxury"];

const SETTINGS_TABS = [
  "profile",
  "account",
  "preferences",
  "notifications",
  "security",
];

const NOTIFICATION_TYPES = ["email", "push", "inApp", "marketing"];

const LANGUAGES = ["en", "es", "fr", "de", "hi"];

const PUBLIC_PAGES = [
  { path: "/about", title: "About" },
  { path: "/features", title: "Features" },
  { path: "/pricing", title: "Pricing" },
  { path: "/blog", title: "Blog" },
  { path: "/contact", title: "Contact" },
  { path: "/faq", title: "FAQ" },
  { path: "/gallery", title: "Gallery" },
  { path: "/privacy", title: "Privacy" },
  { path: "/terms", title: "Terms" },
  { path: "/security", title: "Security" },
  { path: "/architects", title: "Architects" },
  { path: "/builders", title: "Builders" },
  { path: "/showcase", title: "Showcase" },
  { path: "/solutions", title: "Solutions" },
  { path: "/enterprise", title: "Enterprise" },
  { path: "/docs", title: "Docs" },
  { path: "/careers", title: "Careers" },
  { path: "/api-docs", title: "API Docs" },
];

module.exports = {
  TEST_USER,
  ANON_EMAIL,
  INVALID_EMAIL,
  WEAK_PASSWORD,
  PLOT_DIMENSIONS,
  FACING_DIRECTIONS,
  ROOM_COUNTS,
  ARCHITECTURAL_STYLES,
  BUDGET_TIERS,
  SETTINGS_TABS,
  NOTIFICATION_TYPES,
  LANGUAGES,
  PUBLIC_PAGES,
};
