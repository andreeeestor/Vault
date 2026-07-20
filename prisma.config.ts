import { defineConfig } from "prisma/config";
import "dotenv/config"; // carrega .env
import { config } from "dotenv";

// Next.js usa .env.local — garantir que o Prisma CLI também lê
config({ path: ".env.local", override: true });

export default defineConfig({
  earlyAccess: true,
  datasource: {
    url: process.env.DATABASE_URL!,
    directUrl: process.env.DIRECT_URL,
  },
} as any);
