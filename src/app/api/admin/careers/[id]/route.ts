import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";
import { jobPostingUpdateSchema } from "@/lib/validators";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminId = getAdminFromRequest(req);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const jobId = parseInt(id, 10);
  if (isNaN(jobId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = jobPostingUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const job = await prisma.jobPosting.update({
    where: { id: jobId },
    data: parsed.data,
  });

  return NextResponse.json({ job });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminId = getAdminFromRequest(req);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const jobId = parseInt(id, 10);
  if (isNaN(jobId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  await prisma.jobPosting.delete({ where: { id: jobId } });
  return NextResponse.json({ success: true });
}
