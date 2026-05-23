import { PrismaClient } from '@prisma/client';
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.reservation.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.product.deleteMany();
  await prisma.warehouse.deleteMany();

  // Create Warehouses
  const warehouseA = await prisma.warehouse.create({
    data: {
      name: 'Warehouse North',
      location: 'New York',
    },
  });

  const warehouseB = await prisma.warehouse.create({
    data: {
      name: 'Warehouse West',
      location: 'San Francisco',
    },
  });

  // Premium Product Images
  const products = [
    {
      name: 'Allo Sound Pro Max',
      description: 'Experience pure sound with active noise cancellation, spatial audio, and 40 hours of battery life.',
      sku: 'ALLO-AUD-01',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000',
    },
    {
      name: 'Allo Watch Series X',
      description: 'The ultimate fitness companion. Advanced sensors for health, heart rate, and seamless integration.',
      sku: 'ALLO-WCH-02',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1000',
    },
    {
      name: 'Allo Power Hub 20K',
      description: 'Fast charging for all your devices. 20,000mAh capacity in a sleek, travel-friendly design.',
      sku: 'ALLO-PWR-03',
      imageUrl: 'https://images.unsplash.com/photo-1619134766030-6686051c9cc9?auto=format&fit=crop&q=80&w=1000',
    },
    {
      name: 'Allo Lens Pro Camera',
      description: 'Capture every moment in stunning detail with our flagship mirrorless camera system.',
      sku: 'ALLO-CAM-04',
      imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000',
    },
  ];

  for (const productData of products) {
    const product = await prisma.product.create({
      data: productData,
    });

    // Create Stocks for each product in each warehouse
    await prisma.stock.create({
      data: {
        productId: product.id,
        warehouseId: warehouseA.id,
        total: Math.floor(Math.random() * 30) + 5,
        reserved: 0,
      },
    });

    await prisma.stock.create({
      data: {
        productId: product.id,
        warehouseId: warehouseB.id,
        total: Math.floor(Math.random() * 30) + 5,
        reserved: 0,
      },
    });
  }

  console.log('Premium seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
