import { prisma } from '../config/database.js';

export async function truncateAllTables() {
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    AND tablename NOT LIKE '_prisma%'
  `;
  for (const { tablename } of tablenames) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "public"."${tablename}" CASCADE`
    );
  }
}

export async function disconnectDb() {
  await prisma.$disconnect();
}
