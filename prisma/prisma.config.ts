/**
 * Prisma 7 Configuration
 * Connection URL for development - actual connection string in .env
 */
import { defineConfig } from 'prisma';

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || '',
    },
  },
});
