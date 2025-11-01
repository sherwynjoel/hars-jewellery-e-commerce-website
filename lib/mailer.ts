import nodemailer from 'nodemailer'

export function createTransport() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    console.warn('SMTP not configured. Email sending will fail. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env')
    throw new Error('SMTP environment variables are not set')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates
    }
  })
}

export async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
  try {
    const from = process.env.EMAIL_FROM || 'no-reply@example.com'
    const transporter = createTransport()
    await transporter.sendMail({ from, to, subject, html })
    return { success: true }
  } catch (error: any) {
    console.error('Email send error:', error.message || error)
    return { success: false, error: error.message || 'Failed to send email' }
  }
}

export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}


