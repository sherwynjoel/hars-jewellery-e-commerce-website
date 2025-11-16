import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as readline from 'readline'

const prisma = new PrismaClient()

/**
 * Script to ensure only harsjewellery2005@gmail.com has admin access
 * This will:
 * 1. Create harsjewellery2005@gmail.com as ADMIN if doesn't exist
 * 2. Set harsjewellery2005@gmail.com as ADMIN (update if exists)
 * 3. Remove ADMIN role from all other users
 */
async function setupAdminEmail() {
  const ADMIN_EMAIL = 'harsjewellery2005@gmail.com'
  
  try {
    console.log('🔐 Setting up admin email restriction...')
    console.log(`📧 Admin Email: ${ADMIN_EMAIL}\n`)
    
    // Find the admin user
    let adminUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL }
    })
    
    if (!adminUser) {
      console.log(`⚠️  Admin user with email ${ADMIN_EMAIL} not found.`)
      console.log('   Creating admin user as FIRST user...\n')
      
      // Create admin user with default password
      const defaultPassword = 'Admin@2025' // Default password - user should change this
      const hashedPassword = await bcrypt.hash(defaultPassword, 12)
      
      adminUser = await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          name: 'Hars Jewellery Admin',
          password: hashedPassword,
          role: 'ADMIN',
          emailVerifiedAt: new Date(), // Pre-verify email for admin
          createdAt: new Date('2024-01-01T00:00:00Z') // Set very early date to ensure first position
        }
      })
      
      console.log(`✅ Created admin user: ${ADMIN_EMAIL}`)
      console.log(`\n🔑 Default Password: ${defaultPassword}`)
      console.log('⚠️  IMPORTANT: Please change this password after first login!\n')
    } else {
      // Update existing user to ensure they're admin, verified, and first in database
      await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: {
          role: 'ADMIN',
          emailVerifiedAt: adminUser.emailVerifiedAt || new Date(), // Ensure email is verified
          createdAt: new Date('2024-01-01T00:00:00Z') // Set early date to ensure first position
        }
      })
      
      console.log(`✅ Updated ${ADMIN_EMAIL} to ADMIN role`)
      console.log(`✅ Email verified: ${adminUser.emailVerifiedAt ? 'Yes' : 'Now verified'}\n`)
    }
    
    // Remove ADMIN role from all other users
    const otherAdmins = await prisma.user.findMany({
      where: {
        email: { not: ADMIN_EMAIL },
        role: 'ADMIN'
      }
    })
    
    if (otherAdmins.length > 0) {
      console.log(`\n⚠️  Found ${otherAdmins.length} other user(s) with ADMIN role:`)
      otherAdmins.forEach(user => {
        console.log(`   - ${user.email} (${user.name || 'No name'})`)
      })
      
      // Remove admin role from all other users
      await prisma.user.updateMany({
        where: {
          email: { not: ADMIN_EMAIL },
          role: 'ADMIN'
        },
        data: {
          role: 'USER'
        }
      })
      
      console.log(`\n✅ Removed ADMIN role from ${otherAdmins.length} user(s)`)
    } else {
      console.log('\n✅ No other users have ADMIN role')
    }
    
    console.log('\n🎉 Admin email restriction setup complete!')
    console.log(`\n📧 Only ${ADMIN_EMAIL} can now access the admin panel.`)
    
  } catch (error) {
    console.error('❌ Error setting up admin email:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

setupAdminEmail()

