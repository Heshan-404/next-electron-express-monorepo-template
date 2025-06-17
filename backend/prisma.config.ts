// backend/prisma/prisma.config.ts
import path from 'node:path'
import type { PrismaConfig } from 'prisma'

// __dirname here refers to 'backend/prisma/' because prisma.config.ts is in that directory.
export default {
    earlyAccess: true,
    // CORRECTED: Point to '_schema.prisma' within the current directory (backend/prisma/)
    schema: path.join(__dirname, 'prisma','_schema.prisma'),
} satisfies PrismaConfig