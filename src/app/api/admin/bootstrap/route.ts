import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bootstrapSchema } from "@/lib/validators";
import { hashPassword, setAdminCookie, signAdminToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const bootstrapKey = process.env.ADMIN_BOOTSTRAP_KEY;
  if (!bootstrapKey) {
    return NextResponse.json(
      { error: "Bootstrap key not configured" },
      { status: 500 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = bootstrapSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (parsed.data.key !== bootstrapKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.admin.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Admin already exists for this email" },
      { status: 400 },
    );
  }

  const hashed = await hashPassword(parsed.data.password);
  const admin = await prisma.admin.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashed,
    },
  });

  const token = signAdminToken(admin.id);
  await setAdminCookie(token);

  return NextResponse.json({
    admin: { id: admin.id, name: admin.name, email: admin.email },
  });
}

