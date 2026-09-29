import { notFound } from 'next/navigation';
import { prisma } from '../../../lib/db';
import ProductConfigurator from '../../../components/ProductConfigurator';

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: {
        where: { active: true, stock: { gt: 0 } },
        orderBy: [{ color: 'asc' }, { pattern: 'asc' }, { price: 'asc' }, { size: 'asc' }]
      }
    }
  });
  if (!product || !product.active) notFound();
  const safe = JSON.parse(JSON.stringify(product));
  return (
    <main>
      <section className="section">
        <div className="container">
          <ProductConfigurator product={safe} />
        </div>
      </section>
    </main>
  );
}
