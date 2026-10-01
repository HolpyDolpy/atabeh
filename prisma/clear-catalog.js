const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // This is intentionally destructive for the test catalog. Users/admin accounts are preserved.
  await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.variant.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany()
  ]);
  console.log('Catalog cleared: categories, products, variants/sizes and test orders removed. User accounts were preserved.');
}

main().catch((e)=>{ console.error(e); process.exitCode = 1; }).finally(()=>prisma.$disconnect());
