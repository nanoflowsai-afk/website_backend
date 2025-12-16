import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest } from "@/lib/auth";
import { blogPostUpdateSchema } from "@/lib/validators";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getIdFromContext(context: RouteContext) {
  const params = await context.params;
  return Number(params.id);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const adminId = getAdminFromRequest(req);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = blogPostUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const id = await getIdFromContext(context);

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isPublished = parsed.data.isPublished;
  let publishedAt: Date | null | undefined = undefined;
  
  if (parsed.data.publishedAt) {
    publishedAt = new Date(parsed.data.publishedAt);
  } else if (isPublished === true && !existing.publishedAt) {
    publishedAt = new Date();
  }

  const post = await prisma.blogPost.update({
    where: { id },
    data: {
      title: parsed.data.title ?? undefined,
      slug: parsed.data.slug ?? undefined,
      excerpt: parsed.data.excerpt ?? undefined,
      content: parsed.data.content ?? undefined,
      imageUrl: parsed.data.imageUrl ?? undefined,
      isPublished: isPublished ?? undefined,
      publishedAt,
    },
  });

  return NextResponse.json({ post });
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const adminId = getAdminFromRequest(req);
  if (!adminId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = await getIdFromContext(context);

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.blogPost.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

