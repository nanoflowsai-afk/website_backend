import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";
import { jobPostingSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const adminId = getAdminFromRequest(req);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobs = await prisma.jobPosting.findMany({
    orderBy: { displayOrder: "asc" },
  });
  return NextResponse.json({ jobs });
}

export async function POST(req: NextRequest) {
  const adminId = getAdminFromRequest(req);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = jobPostingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const job = await prisma.jobPosting.create({
    data: {
      title: parsed.data.title,
      department: parsed.data.department,
      type: parsed.data.type,
      location: parsed.data.location,
      description: parsed.data.description,
      requirements: parsed.data.requirements,
      isActive: parsed.data.isActive,
      displayOrder: parsed.data.displayOrder,
    },
  });

  return NextResponse.json({ job });
}
