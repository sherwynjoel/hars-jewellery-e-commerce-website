# SMTP Email Setup Guide

## Why do you need SMTP?

SMTP (Simple Mail Transfer Protocol) is required to send verification codes and login OTPs via email.

## Quick Setup (Gmail Example)

### Step 1: Create Gmail App Password

1. Go to your Google Account: https://myaccount.google.com
2. Click **Security** → **2-Step Verification** (enable it if not enabled)
3. Scroll to **App passwords**
4. Generate a new app password for "Mail"
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 2: Update `.env` file

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASS=your_16_char_app_password
EMAIL_FROM="Hars Jewellery <your.email@gmail.com>"
```

### Step 3: Restart your dev server

```powershell
# Stop the server (Ctrl+C)
npm run dev
```

## Other Email Providers

### SendGrid (Recommended for Production)

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=YOUR_SENDGRID_API_KEY
EMAIL_FROM="Hars Jewellery <no-reply@your-domain.com>"
```

### Resend (Modern & Easy)

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=YOUR_RESEND_API_KEY
EMAIL_FROM="Hars Jewellery <no-reply@your-domain.com>"
```

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your.email@outlook.com
SMTP_PASS=your_password
EMAIL_FROM="Hars Jewellery <your.email@outlook.com>"
```

## Testing Email

1. Try signing up at `/auth/signup`
2. Check your email inbox (and spam folder)
3. Check the terminal where `npm run dev` is running for any errors

## Troubleshooting

### "SMTP environment variables are not set"

- Make sure `.env` file exists in the project root
- Check that all SMTP variables are set
- Restart the dev server after changing `.env`

### "Email send failed" in terminal

- **Gmail**: Make sure you're using an App Password, not your regular password
- **SendGrid/Resend**: Verify your API key is correct
- Check firewall/antivirus isn't blocking port 587/465
- Try port 465 instead of 587 (requires `secure: true`)

### Emails not arriving

1. Check spam/junk folder
2. Check terminal for specific error messages
3. Verify SMTP credentials are correct
4. Try a different email provider

## For Production

For production, use a dedicated email service:
- **SendGrid**: 100 emails/day free
- **Resend**: 100 emails/day free  
- **AWS SES**: Very cheap, good for scale

Do NOT use Gmail for production - it has sending limits.

