"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var now, adminPassword, demoPassword, admin, demo, sampleProject;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    now = new Date().toISOString();
                    return [4 /*yield*/, bcryptjs_1.default.hash("Admin123", 12)];
                case 1:
                    adminPassword = _a.sent();
                    return [4 /*yield*/, bcryptjs_1.default.hash("bharath@22", 12)];
                case 2:
                    demoPassword = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
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
                        })];
                case 3:
                    admin = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
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
                        })];
                case 4:
                    demo = _a.sent();
                    console.log("Seeded admin:", admin.email);
                    console.log("Seeded demo:", demo.email);
                    return [4 /*yield*/, prisma.project.upsert({
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
                        })];
                case 5:
                    sampleProject = _a.sent();
                    return [4 /*yield*/, prisma.room.createMany({
                            data: [
                                { name: "Living Room", width: 20, length: 25, level: 0, type: "living", area: 500, projectId: sampleProject.id },
                                { name: "Master Bedroom", width: 16, length: 18, level: 0, type: "bedroom", area: 288, projectId: sampleProject.id },
                                { name: "Kitchen", width: 12, length: 15, level: 0, type: "kitchen", area: 180, projectId: sampleProject.id },
                                { name: "Bedroom 2", width: 14, length: 14, level: 1, type: "bedroom", area: 196, projectId: sampleProject.id },
                                { name: "Bedroom 3", width: 13, length: 14, level: 1, type: "bedroom", area: 182, projectId: sampleProject.id },
                            ],
                        })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, prisma.costEstimate.upsert({
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
                        })];
                case 7:
                    _a.sent();
                    console.log("Seeded sample project:", sampleProject.name);
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
