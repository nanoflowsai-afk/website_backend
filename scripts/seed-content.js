const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Seed Hero Slides
  await prisma.heroSlide.createMany({
    data: [
      {
        heading: "AI-First Software & Automation",
        subHeading: "Powering the next generation of intelligent business with cutting-edge AI solutions and automation technologies.",
        tags: ["AI Automation", "AI Agents", "Intelligent Software", "Business Intelligence"],
        backgroundImageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&h=1080&fit=crop",
        isActive: true,
        displayOrder: 0,
      },
      {
        heading: "Transform Your Business with AI",
        subHeading: "Leverage the power of artificial intelligence to automate workflows, enhance decision-making, and drive growth.",
        tags: ["Machine Learning", "Automation", "Digital Transformation"],
        backgroundImageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1920&h=1080&fit=crop",
        isActive: true,
        displayOrder: 1,
      },
    ],
    skipDuplicates: true,
  });

  // Seed About
  await prisma.about.upsert({
    where: { id: 1 },
    update: {},
    create: {
      mission: "To empower businesses with intelligent AI solutions that drive efficiency, innovation, and sustainable growth.",
      vision: "To be the leading provider of AI-first software solutions, transforming how businesses operate and compete in the digital age.",
      teamIntro: "Our team of AI specialists, engineers, and strategists brings decades of combined experience in building cutting-edge technology solutions.",
      expertise: ["Artificial Intelligence", "Machine Learning", "Process Automation", "Data Analytics", "Cloud Solutions"],
      coreValues: ["Innovation", "Excellence", "Integrity", "Collaboration"],
    },
  });

  // Seed Team Members
  await prisma.teamMember.createMany({
    data: [
      {
        name: "Alex Chen",
        role: "CEO & Founder",
        bio: "Visionary leader with 15+ years in AI and software development.",
        expertise: ["AI Strategy", "Business Development", "Product Vision"],
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        isActive: true,
        displayOrder: 0,
      },
      {
        name: "Sarah Martinez",
        role: "CTO",
        bio: "Technical architect specializing in scalable AI systems.",
        expertise: ["System Architecture", "Machine Learning", "Cloud Infrastructure"],
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
        isActive: true,
        displayOrder: 1,
      },
    ],
    skipDuplicates: true,
  });

  // Seed Blog Posts
  await prisma.blogPost.createMany({
    data: [
      {
        title: "The Future of AI in Business",
        slug: "future-of-ai-in-business",
        excerpt: "Exploring how artificial intelligence is reshaping modern business operations and strategy.",
        content: "Artificial intelligence is no longer a futuristic concept...",
        imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop",
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        title: "Building Intelligent Automation",
        slug: "building-intelligent-automation",
        excerpt: "A deep dive into creating automation systems that learn and adapt.",
        content: "Intelligent automation combines AI with traditional automation...",
        imageUrl: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=400&fit=crop",
        isPublished: true,
        publishedAt: new Date(),
      },
    ],
    skipDuplicates: true,
  });

  console.log("Content seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
