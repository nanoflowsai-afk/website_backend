import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userLoginSchema } from "@/lib/validators";
import { setAdminCookie, signAdminToken, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = userLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Try admin first
  const admin = await prisma.admin.findUnique({ where: { email: parsed.data.email } });
  if (admin) {
    const valid = await verifyPassword(parsed.data.password, admin.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const token = signAdminToken(admin.id);
    await setAdminCookie(token);
    return NextResponse.json({
      admin: { id: admin.id, name: admin.name, email: admin.email },
      role: "admin",
    });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await verifyPassword(parsed.data.password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signAdminToken(user.id);
  await setAdminCookie(token);

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email },
    role: "user",
  });
}

