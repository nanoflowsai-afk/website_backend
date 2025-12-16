import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validators";
import { setAdminCookie, signAdminToken, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const admin = await prisma.admin.findUnique({
    where: { email: parsed.data.email },
  });

  if (!admin) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await verifyPassword(parsed.data.password, admin.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signAdminToken(admin.id);
  await setAdminCookie(token);

  return NextResponse.json({
    admin: { id: admin.id, name: admin.name, email: admin.email },
  });
}

