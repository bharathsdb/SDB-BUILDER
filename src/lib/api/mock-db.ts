export interface User {
  id: string; name: string; email: string; avatar?: string; 
  role: "user" | "admin" | "architect" | "builder" | "designer";
  plan: "free" | "pro" | "enterprise"; createdAt: string; verified: boolean;
  company?: string; country?: string; phone?: string; bio?: string;
  aiCreditsUsed: number; aiCreditsTotal: number; storageUsedMb: number;
  storageQuotaMb: number; projectsCount: number;
}

export interface Project {
  id: string; name: string; description: string; userId: string;
  plotLength: number; plotWidth: number; facing: string; floors: number;
  budgetTier: string; style: string; vastu: boolean; status: "draft" | "completed" | "generating" | "archived";
  thumbnail?: string; createdAt: string; updatedAt: string; teamId?: string;
  rooms: Room[]; materials: Material[]; costEstimate?: CostEstimate;
  tags?: string[]; shared?: boolean; shareUrl?: string; viewCount?: number;
  vastuScore?: number; sustainabilityScore?: number; stars?: number;
}

export interface Room { 
  id: string; name: string; width: number; length: number; level: number; 
  area?: number; ceiling?: number; type?: string; color?: string;
}
export interface Material { 
  id: string; name: string; type: string; cost: number; unit: string; 
  brand?: string; color?: string; sustainability?: number; inStock?: boolean;
}
export interface CostEstimate { 
  foundation: number; concrete: number; steel: number; brick: number; 
  flooring: number; plumbing: number; electrical: number; labor: number; 
  total: number; contingency?: number; designFees?: number;
  breakdownPercent?: Record<string, number>;
}
export interface Template { 
  id: string; name: string; description: string; thumbnail: string; 
  rooms: number; floors: number; style: string; category: string; 
  popular?: boolean; premium?: boolean; downloads?: number; rating?: number;
  plotSize?: string; tags?: string[];
}
export interface MarketplaceListing { 
  id: string; name: string; type: "architect" | "designer" | "engineer" | "builder"; 
  description: string; rating: number; reviews: number; price: number; 
  location: string; available: boolean; image: string; 
  portfolio?: string[]; specializations?: string[]; experience?: number;
  projects?: number; verified?: boolean; responseTime?: string;
  education?: string; languages?: string[];
}
export interface Notification { 
  id: string; userId: string; title: string; message: string; 
  type: "info" | "success" | "warning" | "error"; read: boolean; createdAt: string;
  link?: string; category?: "system" | "project" | "team" | "billing" | "ai";
}
export interface BlogPost { 
  id: string; slug: string; title: string; excerpt: string; content: string; 
  author: string; authorRole?: string; authorAvatar?: string;
  image: string; category: string; date: string; readTime: number; 
  featured?: boolean; views?: number; likes?: number; tags?: string[];
}
export interface TeamMember { 
  id: string; name: string; email: string; role: string; avatar: string; 
  online: boolean; lastSeen?: string; permissions?: string[];
  joinedAt?: string; projectsAccess?: string[];
}
export interface GenerationHistory { 
  id: string; prompt: string; result: string; type: string; createdAt: string;
  projectId?: string; creditsUsed?: number; duration?: number; status?: "success" | "failed";
  model?: string;
}
export interface Invoice {
  id: string; userId: string; amount: number; currency: string; status: "paid" | "pending" | "failed";
  description: string; createdAt: string; dueAt: string; pdfUrl?: string; planName?: string;
}
export interface PaymentMethod {
  id: string; userId: string; type: "card" | "upi" | "bank"; last4?: string; 
  brand?: string; expiryMonth?: number; expiryYear?: number; isDefault: boolean;
  upiId?: string; bankName?: string;
}
export interface Review {
  id: string; userId: string; userName: string; userAvatar?: string;
  listingId: string; rating: number; title: string; content: string; createdAt: string;
  helpful?: number; verified?: boolean;
}
export interface JobListing {
  id: string; title: string; department: string; location: string; type: "full-time" | "part-time" | "contract" | "remote";
  description: string; requirements: string[]; benefits: string[];
  salary?: string; postedAt: string; applicants?: number; featured?: boolean;
}
export interface ApiKey {
  id: string; userId: string; name: string; key: string; createdAt: string;
  lastUsed?: string; permissions: string[]; active: boolean;
}

// ===================== MOCK DATA =====================

export const mockUsers: User[] = [
  { id: "u1", name: "John Doe", email: "john@example.com", role: "user", plan: "pro", createdAt: "2025-01-15", verified: true, country: "India", company: "Self", bio: "Home enthusiast building my dream house.", aiCreditsUsed: 47, aiCreditsTotal: 100, storageUsedMb: 2340, storageQuotaMb: 10240, projectsCount: 4 },
  { id: "u2", name: "Sarah Chen", email: "sarah@example.com", role: "architect", plan: "enterprise", createdAt: "2025-02-20", verified: true, company: "Chen Architects", country: "Singapore", bio: "Award-winning residential architect.", aiCreditsUsed: 312, aiCreditsTotal: 1000, storageUsedMb: 18560, storageQuotaMb: 102400, projectsCount: 23 },
  { id: "u3", name: "Admin User", email: "admin@plancraftai.com", role: "admin", plan: "enterprise", createdAt: "2024-11-01", verified: true, company: "PlanCraftAI", country: "US", aiCreditsUsed: 0, aiCreditsTotal: 0, storageUsedMb: 0, storageQuotaMb: 0, projectsCount: 0 },
  { id: "u4", name: "Mike Builder", email: "mike@example.com", role: "builder", plan: "pro", createdAt: "2025-03-10", verified: true, company: "BuildRight Inc.", country: "UAE", aiCreditsUsed: 89, aiCreditsTotal: 100, storageUsedMb: 5120, storageQuotaMb: 10240, projectsCount: 11 },
  { id: "u5", name: "Priya Sharma", email: "priya@example.com", role: "designer", plan: "pro", createdAt: "2025-04-01", verified: true, company: "InStyle Interiors", country: "India", aiCreditsUsed: 73, aiCreditsTotal: 100, storageUsedMb: 7680, storageQuotaMb: 10240, projectsCount: 8 },
  { id: "u6", name: "Demo User", email: "demo@plancraft.ai", role: "user", plan: "pro", createdAt: "2025-01-01", verified: true, company: "Demo Corp", country: "US", aiCreditsUsed: 5, aiCreditsTotal: 100, storageUsedMb: 120, storageQuotaMb: 10240, projectsCount: 2 },
];

export const mockProjects: Project[] = [
  { 
    id: "p1", name: "Modern Luxury Villa", description: "A 5-bedroom modern villa with open plan living, rooftop terrace, and smart home features", userId: "u6", plotLength: 60, plotWidth: 40, facing: "East", floors: 2, budgetTier: "Premium", style: "Modern", vastu: true, status: "completed", createdAt: "2025-03-01", updatedAt: "2025-03-05", shared: true, shareUrl: "https://plancraftai.com/share/p1", viewCount: 1243, vastuScore: 92, sustainabilityScore: 78, stars: 4,
    rooms: [
      { id: "r1", name: "Living Room", width: 20, length: 25, level: 0, type: "living", area: 500 }, 
      { id: "r2", name: "Master Bedroom", width: 16, length: 18, level: 0, type: "bedroom", area: 288 }, 
      { id: "r3", name: "Kitchen", width: 12, length: 15, level: 0, type: "kitchen", area: 180 }, 
      { id: "r4", name: "Bedroom 2", width: 14, length: 14, level: 1, type: "bedroom", area: 196 }, 
      { id: "r5", name: "Bedroom 3", width: 13, length: 14, level: 1, type: "bedroom", area: 182 },
      { id: "r6", name: "Study", width: 10, length: 12, level: 1, type: "office", area: 120 },
      { id: "r7", name: "Bathroom 1", width: 8, length: 10, level: 0, type: "bathroom", area: 80 },
      { id: "r8", name: "Bathroom 2", width: 8, length: 10, level: 1, type: "bathroom", area: 80 },
    ], 
    materials: [
      { id: "m1", name: "Red Brick", type: "masonry", cost: 8, unit: "sqft", brand: "UltraTech", sustainability: 75, inStock: true }, 
      { id: "m2", name: "Marble Flooring", type: "flooring", cost: 120, unit: "sqft", brand: "Kajaria", sustainability: 60, inStock: true },
      { id: "m3", name: "Teak Wood Doors", type: "woodwork", cost: 250, unit: "piece", brand: "Durian", sustainability: 55, inStock: true },
    ], 
    costEstimate: { foundation: 45000, concrete: 32000, steel: 28000, brick: 18000, flooring: 35000, plumbing: 15000, electrical: 12000, labor: 40000, contingency: 10000, designFees: 8000, total: 243000 } 
  },
  { 
    id: "p2", name: "Compact Urban Duplex", description: "A compact 3-bedroom duplex optimized for urban living with shared amenities", userId: "u6", plotLength: 30, plotWidth: 40, facing: "North", floors: 2, budgetTier: "Standard", style: "Contemporary", vastu: true, status: "completed", createdAt: "2025-03-10", updatedAt: "2025-03-12", vastuScore: 85, sustainabilityScore: 82, viewCount: 567,
    rooms: [
      { id: "r9", name: "Living Room", width: 15, length: 20, level: 0, area: 300 }, 
      { id: "r10", name: "Master Bedroom", width: 12, length: 14, level: 0, area: 168 }, 
      { id: "r11", name: "Kitchen", width: 10, length: 12, level: 0, area: 120 }, 
      { id: "r12", name: "Bedroom 2", width: 11, length: 12, level: 1, area: 132 },
      { id: "r13", name: "Bedroom 3", width: 11, length: 12, level: 1, area: 132 },
    ], 
    materials: [
      { id: "m4", name: "Fly Ash Brick", type: "masonry", cost: 6, unit: "sqft", sustainability: 85, inStock: true }, 
      { id: "m5", name: "Vitrified Tiles", type: "flooring", cost: 60, unit: "sqft", sustainability: 70, inStock: true },
    ], 
    costEstimate: { foundation: 28000, concrete: 20000, steel: 18000, brick: 12000, flooring: 22000, plumbing: 10000, electrical: 8000, labor: 25000, contingency: 5000, designFees: 3000, total: 151000 } 
  },
  { 
    id: "p3", name: "Scandinavian Apartment", description: "A cozy 2-bedroom apartment with Nordic minimalist design philosophy", userId: "u6", plotLength: 0, plotWidth: 0, facing: "South", floors: 1, budgetTier: "Standard", style: "Scandinavian", vastu: false, status: "draft", createdAt: "2025-03-15", updatedAt: "2025-03-15",
    rooms: [], materials: [], costEstimate: undefined 
  },
  { 
    id: "p4", name: "Beachfront Villa", description: "Luxury beachfront property with panoramic ocean views and infinity pool", userId: "u2", plotLength: 80, plotWidth: 60, facing: "West", floors: 3, budgetTier: "Ultra Luxury", style: "Mediterranean", vastu: false, status: "generating", createdAt: "2025-03-18", updatedAt: "2025-03-18",
    rooms: [], materials: [], costEstimate: undefined 
  },
  { 
    id: "p5", name: "Farmhouse Retreat", description: "A rustic 4-bedroom farmhouse with barn, garden, and outdoor entertainment", userId: "u1", plotLength: 100, plotWidth: 80, facing: "North", floors: 1, budgetTier: "Premium", style: "Farmhouse", vastu: true, status: "completed", createdAt: "2025-04-01", updatedAt: "2025-04-10", vastuScore: 88, sustainabilityScore: 90,
    rooms: [
      { id: "r14", name: "Great Room", width: 30, length: 40, level: 0, area: 1200 },
      { id: "r15", name: "Master Suite", width: 20, length: 24, level: 0, area: 480 },
      { id: "r16", name: "Kitchen", width: 16, length: 20, level: 0, area: 320 },
      { id: "r17", name: "Bedroom 2", width: 15, length: 18, level: 0, area: 270 },
      { id: "r18", name: "Bedroom 3", width: 15, length: 18, level: 0, area: 270 },
      { id: "r19", name: "Bedroom 4", width: 14, length: 16, level: 0, area: 224 },
    ], 
    materials: [
      { id: "m6", name: "Natural Stone", type: "masonry", cost: 15, unit: "sqft", sustainability: 80, inStock: true },
      { id: "m7", name: "Reclaimed Wood", type: "flooring", cost: 90, unit: "sqft", sustainability: 95, inStock: false },
    ], 
    costEstimate: { foundation: 65000, concrete: 45000, steel: 35000, brick: 28000, flooring: 55000, plumbing: 22000, electrical: 18000, labor: 60000, contingency: 15000, designFees: 12000, total: 355000 } 
  },
];

export const mockTemplates: Template[] = [
  { id: "t1", name: "Compact Home", description: "Perfect for small families on budget", thumbnail: "", rooms: 2, floors: 1, style: "Modern", category: "Residential", popular: true, downloads: 3421, rating: 4.7, plotSize: "20x30", tags: ["budget", "compact", "modern"] },
  { id: "t2", name: "Standard 3BHK Villa", description: "Classic 3-bedroom family home", thumbnail: "", rooms: 3, floors: 2, style: "Contemporary", category: "Residential", popular: true, downloads: 8934, rating: 4.8, plotSize: "30x40", tags: ["family", "popular"] },
  { id: "t3", name: "Luxury Mansion", description: "Premium 5BR with pool and home theater", thumbnail: "", rooms: 5, floors: 2, style: "Luxury", category: "Premium", premium: true, downloads: 1234, rating: 4.9, plotSize: "60x80", tags: ["luxury", "pool", "premium"] },
  { id: "t4", name: "Smart Duplex", description: "Modern duplex with smart home integration", thumbnail: "", rooms: 4, floors: 2, style: "Modern", category: "Residential", downloads: 2567, rating: 4.6, plotSize: "25x40" },
  { id: "t5", name: "Studio Apartment", description: "Compact studio for urban living", thumbnail: "", rooms: 1, floors: 1, style: "Minimalist", category: "Apartment", popular: true, downloads: 5678, rating: 4.5, plotSize: "600sqft" },
  { id: "t6", name: "Penthouse Suite", description: "Luxury penthouse with terrace garden", thumbnail: "", rooms: 3, floors: 1, style: "Luxury", category: "Premium", premium: true, downloads: 876, rating: 4.8, plotSize: "2000sqft" },
  { id: "t7", name: "Vastu Perfect Home", description: "Scientifically optimized Vastu layout", thumbnail: "", rooms: 3, floors: 1, style: "Traditional", category: "Vastu", popular: true, downloads: 6789, rating: 4.9, plotSize: "30x40" },
  { id: "t8", name: "Eco Green Home", description: "Net-zero energy sustainable home design", thumbnail: "", rooms: 3, floors: 2, style: "Sustainable", category: "Eco", downloads: 1890, rating: 4.7, plotSize: "40x50" },
  { id: "t9", name: "Mediterranean Villa", description: "Warm terracotta and arches design", thumbnail: "", rooms: 4, floors: 2, style: "Mediterranean", category: "Premium", premium: true, downloads: 2341, rating: 4.8, plotSize: "50x60" },
  { id: "t10", name: "Farmhouse Style", description: "Rustic farmhouse with barn and porch", thumbnail: "", rooms: 4, floors: 1, style: "Farmhouse", category: "Residential", downloads: 3210, rating: 4.6, plotSize: "80x100" },
  { id: "t11", name: "Tiny Home", description: "Ultra-efficient tiny house living", thumbnail: "", rooms: 1, floors: 1, style: "Minimalist", category: "Tiny Homes", downloads: 9876, rating: 4.4, plotSize: "200sqft" },
  { id: "t12", name: "Colonial Revival", description: "Classic American colonial architecture", thumbnail: "", rooms: 5, floors: 2, style: "Colonial", category: "Heritage", downloads: 1567, rating: 4.7, plotSize: "60x80" },
];

export const mockMarketplace: MarketplaceListing[] = [
  { id: "m1", name: "Ar. Priya Sharma", type: "architect", description: "Award-winning residential architect with 15+ years experience in modern and sustainable design.", rating: 4.9, reviews: 128, price: 150, location: "Mumbai, India", available: true, image: "", specializations: ["Modern Residential", "Sustainable", "Vastu"], experience: 15, projects: 287, verified: true, responseTime: "< 2 hours", education: "B.Arch, CEPT University", languages: ["English", "Hindi", "Gujarati"] },
  { id: "m2", name: "David Chen Interiors", type: "designer", description: "Specializing in modern Scandinavian interior design. WELL Certified designer.", rating: 4.8, reviews: 96, price: 120, location: "Singapore", available: true, image: "", specializations: ["Scandinavian", "Modern Minimalist", "Biophilic"], experience: 12, projects: 156, verified: true, responseTime: "< 4 hours" },
  { id: "m3", name: "BuildRight Engineering", type: "engineer", description: "Structural engineering firm with 500+ completed projects across 15 countries.", rating: 4.7, reviews: 203, price: 200, location: "Dubai, UAE", available: true, image: "", specializations: ["Structural Analysis", "Foundation Design", "Seismic"], experience: 20, projects: 534, verified: true, responseTime: "< 8 hours" },
  { id: "m4", name: "GreenBuild Contractors", type: "builder", description: "Sustainable construction specialists. LEED certified. Net-zero expertise.", rating: 4.6, reviews: 87, price: 180, location: "Austin, TX", available: true, image: "", specializations: ["LEED Construction", "Net Zero", "Passive House"], experience: 18, projects: 312, verified: true, responseTime: "< 12 hours" },
  { id: "m5", name: "Ar. Maria Gonzalez", type: "architect", description: "Boutique luxury home architect known for Mediterranean and resort-style designs.", rating: 4.9, reviews: 64, price: 175, location: "Barcelona, Spain", available: false, image: "", specializations: ["Mediterranean", "Luxury Residential", "Resort Design"], experience: 22, projects: 98, verified: true, responseTime: "< 6 hours" },
  { id: "m6", name: "Nordic Designs Co.", type: "designer", description: "Award-winning Scandinavian design studio. Winner of Dezeen Award 2024.", rating: 4.8, reviews: 112, price: 110, location: "Copenhagen, Denmark", available: true, image: "", specializations: ["Scandinavian", "Minimalism", "Sustainable Interiors"], experience: 10, projects: 234, verified: true },
  { id: "m7", name: "Ar. James Wilson", type: "architect", description: "Commercial and residential architect with focus on smart homes and automation.", rating: 4.7, reviews: 89, price: 160, location: "London, UK", available: true, image: "", specializations: ["Smart Homes", "Commercial", "Adaptive Reuse"], experience: 17, projects: 198, verified: true },
  { id: "m8", name: "EcoStruct India", type: "builder", description: "Eco-friendly construction company using local materials and traditional techniques.", rating: 4.5, reviews: 56, price: 90, location: "Bengaluru, India", available: true, image: "", specializations: ["Earthen Construction", "Traditional", "Low Carbon"], experience: 8, projects: 145, verified: false },
];

export const mockNotifications: Notification[] = [
  { id: "n1", userId: "u1", title: "Plan Generated Successfully", message: "Your Modern Luxury Villa design is ready to view!", type: "success", read: false, createdAt: "2025-03-19T10:30:00Z", link: "/dashboard/projects/p1", category: "project" },
  { id: "n2", userId: "u1", title: "Vastu Score Updated", message: "Vastu optimization for Villa reached 92/100 score", type: "info", read: false, createdAt: "2025-03-19T09:15:00Z", link: "/analysis/vastu", category: "ai" },
  { id: "n3", userId: "u1", title: "Team Member Joined", message: "Sarah Chen accepted your workspace invitation", type: "info", read: true, createdAt: "2025-03-18T14:00:00Z", link: "/dashboard/team", category: "team" },
  { id: "n4", userId: "u1", title: "Export Complete", message: "PDF blueprint for Modern Duplex is ready for download", type: "success", read: true, createdAt: "2025-03-17T11:45:00Z", link: "/dashboard/exports", category: "project" },
  { id: "n5", userId: "u1", title: "Payment Successful", message: "Pro plan renewed for ₹2,499/month", type: "success", read: true, createdAt: "2025-03-15T08:00:00Z", link: "/dashboard/billing", category: "billing" },
  { id: "n6", userId: "u1", title: "Storage Warning", message: "You've used 23% of your 10GB storage quota", type: "warning", read: false, createdAt: "2025-03-14T16:30:00Z", link: "/dashboard/settings", category: "system" },
  { id: "n7", userId: "u1", title: "AI Credits Low", message: "You have 53 AI credits remaining this month", type: "warning", read: false, createdAt: "2025-03-13T09:00:00Z", link: "/dashboard/subscription", category: "ai" },
  { id: "n8", userId: "u1", title: "New Comment", message: "Sarah Chen commented on Luxury Villa project", type: "info", read: true, createdAt: "2025-03-12T15:30:00Z", link: "/dashboard/projects/p1", category: "team" },
];

export const mockBlogPosts: BlogPost[] = [
  { id: "b1", slug: "ai-architecture-revolution", title: "How AI is Revolutionizing Architectural Design in 2025", excerpt: "Discover how artificial intelligence is transforming the way architects design and plan buildings at unprecedented speed.", content: "", author: "Dr. James Wilson", authorRole: "Chief Architect, PlanCraftAI", image: "", category: "Technology", date: "2025-03-15", readTime: 8, featured: true, views: 12450, likes: 834, tags: ["AI", "Architecture", "Innovation"] },
  { id: "b2", slug: "vastu-shastra-modern-homes", title: "Vastu Shastra for Modern Homes: A Scientific Approach", excerpt: "Learn how ancient Vastu principles can be harmoniously applied to contemporary home designs without compromise.", content: "", author: "Ar. Priya Sharma", authorRole: "Senior Architect", image: "", category: "Design", date: "2025-03-12", readTime: 6, views: 8920, likes: 623, tags: ["Vastu", "Traditional", "Modern"] },
  { id: "b3", slug: "cost-effective-building", title: "Cost-Effective Building Strategies for 2025", excerpt: "Smart strategies to reduce construction costs by up to 30% without compromising quality or aesthetics.", content: "", author: "Mike Johnson", authorRole: "Cost Engineer", image: "", category: "Business", date: "2025-03-10", readTime: 10, views: 15780, likes: 1102, tags: ["Cost", "Construction", "Budget"] },
  { id: "b4", slug: "sustainable-design-trends", title: "Top 10 Sustainable Design Trends Shaping Architecture", excerpt: "Explore the latest eco-friendly design trends that are setting new standards in modern architecture globally.", content: "", author: "Dr. James Wilson", image: "", category: "Sustainability", date: "2025-03-08", readTime: 7, views: 9340, likes: 756, featured: true },
  { id: "b5", slug: "interior-design-psychology", title: "The Psychology of Interior Design: How Space Affects You", excerpt: "How interior design choices profoundly affect mood, productivity, creativity, and overall well-being.", content: "", author: "Sarah Chen", authorRole: "Interior Design Director", image: "", category: "Design", date: "2025-03-05", readTime: 9, views: 11230, likes: 892 },
  { id: "b6", slug: "3d-floor-planning-guide", title: "The Ultimate Guide to 3D Floor Planning", excerpt: "Everything you need to know about creating professional 3D floor plans using AI-powered tools.", content: "", author: "Tech Team", image: "", category: "Tutorial", date: "2025-03-01", readTime: 15, views: 23456, likes: 1567, featured: true },
];

export const mockTeamMembers: TeamMember[] = [
  { id: "tm1", name: "John Doe", email: "john@example.com", role: "Owner", avatar: "", online: true, joinedAt: "2025-01-15", permissions: ["all"], projectsAccess: ["p1", "p2", "p3"] },
  { id: "tm2", name: "Sarah Chen", email: "sarah@example.com", role: "Editor", avatar: "", online: true, lastSeen: "Just now", joinedAt: "2025-02-20", permissions: ["view", "edit", "comment"], projectsAccess: ["p1", "p4"] },
  { id: "tm3", name: "Mike Johnson", email: "mike@example.com", role: "Viewer", avatar: "", online: false, lastSeen: "2h ago", joinedAt: "2025-03-10", permissions: ["view", "comment"], projectsAccess: ["p2"] },
  { id: "tm4", name: "Emily Davis", email: "emily@example.com", role: "Editor", avatar: "", online: true, lastSeen: "Just now", joinedAt: "2025-03-01", permissions: ["view", "edit", "comment"], projectsAccess: ["p1", "p2", "p3"] },
  { id: "tm5", name: "Alex Kumar", email: "alex@example.com", role: "Viewer", avatar: "", online: false, lastSeen: "1d ago", joinedAt: "2025-03-20", permissions: ["view"], projectsAccess: ["p1"] },
];

export const mockGenerationHistory: GenerationHistory[] = [
  { id: "gh1", prompt: "Generate a 3BHK modern villa on 40x60 East-facing plot with Vastu compliance", result: "5-room layout with living, 3 bedrooms, kitchen, 2 baths", type: "floor-plan", createdAt: "2025-03-19T10:30:00Z", projectId: "p1", creditsUsed: 3, duration: 12, status: "success", model: "PlanCraft v3" },
  { id: "gh2", prompt: "Optimize Vastu compliance for east-facing plot, prioritize master bedroom location", result: "Master bedroom shifted to Southwest corner, score improved to 92", type: "vastu", createdAt: "2025-03-19T09:15:00Z", projectId: "p1", creditsUsed: 2, duration: 8, status: "success" },
  { id: "gh3", prompt: "Generate detailed cost estimate for standard finish 3BHK villa", result: "Total estimated: ₹1,43,000 with 15% contingency", type: "cost", createdAt: "2025-03-18T14:00:00Z", projectId: "p2", creditsUsed: 1, duration: 3, status: "success" },
  { id: "gh4", prompt: "Auto-furnish the living room and bedrooms in Scandinavian style", result: "All rooms furnished with Nordic furniture selections", type: "interior", createdAt: "2025-03-17T11:45:00Z", projectId: "p3", creditsUsed: 4, duration: 18, status: "success" },
  { id: "gh5", prompt: "Generate 3 unique variations of the duplex layout maintaining same footprint", result: "3 distinct layout variations generated", type: "variation", createdAt: "2025-03-16T08:00:00Z", projectId: "p2", creditsUsed: 9, duration: 34, status: "success" },
  { id: "gh6", prompt: "Analyze structural requirements for 3-story beachfront building with cantilevers", result: "Structural report with beam sizes and foundation specs", type: "structural", createdAt: "2025-03-15T14:30:00Z", projectId: "p4", creditsUsed: 5, duration: 22, status: "success" },
];

export const mockInvoices: Invoice[] = [
  { id: "inv1", userId: "u1", amount: 2499, currency: "INR", status: "paid", description: "Pro Plan - March 2025", createdAt: "2025-03-01", dueAt: "2025-03-01", planName: "Pro" },
  { id: "inv2", userId: "u1", amount: 2499, currency: "INR", status: "paid", description: "Pro Plan - February 2025", createdAt: "2025-02-01", dueAt: "2025-02-01", planName: "Pro" },
  { id: "inv3", userId: "u1", amount: 2499, currency: "INR", status: "paid", description: "Pro Plan - January 2025", createdAt: "2025-01-01", dueAt: "2025-01-01", planName: "Pro" },
  { id: "inv4", userId: "u1", amount: 500, currency: "INR", status: "paid", description: "AI Credits Top-up (50 credits)", createdAt: "2025-02-15", dueAt: "2025-02-15" },
];

export const mockPaymentMethods: PaymentMethod[] = [
  { id: "pm1", userId: "u1", type: "card", last4: "4242", brand: "Visa", expiryMonth: 12, expiryYear: 2026, isDefault: true },
  { id: "pm2", userId: "u1", type: "upi", upiId: "john@upi", isDefault: false },
];

export const mockReviews: Review[] = [
  { id: "rv1", userId: "u5", userName: "Rajan Mehta", listingId: "m1", rating: 5, title: "Exceptional architect!", content: "Priya designed our dream home perfectly. Her attention to Vastu while maintaining modern aesthetics is unparalleled.", createdAt: "2025-03-10", helpful: 23, verified: true },
  { id: "rv2", userId: "u4", userName: "Mike Builder", listingId: "m1", rating: 5, title: "Professional and creative", content: "Best architectural experience I've had. The 3D renderings were spot-on and the actual construction turned out exactly as planned.", createdAt: "2025-02-28", helpful: 17, verified: true },
  { id: "rv3", userId: "u1", userName: "John Doe", listingId: "m2", rating: 4, title: "Great Scandinavian designs", content: "David Chen has an amazing eye for Nordic design. Very responsive and professional throughout the project.", createdAt: "2025-03-05", helpful: 8, verified: true },
];

export const mockJobListings: JobListing[] = [
  { id: "j1", title: "Senior AI/ML Engineer", department: "Engineering", location: "Bengaluru / Remote", type: "full-time", description: "Lead the development of our AI floor plan generation models.", requirements: ["5+ years ML experience", "PyTorch/TensorFlow expertise", "Computer Vision background"], benefits: ["ESOP", "Health Insurance", "Remote Work", "Learning Budget"], salary: "₹40-80 LPA", postedAt: "2025-03-10", applicants: 234, featured: true },
  { id: "j2", title: "Lead Product Designer", department: "Design", location: "Bengaluru / Remote", type: "full-time", description: "Drive the UX for our design tools used by 100,000+ architects globally.", requirements: ["5+ years product design", "Figma expertise", "Design systems experience"], benefits: ["ESOP", "Health Insurance", "Design Budget"], salary: "₹25-45 LPA", postedAt: "2025-03-08", applicants: 189, featured: true },
  { id: "j3", title: "Full Stack Engineer (Next.js)", department: "Engineering", location: "Remote", type: "remote", description: "Build scalable features for our web platform.", requirements: ["3+ years React/Next.js", "Node.js", "PostgreSQL"], salary: "₹20-35 LPA", postedAt: "2025-03-12", applicants: 456, benefits: ["Remote Work", "Flexible Hours", "Health Insurance"] },
  { id: "j4", title: "Architect Evangelist", department: "Business Development", location: "Mumbai / Delhi", type: "full-time", description: "Build relationships with top architectural firms and evangelise PlanCraftAI.", requirements: ["Architecture background", "5+ years BD experience", "Network in AEC industry"], salary: "₹18-30 LPA + Commission", postedAt: "2025-03-15", applicants: 78, benefits: ["Performance Bonus", "Travel Allowance", "Health Insurance"] },
  { id: "j5", title: "DevOps Engineer", department: "Engineering", location: "Bengaluru / Remote", type: "full-time", description: "Scale our infrastructure serving millions of AI generations per month.", requirements: ["AWS/GCP expertise", "Kubernetes", "Terraform"], salary: "₹25-45 LPA", postedAt: "2025-03-18", applicants: 123, benefits: ["ESOP", "Health Insurance", "WFH Allowance"] },
];

export const mockActivityLog = [
  { id: "a1", text: "Exported PDF for 'Modern Duplex'", time: "2h ago", icon: "download", userId: "u1" },
  { id: "a2", text: "Generated 3 layouts for 'Luxury Villa'", time: "Yesterday", icon: "sparkles", userId: "u1" },
  { id: "a3", text: "Vastu score optimized for 'Scandinavian Apt'", time: "3d ago", icon: "compass", userId: "u1" },
  { id: "a4", text: "Upgraded to Pro plan", time: "1w ago", icon: "zap", userId: "u1" },
  { id: "a5", text: "Sarah Chen joined workspace", time: "1w ago", icon: "users", userId: "u2" },
  { id: "a6", text: "Shared 'Modern Luxury Villa' publicly", time: "2w ago", icon: "share", userId: "u1" },
  { id: "a7", text: "AI furnishing applied to 'Farmhouse Retreat'", time: "2w ago", icon: "home", userId: "u1" },
];

export const mockUsageStats = {
  aiGenerations: { used: 47, total: 100, history: [12, 8, 15, 9, 22, 18, 14, 11, 16, 13, 19, 47] },
  storage: { usedMb: 2340, totalMb: 10240 },
  projects: { count: 4, limit: 50 },
  exports: { count: 23, limit: 100 },
  apiCalls: { count: 156, limit: 1000 },
  monthlyRevenue: [12000, 15000, 18500, 22000, 19000, 24500, 28000, 31000, 29500, 34000, 38500, 42000],
  userGrowth: [1200, 1450, 1890, 2340, 2800, 3200, 4100, 5200, 6300, 7800, 9200, 11400],
};
