import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userSignupSchema } from "@/lib/validators";
import { hashPassword, signAdminToken, setAdminCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = userSignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 400 });
  }

  const hashed = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashed,
    },
  });

  // Optional: sign with same JWT util but separate cookie name to keep simple
  const token = signAdminToken(user.id);
  await setAdminCookie(token);

  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
}

