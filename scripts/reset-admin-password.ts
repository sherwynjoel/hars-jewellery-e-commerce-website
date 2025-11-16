import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/**
 * Script to reset admin password
 * Usage: tsx scripts/reset-admin-password.ts
 */
async function resetAdminPassword() {
  const ADMIN_EMAIL = 'harsjewellery2005@gmail.com'
  
  // Default password - change this to your desired password
  const NEW_PASSWORD = 'admin123'
  
  try {
    console.log('🔐 Resetting admin password...')
    console.log(`📧 Admin Email: ${ADMIN_EMAIL}\n`)
    
    // Find the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL }
    })
    
    if (!adminUser) {
      console.error(`❌ Admin user with email ${ADMIN_EMAIL} not found.`)
      console.log('   Run: npm run setup:admin')
      process.exit(1)
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 12)
    
    // Update the password
    await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: {
        password: hashedPassword
      }
    })
    
    console.log(`✅ Password reset successful!`)
    console.log(`\n📧 Email: ${ADMIN_EMAIL}`)
    console.log(`🔑 New Password: ${NEW_PASSWORD}`)
    console.log(`\n⚠️  IMPORTANT: Please change this password after logging in!\n`)
    
  } catch (error) {
    console.error('❌ Error resetting password:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

resetAdminPassword()

