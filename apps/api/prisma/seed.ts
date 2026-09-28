/**
 * CraftSouq Database Seed
 *
 * Populates the database with:
 *  - 1 admin user  (phone: 01000000000, dev OTP: 1234)
 *  - 4 verified sellers + stores
 *  - Category tree (9 root categories + sub-categories)
 *  - 20 realistic Arabic products (ceramics / crochet / copper)
 *  - 2 sample orders across different statuses
 */

import { PrismaClient, UserRole, BadgeStatus, ProductStatus, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\s،,؟?]/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function picsum(id: number, w = 600, h = 600): string {
  return `https://picsum.photos/seed/${id}/${w}/${h}`;
}

// ─── Categories ─────────────────────────────────────────────────────────────

const ROOT_CATEGORIES = [
  { nameAr: 'سيراميك وخزف', image: picsum(10) },
  { nameAr: 'كروشيه وتريكو', image: picsum(20) },
  { nameAr: 'خشب', image: picsum(30) },
  { nameAr: 'جلد طبيعي', image: picsum(40) },
  { nameAr: 'نحاس ومعادن', image: picsum(50) },
  { nameAr: 'تطريز وأقمشة', image: picsum(60) },
  { nameAr: 'شموع', image: picsum(70) },
  { nameAr: 'إكسسوارات', image: picsum(80) },
  { nameAr: 'فنون', image: picsum(90) },
];

// Sub-categories per root (by index)
const SUB_CATEGORIES: Record<number, string[]> = {
  0: ['طواجن ووعاء', 'أكواب وفناجين', 'أطباق ومزهريات'],
  1: ['حقائب كروشيه', 'بطانيات', 'إكسسوارات الشعر'],
  4: ['لوحات نحاسية', 'أدوات منزلية نحاسية'],
};

// ─── Sellers ────────────────────────────────────────────────────────────────

const SELLERS = [
  {
    name: 'نور حسن',
    phone: '01100000001',
    governorate: 'القاهرة',
    store: {
      name: 'ورشة نور للسيراميك',
      bio: 'منتجات سيراميك مصنوعة يدويًا بأصالة مصرية',
      governorate: 'القاهرة',
      shippingZones: ['القاهرة', 'الجيزة', 'الإسكندرية'],
    },
  },
  {
    name: 'أميرة سالم',
    phone: '01100000002',
    governorate: 'الإسكندرية',
    store: {
      name: 'بيت الكروشيه',
      bio: 'تصاميم كروشيه فريدة من وحي البحر المتوسط',
      governorate: 'الإسكندرية',
      shippingZones: ['الإسكندرية', 'البحيرة'],
    },
  },
  {
    name: 'محمود فتحي',
    phone: '01100000003',
    governorate: 'الفيوم',
    store: {
      name: 'حرف النحاس الفيومية',
      bio: 'نحاسيات تقليدية وفنية من قلب الفيوم',
      governorate: 'الفيوم',
      shippingZones: ['الفيوم', 'القاهرة', 'الجيزة'],
    },
  },
  {
    name: 'دينا الشافعي',
    phone: '01100000004',
    governorate: 'الأقصر',
    store: {
      name: 'نسيج الأقصر',
      bio: 'تطريز فرعوني وأقمشة مصنوعة يدويًا من الصعيد',
      governorate: 'الأقصر',
      shippingZones: ['الأقصر', 'أسوان', 'سوهاج'],
    },
  },
];

// ─── Products ────────────────────────────────────────────────────────────────

type ProductSeed = {
  name: string;
  description: string;
  materials: string;
  priceEgp: number;
  stockQty: number;
  madeToOrder: boolean;
  productionDays?: number;
  images: string[];
  featured: boolean;
  categoryKey: string; // root category nameAr
};

const PRODUCTS: ProductSeed[] = [
  // ── Ceramics (seller 0) ─────────────────────────────────────────────────
  {
    name: 'طاجن فخار مزخرف',
    description: 'طاجن مصنوع يدويًا من الفخار الأصيل، مزخرف بنقوش فرعونية بألوان طبيعية. مناسب للاستخدام في الفرن ويحافظ على نكهة الطعام.',
    materials: 'فخار طبيعي، ألوان طبيعية',
    priceEgp: 350,
    stockQty: 15,
    madeToOrder: false,
    images: [picsum(101), picsum(102)],
    featured: true,
    categoryKey: 'سيراميك وخزف',
  },
  {
    name: 'طقم فناجين قهوة',
    description: 'طقم من 6 فناجين قهوة سيراميك مصنوعة يدويًا بألوان الأرض الدافئة. كل فنجان فريد بزخرفته وإحساسه.',
    materials: 'سيراميك عالي الجودة',
    priceEgp: 480,
    stockQty: 8,
    madeToOrder: false,
    images: [picsum(103), picsum(104)],
    featured: false,
    categoryKey: 'سيراميك وخزف',
  },
  {
    name: 'مزهرية سيراميك بنقوش إسلامية',
    description: 'مزهرية أنيقة بنقوش هندسية إسلامية تقليدية، مثالية للزينة المنزلية وهدايا الأعياد.',
    materials: 'سيراميك مع طلاء زجاجي',
    priceEgp: 220,
    stockQty: 20,
    madeToOrder: true,
    productionDays: 7,
    images: [picsum(105), picsum(106)],
    featured: true,
    categoryKey: 'سيراميك وخزف',
  },
  {
    name: 'طبق تقديم فخاري كبير',
    description: 'طبق تقديم دائري من الفخار، يُستخدم للفواكه والحلويات. يضفي لمسة تراثية أصيلة على مائدتك.',
    materials: 'فخار مشوي',
    priceEgp: 195,
    stockQty: 12,
    madeToOrder: false,
    images: [picsum(107)],
    featured: false,
    categoryKey: 'سيراميك وخزف',
  },
  {
    name: 'كوب قهوة تركي فخاري',
    description: 'كوب قهوة تركي بحجم 80 مل، مزخرف بزهور برتقالية، يمنح تجربة شرب قهوة أصيلة.',
    materials: 'فخار مشوي وأصباغ طبيعية',
    priceEgp: 85,
    stockQty: 30,
    madeToOrder: false,
    images: [picsum(108)],
    featured: false,
    categoryKey: 'سيراميك وخزف',
  },

  // ── Crochet (seller 1) ──────────────────────────────────────────────────
  {
    name: 'حقيبة كروشيه بوهيمية',
    description: 'حقيبة كروشيه يدوية بتصميم بوهيمي، مثالية للإطلالات الصيفية. مزودة بجيب داخلي وحمالة قابلة للتعديل.',
    materials: 'خيوط قطن طبيعي، بطانة قماشية',
    priceEgp: 320,
    stockQty: 7,
    madeToOrder: true,
    productionDays: 5,
    images: [picsum(201), picsum(202)],
    featured: true,
    categoryKey: 'كروشيه وتريكو',
  },
  {
    name: 'بطانية كروشيه للأطفال',
    description: 'بطانية ناعمة ودافئة مصنوعة يدويًا بخيوط قطنية آمنة للأطفال. تأتي بألوان متعددة حسب الطلب.',
    materials: 'خيوط قطن مصري طويل التيلة',
    priceEgp: 550,
    stockQty: 5,
    madeToOrder: true,
    productionDays: 10,
    images: [picsum(203), picsum(204)],
    featured: false,
    categoryKey: 'كروشيه وتريكو',
  },
  {
    name: 'طقم إكسسوارات شعر كروشيه',
    description: 'طقم من 3 قطع: عقال، وربطة شعر، ومشبك. مصنوع يدويًا بزهور صغيرة جميلة.',
    materials: 'خيوط كروشيه ناعمة',
    priceEgp: 120,
    stockQty: 18,
    madeToOrder: false,
    images: [picsum(205)],
    featured: false,
    categoryKey: 'كروشيه وتريكو',
  },
  {
    name: 'سجادة جوت كروشيه دائرية',
    description: 'سجادة دائرية من خيوط الجوت الطبيعي، بأنماط هندسية أنيقة، مناسبة لغرف المعيشة والمداخل.',
    materials: 'خيوط جوت طبيعي',
    priceEgp: 480,
    stockQty: 4,
    madeToOrder: true,
    productionDays: 14,
    images: [picsum(206), picsum(207)],
    featured: true,
    categoryKey: 'كروشيه وتريكو',
  },
  {
    name: 'حقيبة تسوق كروشيه كبيرة',
    description: 'حقيبة تسوق فسيحة مصنوعة من خيوط الكتان الطبيعي. صديقة للبيئة وقوية التحمل.',
    materials: 'خيوط كتان طبيعي',
    priceEgp: 180,
    stockQty: 10,
    madeToOrder: false,
    images: [picsum(208)],
    featured: false,
    categoryKey: 'كروشيه وتريكو',
  },

  // ── Copper (seller 2) ────────────────────────────────────────────────────
  {
    name: 'لوحة نحاسية مزخرفة بالخط العربي',
    description: 'لوحة نحاسية مشغولة يدويًا بخط عربي أنيق (آية الكرسي)، مع إطار خشبي عتيق. قطعة فن أصيلة تزين أي منزل.',
    materials: 'نحاس أصفر, خشب جوز',
    priceEgp: 890,
    stockQty: 3,
    madeToOrder: true,
    productionDays: 14,
    images: [picsum(301), picsum(302)],
    featured: true,
    categoryKey: 'نحاس ومعادن',
  },
  {
    name: 'صينية نحاس مطروق تقليدية',
    description: 'صينية نحاس مطروق على الطريقة التقليدية الفيومية، مزخرفة بأنماط هندسية ونباتية. مثالية لتقديم الشاي.',
    materials: 'نحاس أصفر مطروق',
    priceEgp: 650,
    stockQty: 6,
    madeToOrder: false,
    images: [picsum(303), picsum(304)],
    featured: true,
    categoryKey: 'نحاس ومعادن',
  },
  {
    name: 'إبريق قهوة نحاسي مزخرف',
    description: 'إبريق قهوة عربية من النحاس الأصفر، مزخرف بنقوش زهرية. حجم 500 مل.',
    materials: 'نحاس أصفر',
    priceEgp: 420,
    stockQty: 9,
    madeToOrder: false,
    images: [picsum(305)],
    featured: false,
    categoryKey: 'نحاس ومعادن',
  },
  {
    name: 'شمعدان نحاسي زوجي',
    description: 'شمعدانان نحاسيان بارتفاع 25 سم، مثاليان للمناسبات والديكور الكلاسيكي.',
    materials: 'نحاس أصفر مصقول',
    priceEgp: 580,
    stockQty: 5,
    madeToOrder: false,
    images: [picsum(306)],
    featured: false,
    categoryKey: 'نحاس ومعادن',
  },
  {
    name: 'لافتة اسم نحاسية مخصصة',
    description: 'لافتة باسمك أو اسم عزيز عليك، مشغولة يدويًا من النحاس، مثالية لتعليقها على باب غرفتك.',
    materials: 'نحاس أصفر',
    priceEgp: 250,
    stockQty: 0,
    madeToOrder: true,
    productionDays: 5,
    images: [picsum(307)],
    featured: false,
    categoryKey: 'نحاس ومعادن',
  },

  // ── Embroidery (seller 3) ────────────────────────────────────────────────
  {
    name: 'كوفية مطرزة بنقوش فرعونية',
    description: 'كوفية قطنية بيضاء مطرزة يدويًا بنقوش فرعونية ملونة. تعكس أصالة الحرفة المصرية.',
    materials: 'قطن مصري، خيوط حريرية',
    priceEgp: 380,
    stockQty: 8,
    madeToOrder: true,
    productionDays: 10,
    images: [picsum(401), picsum(402)],
    featured: true,
    categoryKey: 'تطريز وأقمشة',
  },
  {
    name: 'وسادة مطرزة بالخيوط الملونة',
    description: 'وسادة ديكور مطرزة يدويًا بزهور ملونة مستوحاة من الطبيعة النوبية. حجم 45×45 سم.',
    materials: 'قطن مصري، خيوط حرير',
    priceEgp: 210,
    stockQty: 12,
    madeToOrder: false,
    images: [picsum(403)],
    featured: false,
    categoryKey: 'تطريز وأقمشة',
  },
  {
    name: 'شال تطريز فرعوني',
    description: 'شال فاخر من الحرير الطبيعي مطرز يدويًا بنقوش فرعونية ذهبية وحمراء.',
    materials: 'حرير طبيعي، خيوط ذهبية',
    priceEgp: 750,
    stockQty: 4,
    madeToOrder: true,
    productionDays: 21,
    images: [picsum(404), picsum(405)],
    featured: true,
    categoryKey: 'تطريز وأقمشة',
  },
];

// ─── Main Seed ───────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Admin user
  console.log('  → Creating admin user...');
  const admin = await prisma.user.upsert({
    where: { phone: '01000000000' },
    update: {},
    create: {
      phone: '01000000000',
      name: 'مدير النظام',
      role: UserRole.ADMIN,
      governorate: 'القاهرة',
    },
  });

  // 2. Categories
  console.log('  → Seeding categories...');
  const categoryMap: Record<string, string> = {};

  for (const cat of ROOT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { nameAr: cat.nameAr, parentId: null },
    });
    if (existing) {
      categoryMap[cat.nameAr] = existing.id;
      continue;
    }
    const created = await prisma.category.create({
      data: { nameAr: cat.nameAr, image: cat.image },
    });
    categoryMap[cat.nameAr] = created.id;
  }

  // Sub-categories
  const rootNames = ROOT_CATEGORIES.map((c) => c.nameAr);
  for (const [idx, subs] of Object.entries(SUB_CATEGORIES)) {
    const parentName = rootNames[Number(idx)];
    const parentId = categoryMap[parentName];
    if (!parentId) continue;
    for (const sub of subs) {
      const existingSub = await prisma.category.findFirst({ where: { nameAr: sub, parentId } });
      if (!existingSub) {
        await prisma.category.create({ data: { nameAr: sub, parentId } });
      }
    }
  }

  // 3. Seller users + stores
  console.log('  → Creating sellers and stores...');
  const sellerIds: string[] = [];
  const storeIds: string[] = [];

  for (const s of SELLERS) {
    const seller = await prisma.user.upsert({
      where: { phone: s.phone },
      update: {},
      create: {
        phone: s.phone,
        name: s.name,
        role: UserRole.SELLER,
        governorate: s.governorate,
      },
    });
    sellerIds.push(seller.id);

    const storeSlug = slugify(s.store.name);
    let store = await prisma.store.findFirst({ where: { ownerId: seller.id } });
    if (!store) {
      store = await prisma.store.create({
        data: {
          ownerId: seller.id,
          name: s.store.name,
          slug: storeSlug,
          bio: s.store.bio,
          governorate: s.store.governorate,
          badgeStatus: BadgeStatus.verified,
          shippingZones: s.store.shippingZones,
          ratingAvg: 4.5 + Math.random() * 0.5,
          ratingCount: 10 + Math.floor(Math.random() * 40),
        },
      });
    }
    storeIds.push(store.id);

    // Ensure seller has a wallet
    await prisma.wallet.upsert({
      where: { userId: seller.id },
      update: {},
      create: { userId: seller.id, balanceEgp: 0 },
    });
  }

  // 4. Products
  console.log('  → Seeding products...');
  // Map seller index to store
  const sellerStoreMap: Record<string, string> = {
    'سيراميك وخزف': storeIds[0],
    'كروشيه وتريكو': storeIds[1],
    'نحاس ومعادن': storeIds[2],
    'تطريز وأقمشة': storeIds[3],
  };

  const createdProductIds: string[] = [];

  for (const p of PRODUCTS) {
    const catId = categoryMap[p.categoryKey];
    const storeId = sellerStoreMap[p.categoryKey];
    if (!catId || !storeId) {
      console.warn(`  ⚠ Skipping product "${p.name}" — missing category or store`);
      continue;
    }
    const existing = await prisma.product.findFirst({ where: { name: p.name, storeId } });
    if (existing) {
      createdProductIds.push(existing.id);
      continue;
    }
    const product = await prisma.product.create({
      data: {
        storeId,
        categoryId: catId,
        name: p.name,
        description: p.description,
        materials: p.materials,
        priceEgp: p.priceEgp,
        stockQty: p.stockQty,
        madeToOrder: p.madeToOrder,
        productionDays: p.productionDays ?? null,
        images: p.images,
        status: ProductStatus.active,
        featured: p.featured,
      },
    });
    createdProductIds.push(product.id);
  }

  // 5. Sample buyer
  console.log('  → Creating sample buyer...');
  const buyer = await prisma.user.upsert({
    where: { phone: '01200000001' },
    update: {},
    create: {
      phone: '01200000001',
      name: 'أحمد محمد',
      role: UserRole.BUYER,
      governorate: 'القاهرة',
      wallet: { create: { balanceEgp: 0 } },
    },
  });

  // 6. Sample orders
  console.log('  → Creating sample orders...');
  const address = {
    name: 'أحمد محمد',
    phone: '01200000001',
    governorate: 'القاهرة',
    street: '15 شارع التحرير، وسط البلد',
  };

  const productForOrder1 = createdProductIds[0];
  const productForOrder2 = createdProductIds[5];

  if (productForOrder1) {
    const existingOrder1 = await prisma.order.findFirst({
      where: { buyerId: buyer.id, storeId: storeIds[0], status: OrderStatus.delivered },
    });
    if (!existingOrder1) {
      const order1 = await prisma.order.create({
        data: {
          buyerId: buyer.id,
          storeId: storeIds[0],
          status: OrderStatus.delivered,
          paymentMethod: PaymentMethod.cod,
          paymentStatus: PaymentStatus.paid,
          subtotalEgp: 350,
          shippingFeeEgp: 35,
          commissionEgp: 35,
          totalEgp: 385,
          addressSnapshot: address,
          notes: 'يرجى التغليف بعناية',
          items: {
            create: {
              productId: productForOrder1,
              qty: 1,
              unitPrice: 350,
            },
          },
          shipment: {
            create: {
              courier: 'bosta',
              trackingNumber: 'BOSTA-SEED-1001',
              status: 'delivered',
              codAmount: 385,
            },
          },
          codOtp: {
            create: {
              code: '5678',
              expiresAt: new Date(Date.now() + 86400000),
              confirmed: true,
            },
          },
          review: {
            create: {
              storeId: storeIds[0],
              buyerId: buyer.id,
              rating: 5,
              comment: 'منتج رائع وجودة ممتازة، أنصح به!',
              images: [],
            },
          },
        },
      });

      const sellerStore = await prisma.store.findUnique({ where: { id: storeIds[0] } });
      if (sellerStore) {
        const net = 315;
        const wallet = await prisma.wallet.upsert({
          where: { userId: sellerStore.ownerId },
          update: { balanceEgp: { increment: net } },
          create: { userId: sellerStore.ownerId, balanceEgp: net },
        });
        await prisma.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: 'credit',
            amount: net,
            refType: 'order',
            refId: order1.id,
            note: 'أرباح طلب تجريبي (seed)',
          },
        });
        await prisma.store.update({
          where: { id: storeIds[0] },
          data: { ratingCount: 1, ratingAvg: 5 },
        });
      }
    }
  }

  if (productForOrder2 && storeIds[1]) {
    const existingOrder2 = await prisma.order.findFirst({
      where: { buyerId: buyer.id, storeId: storeIds[1], status: OrderStatus.shipped },
    });
    if (!existingOrder2) {
      await prisma.order.create({
        data: {
          buyerId: buyer.id,
          storeId: storeIds[1],
          status: OrderStatus.shipped,
          paymentMethod: PaymentMethod.cod,
          paymentStatus: PaymentStatus.pending,
          subtotalEgp: 320,
          shippingFeeEgp: 50,
          commissionEgp: 32,
          totalEgp: 370,
          addressSnapshot: address,
          items: {
            create: {
              productId: productForOrder2,
              qty: 1,
              unitPrice: 320,
            },
          },
          shipment: {
            create: {
              courier: 'bosta',
              trackingNumber: 'BOSTA-SEED-2002',
              status: 'in_transit',
              codAmount: 370,
            },
          },
          codOtp: {
            create: {
              code: '5678',
              expiresAt: new Date(Date.now() + 86400000),
              confirmed: true,
            },
          },
        },
      });
    }
  }

  // 7. Sample banners
  console.log('  → Creating banners...');
  const bannerCount = await prisma.banner.count();
  if (bannerCount === 0) {
    await prisma.banner.createMany({
      data: [
        { title: 'تسوق المنتجات المصرية اليدوية', image: picsum(500, 1200, 400), position: 1, active: true },
        { title: 'حرف أصيلة من قلب مصر', image: picsum(501, 1200, 400), position: 2, active: true },
        { title: 'ادعم الحرفيين المحليين', image: picsum(502, 1200, 400), position: 3, active: true },
      ],
    });
  }

  console.log('✅ Seed complete!');
  console.log('');
  console.log('   Admin:  01000000000 / OTP: 1234');
  console.log('   Sellers: 01100000001–01100000004 / OTP: 1234');
  console.log('   Buyer:  01200000001 / OTP: 1234');
  console.log(`   Categories: ${Object.keys(categoryMap).length} root + sub-categories`);
  console.log(`   Products: ${createdProductIds.length} created`);
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
