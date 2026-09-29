const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { categories, products } = require('./inventory-data');
const prisma = new PrismaClient();

const COLOR_SETS = {
  'egyptian': [
    { name: 'عنابي', hex: '#7E1F2D', image: '/images/rug-burgundy.png' },
    { name: 'بيج', hex: '#C8A97E', image: '/images/rug-beige.png' }
  ],
  'belgian-silk': [
    { name: 'بيج', hex: '#C8A97E', image: '/images/rug-beige.png' },
    { name: 'أزرق', hex: '#3E627F', image: '/images/rug-blue.png' }
  ],
  'turkish': [
    { name: 'عنابي', hex: '#7E1F2D', image: '/images/rug-burgundy.png' },
    { name: 'رمادي', hex: '#777777', image: '/images/rug-gray.png' }
  ],
  'wool': [
    { name: 'بيج', hex: '#C8A97E', image: '/images/rug-beige.png' },
    { name: 'عنابي', hex: '#7E1F2D', image: '/images/rug-burgundy.png' }
  ],
  'kitchen-runners': [
    { name: 'رمادي', hex: '#777777', image: '/images/rug-gray.png' },
    { name: 'بيج', hex: '#C8A97E', image: '/images/rug-beige.png' }
  ],
  'round': [
    { name: 'بيج', hex: '#C8A97E', image: '/images/rug-beige.png' },
    { name: 'عنابي', hex: '#7E1F2D', image: '/images/rug-burgundy.png' }
  ],
  'royal-classic': [
    { name: 'عنابي', hex: '#7E1F2D', image: '/images/rug-burgundy.png' },
    { name: 'بيج', hex: '#C8A97E', image: '/images/rug-beige.png' }
  ],
  'modern-collections': [
    { name: 'رمادي', hex: '#777777', image: '/images/rug-gray.png' },
    { name: 'بيج', hex: '#C8A97E', image: '/images/rug-beige.png' }
  ],
  'rolls': [
    { name: 'رمادي', hex: '#777777', image: '/images/rug-gray.png' },
    { name: 'عنابي', hex: '#7E1F2D', image: '/images/rug-burgundy.png' }
  ],
  'flooring-pvc': [
    { name: 'خشبي فاتح', hex: '#B89A72', image: null },
    { name: 'رمادي', hex: '#777777', image: null }
  ]
};

function patternsFor(category) {
  if (category === 'kitchen-runners') return ['هندسية', 'نقشة خفيفة'];
  if (category === 'round') return ['ميدالية دائرية', 'زخرفة كلاسيكية'];
  if (category === 'modern-collections') return ['مودرن هندسية', 'هادئة'];
  if (category === 'flooring-pvc') return ['خشبي', 'مودرن'];
  if (category === 'rolls') return ['كلاسيكية', 'سادة'];
  if (category === 'wool') return ['شرقية', 'هندسية'];
  return ['ميدالية شرقية', 'ورود كلاسيكية'];
}

function cleanSizeForSku(value) {
  return String(value).replace(/\s+/g, '').replace(/[^0-9A-Za-z]+/g, '-').replace(/^-|-$/g, '').slice(0, 36) || 'SIZE';
}

async function main() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'CHANGE_ME_TO_A_LONG_RANDOM_PASSWORD';
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: Role.ADMIN },
    create: { email: adminEmail, name: 'Store Admin', passwordHash, role: Role.ADMIN }
  });

  const categoryMap = {};
  const categoryEntries = Object.entries(categories);
  for (let i = 0; i < categoryEntries.length; i++) {
    const [slug, meta] = categoryEntries[i];
    categoryMap[slug] = await prisma.category.upsert({
      where: { slug },
      update: { name: meta.name, image: meta.image, sortOrder: i, active: true },
      create: { name: meta.name, slug, image: meta.image, sortOrder: i, active: true }
    });
  }

  // Old demo categories stay in the database for safety, but disappear from the storefront.
  await prisma.category.updateMany({
    where: { slug: { notIn: Object.keys(categories) } },
    data: { active: false }
  });
  await prisma.product.updateMany({
    where: { slug: { in: ['vienna','pearl','mumbai','latte','royal-heritage','winter-comfort'] } },
    data: { active: false }
  });

  const ranked = [...products].sort((a,b) => b.entries.length - a.entries.length);
  const featuredSlugs = new Set(ranked.slice(0, 12).map(p => p.slug));
  const bestsellerSlugs = new Set(ranked.slice(0, 10).map(p => p.slug));

  for (const p of products) {
    const priceText = p.maxPrice > p.basePrice
      ? `الأسعار المسجلة في القائمة من ${p.basePrice} إلى ${p.maxPrice} شيكل حسب المقاس/الخيار.`
      : `السعر المسجل في القائمة ${p.basePrice} شيكل حسب المقاس المتاح.`;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: `${p.name} من مخزون عتابه. ${priceText} الصورة الحالية استرشادية للمجموعة حتى رفع صور المنتج الأصلية.`,
        categoryId: categoryMap[p.category].id,
        basePrice: p.basePrice,
        compareAt: null,
        image: p.image,
        gallery: [p.image, '/images/rug-beige.png', '/images/rug-burgundy.png'],
        featured: featuredSlugs.has(p.slug),
        bestseller: bestsellerSlugs.has(p.slug),
        isNew: p.status === 'جديد',
        active: true
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: `${p.name} من مخزون عتابه. ${priceText} الصورة الحالية استرشادية للمجموعة حتى رفع صور المنتج الأصلية.`,
        categoryId: categoryMap[p.category].id,
        basePrice: p.basePrice,
        compareAt: null,
        image: p.image,
        gallery: [p.image, '/images/rug-beige.png', '/images/rug-burgundy.png'],
        featured: featuredSlugs.has(p.slug),
        bestseller: bestsellerSlugs.has(p.slug),
        isNew: p.status === 'جديد',
        active: true
      }
    });

    const colors = COLOR_SETS[p.category] || COLOR_SETS['modern-collections'];
    const patternChoices = patternsFor(p.category);
    const multiPrice = p.maxPrice > p.basePrice;

    for (const entry of p.entries) {
      const entryPatterns = multiPrice
        ? [entry.price === p.basePrice ? patternChoices[0] : patternChoices[1]]
        : patternChoices;
      for (let ci = 0; ci < colors.length; ci++) {
        for (let pi = 0; pi < entryPatterns.length; pi++) {
          const color = colors[ci];
          const pattern = entryPatterns[pi];
          const sku = `${p.slug.toUpperCase()}-${entry.row}-${cleanSizeForSku(entry.size)}-C${ci+1}-P${pi+1}`;
          await prisma.variant.upsert({
            where: { sku },
            update: {
              productId: product.id,
              size: entry.size,
              color: color.name,
              colorHex: color.hex,
              pattern,
              image: color.image || p.image,
              price: entry.price,
              stock: 10,
              active: true
            },
            create: {
              productId: product.id,
              sku,
              size: entry.size,
              color: color.name,
              colorHex: color.hex,
              pattern,
              image: color.image || p.image,
              price: entry.price,
              stock: 10,
              active: true
            }
          });
        }
      }
    }
  }
}

main().finally(() => prisma.$disconnect());
