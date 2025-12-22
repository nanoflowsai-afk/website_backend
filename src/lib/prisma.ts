import { PrismaClient } from "@prisma/client";

declare const global: {
    prisma?: PrismaClient;
};

export const prisma =
    global.prisma ??
    new PrismaClient({
        log: ["error", "warn"],
    });

if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
}
