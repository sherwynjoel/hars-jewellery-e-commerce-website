# 🚀 Razorpay Payment Gateway Setup Guide

## Step 1: Get Razorpay Account & Keys

### 1.1 Create Razorpay Account
1. Go to [https://razorpay.com](https://razorpay.com)
2. Click "Sign Up" 
3. Fill in your business details
4. Verify your email and phone number

### 1.2 Get API Keys
1. Login to your Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Click **"Generate Test Keys"** (for development)
4. Copy your **Key ID** and **Key Secret**

## Step 2: Update Environment Variables

### 2.1 Update .env.local file
Replace the placeholder values in your `.env.local` file:

```env
# Razorpay Test Credentials
RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_KEY_SECRET_HERE

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=hars-jewellery-secret-key-2024-production-ready

# Database
DATABASE_URL="file:./dev.db"
```

### 2.2 For Production
When you're ready for production:
1. Switch to **Live Keys** in Razorpay Dashboard
2. Update your environment variables with live keys
3. Update `NEXTAUTH_URL` to your production domain

## Step 3: Test Payment Flow

### 3.1 Test Cards (Development)
Use these test card numbers in Razorpay test mode:

**Successful Payment:**
- Card Number: `4111 1111 1111 1111`
- Expiry: Any future date
- CVV: Any 3 digits
- Name: Any name

**Failed Payment:**
- Card Number: `4000 0000 0000 0002`
- Expiry: Any future date
- CVV: Any 3 digits

### 3.2 Test UPI
- Use any UPI ID (e.g., `test@paytm`)
- Amount will be deducted from test account

## Step 4: Payment Flow

### 4.1 What Happens When User Clicks "Pay"
1. **Order Creation**: Creates Razorpay order with amount
2. **Payment Modal**: Opens Razorpay checkout modal
3. **Payment Processing**: User enters card/UPI details
4. **Payment Verification**: Verifies payment signature
5. **Order Creation**: Creates order in database
6. **Success**: Redirects to orders page

### 4.2 Payment Methods Supported
- **Credit/Debit Cards**: Visa, Mastercard, RuPay, Amex
- **UPI**: All UPI apps (GPay, PhonePe, Paytm, etc.)
- **Net Banking**: All major banks
- **Wallets**: Paytm, PhonePe, Amazon Pay
- **EMI**: Available for eligible cards

## Step 5: Production Deployment

### 5.1 Update Environment Variables
```env
# Production Razorpay Keys
RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_LIVE_KEY_SECRET

# Production URL
NEXTAUTH_URL=https://yourdomain.com
```

### 5.2 Webhook Setup (Optional)
For advanced features, set up webhooks:
1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Select events: `payment.captured`, `payment.failed`

## Step 6: Security Best Practices

### 6.1 Environment Variables
- Never commit real keys to Git
- Use different keys for development and production
- Rotate keys regularly

### 6.2 Payment Verification
- Always verify payment signature on server
- Never trust client-side payment data
- Log all payment attempts

## Step 7: Troubleshooting

### 7.1 Common Issues
- **"Authentication failed"**: Check your API keys
- **"Invalid amount"**: Ensure amount is in paise (multiply by 100)
- **"Order not found"**: Check order ID and keys match

### 7.2 Debug Mode
Add this to your `.env.local` for debugging:
```env
RAZORPAY_DEBUG=true
```

## Step 8: Testing Checklist

- [ ] Razorpay account created
- [ ] API keys obtained and added to .env.local
- [ ] Test payment with test card
- [ ] Test payment with UPI
- [ ] Verify order creation in database
- [ ] Check payment verification
- [ ] Test error handling

## Support

- **Razorpay Documentation**: [https://razorpay.com/docs](https://razorpay.com/docs)
- **Razorpay Support**: [https://razorpay.com/support](https://razorpay.com/support)
- **Test Cards**: [https://razorpay.com/docs/payment-gateway/test-cards](https://razorpay.com/docs/payment-gateway/test-cards)

---

**Once you've set up your Razorpay keys, the payment gateway will work with real payments!** 🎉
