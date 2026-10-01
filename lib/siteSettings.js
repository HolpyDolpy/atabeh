import { prisma } from './db';

export const HOME_DEFAULTS = {
  heroVideo: '/videos/hero-loop.mp4',
  heroPoster: '/videos/hero-a.jpg',
  promoImage1: '/images/rug-1.png',
  promoTitle1: 'تفاصيل تختارها أنت',
  promoText1: 'المدير يحدد النوع والمقاسات والصور لكل منتج، وأنت ترى الخيارات المتاحة بوضوح.',
  promoLink1: '/shop',
  promoImage2: '/images/rug-2.png',
  promoTitle2: 'اختيار أسهل للبيت',
  promoText2: 'ابحث بالاسم أو النوع أو اللون أو النقشة، وسنعرض لك أقرب النتائج حتى لو لم تكتب الاسم حرفياً.',
  promoLink2: '/shop'
};

export async function getHomeSettings(){
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: Object.keys(HOME_DEFAULTS) } } });
  const values = {...HOME_DEFAULTS};
  for (const row of rows) values[row.key] = row.value;
  return values;
}
