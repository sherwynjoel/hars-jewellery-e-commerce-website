// Script to delete a user by email
// Usage: node delete-user.js user@example.com

require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function deleteUser(email) {
  try {
    if (!email) {
      console.log('❌ Please provide an email address')
      console.log('Usage: node delete-user.js user@example.com')
      process.exit(1)
    }

    console.log(`🔍 Looking for user with email: ${email}`)
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        _count: {
          select: {
            orders: true,
            cart: true
          }
        }
      }
    })

    if (!user) {
      console.log(`❌ User with email ${email} not found`)
      process.exit(1)
    }

    console.log('\n📋 User Details:')
    console.log(`   ID: ${user.id}`)
    console.log(`   Name: ${user.name || 'N/A'}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Orders: ${user._count.orders}`)
    console.log(`   Cart Items: ${user._count.cart}`)
    console.log('')

    // Delete user (cascade will delete related data)
    await prisma.user.delete({
      where: { id: user.id }
    })

    console.log(`✅ User ${email} deleted successfully!`)
    console.log(`   - User account deleted`)
    console.log(`   - ${user._count.orders} order(s) deleted`)
    console.log(`   - ${user._count.cart} cart item(s) deleted`)
    
  } catch (error) {
    console.error('❌ Error deleting user:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

const email = process.argv[2]
deleteUser(email)

