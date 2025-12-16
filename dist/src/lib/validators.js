import { z } from "zod";
export const heroSlideSchema = z.object({
    heading: z.string().min(3),
    subHeading: z.string().min(3),
    tags: z.array(z.string().min(1)).min(1),
    backgroundImageUrl: z.string().min(1).max(5000),
    isActive: z.boolean().optional().default(true),
    displayOrder: z.number().int().min(0).optional().default(0),
});
export const heroSlideUpdateSchema = heroSlideSchema.partial().extend({
    id: z.number().int().positive().optional(),
});
export const aboutSchema = z.object({
    mission: z.string().min(1),
    vision: z.string().min(1),
    teamIntro: z.string().optional().default(""),
    expertise: z.array(z.string().min(1)).optional().default([]),
    coreValues: z.array(z.string().min(1)).optional().default([]),
});
export const teamMemberSchema = z.object({
    name: z.string().min(2),
    role: z.string().min(2),
    bio: z.string().min(1),
    expertise: z.array(z.string().min(1)).optional().default([]),
    avatarUrl: z.string().optional().default(""),
    isActive: z.boolean().optional().default(true),
    displayOrder: z.number().int().min(0).optional().default(0),
});
export const teamMemberUpdateSchema = teamMemberSchema.partial();
export const blogPostSchema = z.object({
    title: z.string().min(3),
    slug: z.string().min(1),
    excerpt: z.string().min(1),
    content: z.string().min(1),
    imageUrl: z.string().optional().default(""),
    isPublished: z.boolean().optional().default(false),
    publishedAt: z.string().optional().nullable().transform(val => val === "" ? null : val),
});
export const blogPostUpdateSchema = blogPostSchema.partial();
export const userSignupSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});
export const userLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
export const bootstrapSchema = z.object({
    key: z.string().min(6),
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
});
export const jobPostingSchema = z.object({
    title: z.string().min(2),
    department: z.string().min(2),
    type: z.string().min(2),
    location: z.string().min(2),
    description: z.string().min(10),
    requirements: z.array(z.string().min(1)).optional().default([]),
    isActive: z.boolean().optional().default(true),
    displayOrder: z.number().int().min(0).optional().default(0),
});
export const jobPostingUpdateSchema = jobPostingSchema.partial();
//# sourceMappingURL=validators.js.map