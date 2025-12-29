import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await prisma.admin.upsert({
    where: { email: "admin@nanoflows.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@nanoflows.com",
      password: hashedPassword,
    },
  });

  await prisma.heroSlide.deleteMany();
  await prisma.heroSlide.createMany({
    data: [
      {
        heading: "Empowering Businesses with Generative AI & Intelligent Automation",
        subHeading: "From ideas to intelligent systems — we design AI-driven software, automation, and agents that run your business smarter, faster, and at scale.",
        tags: ["AI Automation", "AI Agents", "Intelligent Software", "Business Intelligence"],
        backgroundImageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920&h=1080&fit=crop",
        isActive: true,
        displayOrder: 1,
      },
      {
        heading: "Build Autonomous AI Agents for Your Business",
        subHeading: "Custom AI agents that work 24/7, handling sales, support, and operations with human-like intelligence.",
        tags: ["Chatbots", "Sales Agents", "Support Bots", "Workflow Automation"],
        backgroundImageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1920&h=1080&fit=crop",
        isActive: true,
        displayOrder: 2,
      },
      {
        heading: "Transform Data into Actionable Intelligence",
        subHeading: "Leverage predictive analytics, real-time dashboards, and AI-powered insights to drive strategic decisions.",
        tags: ["Data Analytics", "Machine Learning", "Predictive AI", "Business Intelligence"],
        backgroundImageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=1080&fit=crop",
        isActive: true,
        displayOrder: 3,
      },
    ],
  });

  await prisma.about.deleteMany();
  await prisma.about.create({
    data: {
      mission: "To democratize AI technology and empower businesses of all sizes with intelligent automation solutions that drive growth and efficiency.",
      vision: "A world where every business leverages AI to operate smarter, faster, and more efficiently — unlocking human potential for creativity and innovation.",
      teamIntro: "Our team of AI experts, engineers, and strategists are passionate about transforming businesses through cutting-edge technology.",
      expertise: ["Generative AI", "Machine Learning", "Process Automation", "Custom Software Development"],
      coreValues: ["Innovation First", "Client Success", "Continuous Learning", "Ethical AI"],
    },
  });

  await prisma.teamMember.deleteMany();
  await prisma.teamMember.createMany({
    data: [
      {
        name: "Alex Chen",
        role: "CEO & AI Strategist",
        bio: "15+ years leading AI initiatives at Fortune 500 companies. Expert in enterprise AI transformation.",
        expertise: ["AI Strategy", "Enterprise Solutions", "Leadership"],
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
        isActive: true,
        displayOrder: 1,
      },
      {
        name: "Sarah Johnson",
        role: "CTO & ML Engineer",
        bio: "Former Google ML researcher. Specializes in building scalable AI systems and LLM applications.",
        expertise: ["Machine Learning", "LLMs", "System Architecture"],
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
        isActive: true,
        displayOrder: 2,
      },
      {
        name: "Michael Park",
        role: "Head of Product",
        bio: "Product leader with expertise in AI-powered SaaS. Focused on delivering exceptional user experiences.",
        expertise: ["Product Strategy", "UX Design", "SaaS"],
        avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
        isActive: true,
        displayOrder: 3,
      },
    ],
  });

  await prisma.blogPost.deleteMany();
  await prisma.blogPost.createMany({
    data: [
      {
        title: "How AI Automation Saved a Logistics Company $2M Annually",
        slug: "ai-automation-logistics-case-study",
        excerpt: "Discover how we implemented intelligent workflow automation that transformed operations and cut costs dramatically.",
        content: "Full case study content here...",
        imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=400&fit=crop",
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        title: "Building Custom LLM Solutions for Enterprise",
        slug: "custom-llm-enterprise-guide",
        excerpt: "A comprehensive guide to deploying tailored large language models that understand your business context.",
        content: "Full guide content here...",
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        title: "AI Chatbots: From Customer Support to Sales Conversion",
        slug: "ai-chatbots-support-sales",
        excerpt: "Learn how AI-powered chatbots are revolutionizing customer engagement and driving revenue growth.",
        content: "Full article content here...",
        imageUrl: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=800&h=400&fit=crop",
        isPublished: true,
        publishedAt: new Date(),
      },
    ],
  });

  await (prisma as any).jobPosting.deleteMany();
  await (prisma as any).jobPosting.createMany({
    data: [
      {
        title: "AI/ML Engineer",
        department: "Engineering",
        type: "Full-time",
        location: "Remote",
        description: "Design and implement machine learning models for our autonomous AI platforms. Work on cutting-edge NLP, computer vision, and predictive analytics systems.",
        requirements: ["3+ years ML/AI experience", "Python proficiency", "Experience with TensorFlow/PyTorch", "Strong math background"],
        isActive: true,
        displayOrder: 1,
      },
      {
        title: "Full Stack Developer",
        department: "Engineering",
        type: "Full-time",
        location: "Remote",
        description: "Build and maintain our web applications using React, Node.js, and cloud infrastructure. Create intuitive interfaces for complex AI systems.",
        requirements: ["3+ years full-stack experience", "React/Next.js expertise", "Node.js/TypeScript", "Cloud experience (AWS/GCP)"],
        isActive: true,
        displayOrder: 2,
      },
      {
        title: "Product Designer",
        department: "Design",
        type: "Full-time",
        location: "Remote",
        description: "Design beautiful and functional user experiences for our AI products. Work closely with engineering to bring designs to life.",
        requirements: ["4+ years product design experience", "Figma proficiency", "Strong portfolio", "Experience with SaaS products"],
        isActive: true,
        displayOrder: 3,
      },
      {
        title: "AI Solutions Architect",
        department: "Engineering",
        type: "Full-time",
        location: "Remote",
        description: "Architect end-to-end AI solutions for enterprise clients. Define technical roadmaps and lead implementation of agentic AI systems.",
        requirements: ["5+ years architecture experience", "Enterprise AI deployment", "Strong communication skills", "Leadership experience"],
        isActive: true,
        displayOrder: 4,
      },
    ],
  });

  await (prisma as any).webinar.deleteMany();
  await (prisma as any).webinar.createMany({
    data: [
      {
        title: "Automate Your Business with AI Agents",
        description: "Learn how AI agents can automate workflows, customer support, and decision-making.",
        date: "Dec 28, 2025",
        time: "2:00 PM IST",
        duration: "90 Minutes",
        speaker: "Rajesh Kumar",
        level: "Beginner",
        category: "AI Agents",
        type: "Upcoming",
        imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
        registeredCount: 234,
        maxCapacity: 500,
      },
      {
        title: "Marketing Automation with AI",
        description: "Transform your marketing with intelligent automation and personalization strategies.",
        date: "Dec 25, 2025",
        time: "3:30 PM IST",
        duration: "60 Minutes",
        speaker: "Priya Singh",
        level: "Intermediate",
        category: "Marketing AI",
        type: "Live",
        imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
        registeredCount: 512,
        maxCapacity: 1000,
        isLandingPage: true,
      },
      {
        title: "Building Intelligent Search Systems",
        description: "Enterprise AI search solutions for better data discovery and insights.",
        date: "Dec 20, 2025",
        time: "1:00 PM IST",
        duration: "75 Minutes",
        speaker: "Amit Patel",
        level: "Advanced",
        category: "AI Automation",
        type: "Recorded",
        imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
      },
      {
        title: "AI for Business Growth",
        description: "Practical strategies to scale your business using AI-driven automation.",
        date: "Dec 30, 2025",
        time: "4:00 PM IST",
        duration: "90 Minutes",
        speaker: "Sarah Johnson",
        level: "Beginner",
        category: "Business AI",
        type: "Upcoming",
        imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
        registeredCount: 156,
        maxCapacity: 500,
      },
      {
        title: "Workshop: Custom LLM Development",
        description: "Hands-on workshop on building custom language models for your use cases.",
        date: "Dec 15, 2025",
        time: "10:00 AM IST",
        duration: "120 Minutes",
        speaker: "Dr. Neha Gupta",
        level: "Advanced",
        category: "Workshops",
        type: "Recorded",
        imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
      },
      {
        title: "AI Agents in Customer Support",
        description: "Deploy AI agents to handle customer inquiries and support tickets automatically.",
        date: "Jan 5, 2026",
        time: "2:30 PM IST",
        duration: "60 Minutes",
        speaker: "Marcus Chen",
        level: "Intermediate",
        category: "AI Agents",
        type: "Upcoming",
        imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop",
        registeredCount: 89,
        maxCapacity: 500,
      },
    ],
  });

  // Create Gen AI Masterclass with 5-Day Roadmap (Custom create for nested writes)
  await prisma.webinar.create({
    data: {
      title: "Gen AI Masterclass: From Concept to Creation",
      description: "Join this intensive 5-day bootcamp to master Generative AI. From understanding the core concepts of LLMs to building and deploying your own custom AI agents, this course is designed for professionals who want to stay ahead of the curve. Simple, practical, and hands-on.",
      date: "Jan 15, 2026",
      time: "6:00 PM IST",
      duration: "5 Days",
      speaker: "Dr. Ananya Sharma",
      mentorName: "Dr. Ananya Sharma",
      mentorRole: "Principal AI Researcher",
      mentorBio: "Dr. Sharma is a pioneer in Generative AI with over a decade of experience in NLP and deep learning. She has led AI research teams at top tech firms and is passionate about democratizing AI education.",
      mentorImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face",
      level: "All Levels",
      category: "Generative AI",
      type: "Upcoming",
      imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=300&fit=crop",
      registeredCount: 420,
      maxCapacity: 1000,
      price: 4999,
      currency: "INR",
      roadmapItems: {
        create: [
          {
            day: 1,
            title: "The Revolution of Generative AI",
            subtitle: "Understanding the New Era of Computing",
            highlight: "Foundation",
            description: ["Introduction to LLMs and Transformers", "How ChatGPT and Claude actually work", "The landscape of Generative AI tools", "Setting up your local AI environment"],
            imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500&h=300&fit=crop",
          },
          {
            day: 2,
            title: "Prompt Engineering & Context",
            subtitle: "Mastering Communication with AI",
            highlight: "Core Skills",
            description: ["The art and science of Prompt Engineering", "Zero-shot, One-shot, and Few-shot prompting", "Understanding Context Windows and Tokens", "Hands-on: Building a Prompt Library"],
            imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500&h=300&fit=crop",
          },
          {
            day: 3,
            title: "Building Custom AI Agents",
            subtitle: "Creating Autonomous Systems",
            highlight: "Development",
            description: ["Introduction to AI Agents and Autonomous Loops", "Using Frameworks like LangChain and AutoGen", "Connecting LLMs to external tools (APIs, Search)", "Building your first Customer Support Agent"],
            imageUrl: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=500&h=300&fit=crop",
          },
          {
            day: 4,
            title: "Fine-Tuning & RAG",
            subtitle: "Training on Your Own Data",
            highlight: "Advanced",
            description: ["Retrieval Augmented Generation (RAG) explained", "Building a 'Chat with PDF' application", "When to Fine-tune vs. RAG", "Preparing datasets for Fine-tuning"],
            imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&h=300&fit=crop",
          },
          {
            day: 5,
            title: "Capstone: Deploying a Gen AI App",
            subtitle: "Bringing Your Solution to Life",
            highlight: "Deployment",
            description: ["Designing a full-stack Gen AI application", "Frontend integration (React/Next.js)", "Backend API serving (FastAPI/Node.js)", "Deployment strategies and best practices"],
            imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&h=300&fit=crop",
          },
        ],
      },
    },
  });


  // Create User
  const userPassword = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {
      headline: "Senior Software Engineer",
      bio: "Passionate about building scalable web applications. Enjoys hiking and photography.",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1"
    },
    create: {
      name: "Demo User",
      email: "user@example.com",
      password: userPassword,
      headline: "Senior Software Engineer",
      bio: "Passionate about building scalable web applications. Enjoys hiking and photography.",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1"
    },
  });

  // Register user for some webinars
  const allWebinars = await prisma.webinar.findMany({ take: 3 });
  for (const webinar of allWebinars) {
    // Check if registration exists to avoid unique constraint error on re-seed
    const exists = await prisma.webinarRegistration.findUnique({
      where: { userId_webinarId: { userId: user.id, webinarId: webinar.id } }
    });

    if (!exists) {
      await prisma.webinarRegistration.create({
        data: {
          userId: user.id,
          webinarId: webinar.id,
          status: 'confirmed'
        }
      });
    }
  }

  console.log("Database seeded successfully!");
  console.log("Admin credentials: admin@nanoflows.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
