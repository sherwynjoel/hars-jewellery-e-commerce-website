require('dotenv').config({ path: '.env' });
const nodemailer = require('nodemailer');

console.log('🧪 Testing Registration Email Flow...\n');

// Check environment variables
console.log('📋 Environment Check:');
console.log('  SMTP_HOST:', process.env.SMTP_HOST || '❌ NOT SET');
console.log('  SMTP_USER:', process.env.SMTP_USER || '❌ NOT SET');
console.log('  SMTP_PASS:', process.env.SMTP_PASS ? '✅ SET' : '❌ NOT SET');
console.log('  EMAIL_FROM:', process.env.EMAIL_FROM || '❌ NOT SET');
console.log('');

// Test email sending
const testEmail = 'thearktech2004@gmail.com';
const testName = 'Test User';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Generate verification link (simulating registration)
const crypto = require('crypto');
const verificationToken = crypto.randomBytes(32).toString('hex');
const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3001';
const verificationLink = `${baseUrl}/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(testEmail)}`;

const emailHtml = `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .button:hover { background-color: #333; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to Hars Jewellery!</h1>
        <p>Hello ${testName},</p>
        <p>Thank you for creating an account. Please verify your email address by clicking the button below:</p>
        <a href="${verificationLink}" class="button">Verify Email Address</a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationLink}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create this account, please ignore this email.</p>
        <p>Best regards,<br>Hars Jewellery Team</p>
      </div>
    </body>
  </html>
`;

console.log('📧 Sending test verification email...');
console.log('📧 To:', testEmail);
console.log('📧 Subject: Verify Your Email - Hars Jewellery');
console.log('');

transporter.sendMail({
  from: process.env.EMAIL_FROM || process.env.SMTP_USER,
  to: testEmail,
  subject: 'Verify Your Email - Hars Jewellery',
  html: emailHtml
}, (error, info) => {
  if (error) {
    console.log('❌ FAILED to send email!');
    console.log('❌ Error:', error.message);
    console.log('❌ Error code:', error.code);
    process.exit(1);
  } else {
    console.log('✅ SUCCESS! Verification email sent!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📧 Response:', info.response);
    console.log('');
    console.log('📧 Verification Link (for testing):');
    console.log(verificationLink);
    console.log('');
    console.log('✅ Check your inbox:', testEmail);
    process.exit(0);
  }
});

