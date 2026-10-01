const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'CHANGE_ME_TO_A_LONG_RANDOM_PASSWORD';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: Role.ADMIN, emailVerifiedAt: new Date() },
    create: { email: adminEmail, name: 'Store Admin', passwordHash, role: Role.ADMIN, emailVerifiedAt: new Date() }
  });

  console.log('Admin account ensured. No demo categories, products, sizes, colors or patterns are seeded in V11.');
}

main().finally(() => prisma.$disconnect());
