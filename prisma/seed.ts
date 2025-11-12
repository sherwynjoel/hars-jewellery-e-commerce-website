import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@harsjewellery.com' },
    update: {
      emailVerifiedAt: new Date(), // Ensure admin email is verified
      role: 'ADMIN' // Ensure role is ADMIN
    },
    create: {
      email: 'admin@harsjewellery.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      emailVerifiedAt: new Date() // Admin email is pre-verified
    }
  })

  // Create sample user
  const userPassword = await bcrypt.hash('user123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {
      emailVerifiedAt: new Date(), // Ensure test user email is verified
    },
    create: {
      email: 'user@example.com',
      name: 'John Doe',
      password: userPassword,
      role: 'USER',
      emailVerifiedAt: new Date() // Test user email is pre-verified
    }
  })

  // Create sample products with Indian Rupees pricing
  const products = [
    {
      name: 'Classic Gold Ring',
      description: 'A timeless gold ring with elegant design, perfect for any occasion.',
      price: 24999, // ₹24,999
      image: '/placeholder-jewelry.jpg',
      category: 'Rings',
      stockCount: 10,
      inStock: true
    },
    {
      name: 'Diamond Necklace',
      description: 'Exquisite diamond necklace that sparkles with every movement.',
      price: 108999, // ₹1,08,999
      image: '/placeholder-jewelry.jpg',
      category: 'Necklaces',
      stockCount: 5,
      inStock: true
    },
    {
      name: 'Pearl Earrings',
      description: 'Elegant pearl earrings that add sophistication to any outfit.',
      price: 16699, // ₹16,699
      image: '/placeholder-jewelry.jpg',
      category: 'Earrings',
      stockCount: 15,
      inStock: true
    },
    {
      name: 'Silver Bracelet',
      description: 'Beautiful silver bracelet with intricate patterns.',
      price: 12499, // ₹12,499
      image: '/placeholder-jewelry.jpg',
      category: 'Bracelets',
      stockCount: 8,
      inStock: true
    },
    {
      name: 'Luxury Watch',
      description: 'Premium luxury watch with Swiss movement.',
      price: 208999, // ₹2,08,999
      image: '/placeholder-jewelry.jpg',
      category: 'Watches',
      stockCount: 3,
      inStock: true
    },
    {
      name: 'Wedding Ring Set',
      description: 'Beautiful wedding ring set for the perfect couple.',
      price: 74999, // ₹74,999
      image: '/placeholder-jewelry.jpg',
      category: 'Rings',
      stockCount: 0,
      inStock: false
    }
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product
    })
  }

  console.log('Database seeded successfully!')
  console.log('Admin credentials: admin@harsjewellery.com / admin123')
  console.log('User credentials: user@example.com / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
