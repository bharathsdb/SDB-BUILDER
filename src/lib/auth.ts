import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "plancraft-ai-jwt-secret-dev-2025";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; email: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("plancraft_token")?.value;
    if (!token) return null;
    const decoded = verifyToken(token);
    if (!decoded) return null;
    try {
      const { prisma } = await import("./prisma");
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (user) {
        const { password: _password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      }
    } catch {}
    const { mockUsers } = await import("./api/mock-db");
    const mockUser = mockUsers.find((u) => u.id === decoded.userId || u.email === decoded.email);
    if (!mockUser) return null;
    return mockUser as Omit<typeof mockUser, 'password'>;
  } catch {
    return null;
  }
}
