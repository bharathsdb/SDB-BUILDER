import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const now = new Date().toISOString();

  const adminPassword = await bcrypt.hash("Admin123", 12);
  const demoPassword = await bcrypt.hash("bharath@22", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@plancraft.ai" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@plancraft.ai",
      password: adminPassword,
      role: "admin",
      plan: "enterprise",
      verified: true,
      company: "PlanCraftAI",
      country: "US",
      aiCreditsUsed: 0,
      aiCreditsTotal: 9999,
      storageUsedMb: 0,
      storageQuotaMb: 102400,
      projectsCount: 0,
      createdAt: now,
      updatedAt: now,
    },
  });

  const demo = await prisma.user.upsert({
    where: { email: "bharathsdb1@gmail.com" },
    update: {},
    create: {
      name: "Bharath",
      email: "bharathsdb1@gmail.com",
      password: demoPassword,
      role: "user",
      plan: "pro",
      verified: true,
      company: "Demo Corp",
      country: "US",
      aiCreditsUsed: 5,
      aiCreditsTotal: 100,
      storageUsedMb: 120,
      storageQuotaMb: 10240,
      projectsCount: 0,
      createdAt: now,
      updatedAt: now,
    },
  });

  console.log("Seeded admin:", admin.email);
  console.log("Seeded demo:", demo.email);

  const sampleProject = await prisma.project.upsert({
    where: { id: "seed-p1" },
    update: {},
    create: {
      id: "seed-p1",
      name: "Modern Luxury Villa",
      description: "A 5-bedroom modern villa with open plan living",
      userId: demo.id,
      plotLength: 60,
      plotWidth: 40,
      facing: "East",
      floors: 2,
      budgetTier: "Premium",
      style: "Modern",
      vastu: true,
      status: "completed",
      shared: true,
      viewCount: 1243,
      vastuScore: 92,
      sustainabilityScore: 78,
      stars: 4,
      createdAt: now,
      updatedAt: now,
    },
  });

  await prisma.room.createMany({
    data: [
      { name: "Living Room", width: 20, length: 25, level: 0, type: "living", area: 500, projectId: sampleProject.id },
      { name: "Master Bedroom", width: 16, length: 18, level: 0, type: "bedroom", area: 288, projectId: sampleProject.id },
      { name: "Kitchen", width: 12, length: 15, level: 0, type: "kitchen", area: 180, projectId: sampleProject.id },
      { name: "Bedroom 2", width: 14, length: 14, level: 1, type: "bedroom", area: 196, projectId: sampleProject.id },
      { name: "Bedroom 3", width: 13, length: 14, level: 1, type: "bedroom", area: 182, projectId: sampleProject.id },
    ],
  });

  await prisma.costEstimate.upsert({
    where: { projectId: sampleProject.id },
    update: {},
    create: {
      foundation: 45000,
      concrete: 32000,
      steel: 28000,
      brick: 18000,
      flooring: 35000,
      plumbing: 15000,
      electrical: 12000,
      labor: 40000,
      contingency: 10000,
      designFees: 8000,
      total: 243000,
      projectId: sampleProject.id,
    },
  });

  console.log("Seeded sample project:", sampleProject.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
