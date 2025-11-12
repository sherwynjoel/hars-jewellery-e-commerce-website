// Test SMTP Connection
require('dotenv').config()
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
})

console.log('🔍 Testing SMTP Connection...')
console.log('📧 SMTP Host:', process.env.SMTP_HOST)
console.log('📧 SMTP User:', process.env.SMTP_USER)
console.log('📧 SMTP Port:', process.env.SMTP_PORT)
console.log('')

transporter.verify(function (error, success) {
  if (error) {
    console.log('❌ SMTP Connection Failed!')
    console.log('❌ Error:', error.message)
    console.log('')
    console.log('🔧 Troubleshooting:')
    console.log('1. Check if SMTP credentials are correct in .env')
    console.log('2. For Gmail: Make sure you\'re using App Password (not regular password)')
    console.log('3. Ensure 2-Step Verification is enabled on Gmail')
    console.log('4. Check if port 587 is not blocked by firewall')
    process.exit(1)
  } else {
    console.log('✅ SMTP Server is ready to send emails!')
    console.log('')
    console.log('📧 Test sending email...')
    
    // Try sending a test email
    transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Send to yourself
      subject: 'Test Email - Hars Jewellery',
      html: '<h1>Test Email</h1><p>If you receive this, SMTP is working correctly!</p>'
    }, (error, info) => {
      if (error) {
        console.log('❌ Failed to send test email:', error.message)
        process.exit(1)
      } else {
        console.log('✅ Test email sent successfully!')
        console.log('📧 Message ID:', info.messageId)
        console.log('📧 Check your inbox:', process.env.SMTP_USER)
        process.exit(0)
      }
    })
  }
})

