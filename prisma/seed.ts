import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  CacheLayer,
  StockMovementType,
} from '../generated/prisma/enums';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing existing data (children first)...');

  await prisma.cacheLog.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log('Creating categories...');

  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Devices, gadgets and accessories',
      imageUrl: 'https://example.com/images/electronics.jpg',
    },
  });

  const clothing = await prisma.category.create({
    data: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Apparel for men and women',
      imageUrl: 'https://example.com/images/clothing.jpg',
    },
  });

  const home = await prisma.category.create({
    data: {
      name: 'Home',
      slug: 'home',
      description: 'Household and furniture items',
      imageUrl: 'https://example.com/images/home.jpg',
    },
  });

  const phones = await prisma.category.create({
    data: {
      name: 'Phones',
      slug: 'phones',
      parentId: electronics.id,
      description: 'Smartphones',
      imageUrl: 'https://example.com/images/phones.jpg',
    },
  });

  const laptops = await prisma.category.create({
    data: {
      name: 'Laptops',
      slug: 'laptops',
      parentId: electronics.id,
      description: 'Portable computers',
      imageUrl: 'https://example.com/images/laptops.jpg',
    },
  });

  const headphones = await prisma.category.create({
    data: {
      name: 'Headphones',
      slug: 'headphones',
      parentId: electronics.id,
      description: 'Audio headphones',
      imageUrl: 'https://example.com/images/headphones.jpg',
    },
  });

  const clothingMen = await prisma.category.create({
    data: {
      name: 'Men',
      slug: 'men',
      parentId: clothing.id,
      description: 'Men clothing',
    },
  });

  const clothingWomen = await prisma.category.create({
    data: {
      name: 'Women',
      slug: 'women',
      parentId: clothing.id,
      description: 'Women clothing',
    },
  });

  const kitchen = await prisma.category.create({
    data: {
      name: 'Kitchen',
      slug: 'kitchen',
      parentId: home.id,
      description: 'Kitchen appliances and tools',
    },
  });

  const furniture = await prisma.category.create({
    data: {
      name: 'Furniture',
      slug: 'furniture',
      parentId: home.id,
      description: 'Home furniture',
    },
  });

  console.log('Creating products...');

  const productData = [
    // Phones
    {
      name: 'iPhone 15',
      slug: 'iphone-15',
      sku: 'APL-IP15-001',
      description: '6.1-inch smartphone with A16 Bionic chip and USB-C.',
      price: '799.00',
      compareAtPrice: '899.00',
      stock: 45,
      categoryId: phones.id,
      viewsCount: 3200,
      ratingAverage: 4.7,
      ratingCount: 1240,
    },
    {
      name: 'Samsung Galaxy S24',
      slug: 'samsung-galaxy-s24',
      sku: 'SMS-GS24-002',
      description: '6.2-inch Android phone with exceptional camera system.',
      price: '659.00',
      compareAtPrice: '759.00',
      stock: 30,
      categoryId: phones.id,
      viewsCount: 2100,
      ratingAverage: 4.5,
      ratingCount: 870,
    },
    {
      name: 'Google Pixel 8',
      slug: 'google-pixel-8',
      sku: 'GGL-PX8-003',
      description: 'Pixel with Google Tensor G3 and superb AI camera.',
      price: '699.00',
      stock: 22,
      categoryId: phones.id,
      viewsCount: 1500,
      ratingAverage: 4.4,
      ratingCount: 540,
    },
    // Laptops
    {
      name: 'MacBook Pro 14',
      slug: 'macbook-pro-14',
      sku: 'APL-MBP14-004',
      description: '14-inch laptop with M3 Pro chip and 18-hour battery.',
      price: '1999.00',
      compareAtPrice: '2199.00',
      stock: 12,
      categoryId: laptops.id,
      viewsCount: 4100,
      ratingAverage: 4.9,
      ratingCount: 980,
    },
    {
      name: 'Dell XPS 13',
      slug: 'dell-xps-13',
      sku: 'DEL-XPS13-005',
      description: 'Compact 13-inch laptop with stunning OLED display.',
      price: '1199.00',
      stock: 18,
      categoryId: laptops.id,
      viewsCount: 1800,
      ratingAverage: 4.6,
      ratingCount: 460,
    },
    {
      name: 'Lenovo ThinkPad X1',
      slug: 'lenovo-thinkpad-x1',
      sku: 'LNV-TPX1-006',
      description: 'Business laptop renowned for its keyboard and durability.',
      price: '1549.00',
      stock: 9,
      categoryId: laptops.id,
      viewsCount: 950,
      ratingAverage: 4.5,
      ratingCount: 320,
    },
    // Headphones
    {
      name: 'Sony WH-1000XM5',
      slug: 'sony-wh-1000xm5',
      sku: 'SNY-WH1000-007',
      description: 'Wireless noise-cancelling over-ear headphones.',
      price: '348.00',
      compareAtPrice: '399.00',
      stock: 60,
      categoryId: headphones.id,
      viewsCount: 2700,
      ratingAverage: 4.8,
      ratingCount: 1500,
    },
    {
      name: 'AirPods Pro 2',
      slug: 'airpods-pro-2',
      sku: 'APL-APP2-008',
      description: 'Wireless earbuds with active noise cancellation.',
      price: '249.00',
      stock: 75,
      categoryId: headphones.id,
      viewsCount: 3400,
      ratingAverage: 4.7,
      ratingCount: 2100,
    },
    // Mens clothing
    {
      name: 'Classic Denim Jacket',
      slug: 'classic-denim-jacket',
      sku: 'CLT-MDJ-009',
      description: 'Timeless blue denim jacket in medium weight cotton.',
      price: '79.99',
      compareAtPrice: '99.99',
      stock: 33,
      categoryId: clothingMen.id,
      viewsCount: 700,
      ratingAverage: 4.3,
      ratingCount: 180,
    },
    {
      name: 'Cotton Crew T-Shirt',
      slug: 'cotton-crew-tshirt',
      sku: 'CLT-MCT-010',
      description: 'Soft 100% cotton classic crew neck t-shirt.',
      price: '24.99',
      stock: 120,
      categoryId: clothingMen.id,
      viewsCount: 500,
      ratingAverage: 4.2,
      ratingCount: 260,
    },
    // Womens clothing
    {
      name: 'Floral Summer Dress',
      slug: 'floral-summer-dress',
      sku: 'CLT-WFD-011',
      description: 'Light floral-print dress perfect for warm weather.',
      price: '59.99',
      stock: 28,
      categoryId: clothingWomen.id,
      viewsCount: 880,
      ratingAverage: 4.4,
      ratingCount: 210,
    },
    {
      name: 'Leather Handbag',
      slug: 'leather-handbag',
      sku: 'CLT-WHB-012',
      description: 'Genuine leather shoulder handbag with gold clasp.',
      price: '129.99',
      compareAtPrice: '159.99',
      stock: 16,
      categoryId: clothingWomen.id,
      viewsCount: 640,
      ratingAverage: 4.6,
      ratingCount: 140,
    },
    // Kitchen
    {
      name: 'Stainless Steel Chef Knife',
      slug: 'chef-knife',
      sku: 'HOM-KCK-013',
      description: '8-inch forged chef knife with ergonomic handle.',
      price: '49.99',
      stock: 50,
      categoryId: kitchen.id,
      viewsCount: 300,
      ratingAverage: 4.8,
      ratingCount: 95,
    },
    {
      name: 'Non-Stick Frying Pan',
      slug: 'nonstick-frying-pan',
      sku: 'HOM-KFP-014',
      description: '10-inch non-stick frying pan with heat-safe handle.',
      price: '39.99',
      compareAtPrice: '49.99',
      stock: 40,
      categoryId: kitchen.id,
      viewsCount: 420,
      ratingAverage: 4.5,
      ratingCount: 130,
    },
    // Furniture
    {
      name: 'Oak Wood Dining Table',
      slug: 'oak-dining-table',
      sku: 'HOM-FDT-015',
      description: 'Solid oak 6-seater dining table, 180cm.',
      price: '549.99',
      stock: 5,
      categoryId: furniture.id,
      viewsCount: 260,
      ratingAverage: 4.7,
      ratingCount: 60,
    },
    {
      name: 'Ergonomic Office Chair',
      slug: 'ergonomic-office-chair',
      sku: 'HOM-FOC-016',
      description: 'Adjustable office chair with lumbar support.',
      price: '219.99',
      stock: 21,
      categoryId: furniture.id,
      viewsCount: 380,
      ratingAverage: 4.4,
      ratingCount: 110,
    },
  ];

  const createdProducts: { id: number; stock: number; product: (typeof productData)[number] }[] = [];

  for (const p of productData) {
    const created = await prisma.product.create({ data: p });
    createdProducts.push({ id: created.id, stock: created.stock, product: p });
  }

  console.log('Creating price history (logical past price changes)...');

  const priceChanges = [
    { slug: 'iphone-15', oldPrice: '899.00', newPrice: '799.00', reason: 'Seasonal discount' },
    { slug: 'macbook-pro-14', oldPrice: '2199.00', newPrice: '1999.00', reason: 'Launch promotion end' },
    { slug: 'sony-wh-1000xm5', oldPrice: '399.00', newPrice: '348.00', reason: 'Price drop' },
    { slug: 'leather-handbag', oldPrice: '159.99', newPrice: '129.99', reason: 'Clearance sale' },
    { slug: 'nonstick-frying-pan', oldPrice: '49.99', newPrice: '39.99', reason: 'Competitive pricing' },
  ];

  for (const c of priceChanges) {
    const product = createdProducts.find((x) => x.product.slug === c.slug);
    if (!product) continue;
    await prisma.priceHistory.create({
      data: {
        productId: product.id,
        oldPrice: c.oldPrice,
        newPrice: c.newPrice,
        reason: c.reason,
      },
    });
  }

  console.log('Creating stock movements (logical IN/OUT)...');

  const movements: {
    slug: string;
    type: StockMovementType;
    quantity: number;
    reason: string;
  }[] = [
    { slug: 'iphone-15', type: 'IN', quantity: 30, reason: 'Initial stock' },
    { slug: 'iphone-15', type: 'OUT', quantity: 15, reason: 'Orderfulfilled' },
    { slug: 'airpods-pro-2', type: 'IN', quantity: 60, reason: 'Restock from supplier' },
    { slug: 'airpods-pro-2', type: 'OUT', quantity: 25, reason: 'Orders' },
    { slug: 'macbook-pro-14', type: 'IN', quantity: 10, reason: 'Initial stock' },
    { slug: 'oak-dining-table', type: 'IN', quantity: 8, reason: 'Warehouse transfer' },
  ];

  for (const m of movements) {
    const product = createdProducts.find((x) => x.product.slug === m.slug);
    if (!product) continue;
    const previousStock = product.stock;
    const newStock =
      m.type === 'IN'
        ? previousStock + m.quantity
        : Math.max(0, previousStock - m.quantity);
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        type: m.type,
        quantity: m.quantity,
        previousStock,
        newStock,
        reason: m.reason,
      },
    });
  }

  console.log('Creating sample cache logs...');

  const iphone = createdProducts.find((x) => x.product.slug === 'iphone-15');
  if (iphone) {
    const samples: {
      layer: CacheLayer;
      hit: boolean;
      ttl: number | null;
      ms: number;
    }[] = [
      { layer: 'EDGE', hit: true, ttl: 3600, ms: 4 },
      { layer: 'DOWNSTREAM', hit: true, ttl: 600, ms: 8 },
      { layer: 'UPSTREAM', hit: false, ttl: null, ms: 45 },
    ];
    for (const s of samples) {
      await prisma.cacheLog.create({
        data: {
          productId: iphone.id,
          endpoint: '/products/iphone-15',
          cacheKey: 'product:iphone-15',
          cacheLayer: s.layer,
          hit: s.hit,
          ttlSeconds: s.ttl,
          responseTimeMs: s.ms,
        },
      });
    }
  }

  console.log('Seeding complete!');
  console.log(
    `Created ${await prisma.category.count()} categories, ` +
      `${await prisma.product.count()} products, ` +
      `${await prisma.priceHistory.count()} price history rows, ` +
      `${await prisma.stockMovement.count()} stock movements, ` +
      `${await prisma.cacheLog.count()} cache logs.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
