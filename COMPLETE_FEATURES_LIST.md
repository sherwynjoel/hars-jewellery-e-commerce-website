# Hars Jewellery - Complete Features & Options List

## 📋 Table of Contents
1. [User-Facing Features](#user-facing-features)
2. [Admin Panel Features](#admin-panel-features)
3. [Authentication & Security](#authentication--security)
4. [Payment System](#payment-system)
5. [Invoice Generation & Email](#invoice-generation--email)
6. [Content Management](#content-management)
7. [Order Management](#order-management)
8. [Product Management](#product-management)
9. [User Management](#user-management)
10. [Additional Features](#additional-features)

---

## 🛍️ User-Facing Features

### Homepage Features
- **Hero Section with Slideshow**
  - Dynamic image/video slideshow with titles and subtitles
  - Auto-rotating carousel
  - Manual navigation controls
  - Responsive design

- **Live Gold Price Display**
  - Real-time gold price per gram
  - Prominent display banner
  - Daily price updates
  - Animated shimmer effect

- **Featured Products Section**
  - Displays 6 featured products
  - Product cards with images
  - Quick view and add to cart

- **Editorial Showcase**
  - Customizable editorial content blocks
  - Multiple layout options (square, wide, tall, hero)
  - Product linking capability
  - Custom image uploads

- **Video Carousel**
  - Video/image carousel section
  - Customizable content
  - Position management
  - Active/inactive toggle

- **Testimonials Section**
  - Customer testimonials display
  - Customer photos
  - Star ratings (if applicable)
  - Rotating testimonials

- **Features Section**
  - Expert Craftsmanship highlight
  - Quality Assurance information
  - Safe Shipping details

- **Newsletter/Subscription Form**
  - Phone number collection
  - Email subscription option
  - Lead generation

### Product Browsing & Discovery
- **Collections Page**
  - Full product catalog
  - Category filtering (All, Rings, Necklaces, Earrings, Bracelets)
  - Sorting options:
    - Newest First
    - Price: Low to High
    - Price: High to Low
    - Name A-Z
  - Grid and List view modes
  - Responsive product cards
  - Product search capability

- **Product Detail Page**
  - High-resolution product images
  - Multiple image gallery
  - Image zoom functionality
  - Product name and description
  - Price display
  - Category badge
  - Stock status indicator
  - Add to cart button
  - Sticky mobile add-to-cart bar
  - Related products (if implemented)

### Shopping Cart Features
- **Cart Management**
  - Add items to cart
  - Remove items from cart
  - Update item quantities
  - Real-time price updates
  - Cart persistence (localStorage)
  - Cart synchronization with latest product data
  - Empty cart state with call-to-action

- **Cart Calculations**
  - Subtotal calculation
  - Shipping cost calculation (per product)
  - Tax calculation (3% GST)
  - Making cost calculation
  - Total price with all fees

- **Checkout Process**
  - Delivery details form:
    - Full Name
    - Email address
    - Phone number
    - Address Line 1
    - Address Line 2 (optional)
    - Postal Code (with auto-validation)
    - City (auto-filled from pincode)
    - State (auto-filled from pincode)
  - Pincode validation via API
  - Address verification
  - Save address for future use
  - Service status check (prevents checkout if services stopped)

### Order Management (User)
- **Order History**
  - View all past orders
  - Order status tracking:
    - PENDING
    - PROCESSING
    - SHIPPED
    - DELIVERED
    - CANCELLED
  - Order details view
  - Order items list
  - Order total and breakdown

- **Order Tracking**
  - Tracking number display
  - Tracking carrier information
  - Tracking URL (clickable)
  - Shipment date
  - Delivery date

- **Invoice Viewing**
  - View invoice for each order
  - Download invoice as PDF
  - Print invoice
  - Complete invoice details:
    - Invoice number
    - Invoice date
    - Company information
    - Customer information
    - Itemized product list
    - Price breakdown (subtotal, making cost, shipping, tax, total)
    - Payment method
    - GST information

### User Profile
- **Profile Page**
  - View account information
  - Email display
  - Name display
  - Role indicator (User/Admin)
  - Account creation date
  - Quick links to:
    - Orders page
    - Cart
    - Admin panel (if admin)

### Navigation & UI
- **Navigation Bar**
  - Logo/brand display
  - Home link
  - Collections link
  - Cart icon with item count
  - User menu (when logged in)
  - Sign in/Sign up buttons (when not logged in)
  - Profile link
  - Orders link
  - Admin panel link (for admins)
  - Responsive mobile menu

- **Footer**
  - Company information
  - Contact details
  - Links to:
    - Privacy Policy
    - Terms & Conditions
    - Shipping Policy
    - Refund Policy
  - Social media links (if applicable)

- **Responsive Design**
  - Mobile-first approach
  - Tablet optimization
  - Desktop optimization
  - Touch-friendly interface

---

## 👑 Admin Panel Features

### Admin Dashboard
- **Overview Statistics**
  - Total Products count
  - In Stock products count
  - Out of Stock products count
  - Total Inventory Value
  - Total Users count
  - Quick action buttons

- **Session Management**
  - 30-minute session timeout
  - Countdown timer display
  - Warning banner before timeout
  - Automatic logout on inactivity

- **Service Status Control**
  - Start/Stop services toggle
  - Custom service message
  - Visual status indicator (green/red)
  - Prevents order placement when stopped
  - Products still visible when stopped

- **Gold Price Management**
  - Update gold price per gram
  - Automatic product repricing (if configured)
  - Price history tracking
  - Live price display on homepage

### Product Management
- **Product CRUD Operations**
  - Create new products
  - Edit existing products
  - Delete products
  - View all products

- **Product Details Management**
  - Product name
  - Product description
  - Product price
  - Product category
  - Stock status (In Stock/Out of Stock)
  - Stock count
  - Gold weight in grams
  - Shipping cost per product
  - Main product image
  - Multiple product images
  - Image upload functionality
  - Image position management

- **Product Display**
  - Table view (desktop)
  - Card view (mobile)
  - Product image thumbnails
  - Quick edit/delete actions
  - Stock status indicators
  - Price display

### Order Management (Admin)
- **Order List View**
  - Filter by status:
    - All orders
    - Order Placed (PROCESSING)
    - Shipped
    - Delivered
    - Cancelled
  - Order details display
  - Customer information
  - Order total
  - Order date

- **Order Details Management**
  - View complete order information
  - Update order status
  - Add/update tracking number
  - Add/update tracking carrier
  - Add/update tracking URL
  - Mark as shipped
  - Mark as delivered
  - Cancel order

- **Address Verification**
  - View delivery address
  - Verify address manually
  - View verification status
  - View verification method
  - View verification timestamp
  - Toggle verification status

- **Invoice Management**
  - View invoice for each order
  - Download invoice as PDF
  - Print invoice
  - Invoice includes:
    - Company details
    - Customer details
    - Itemized list
    - Price breakdown
    - GST information

### User Management
- **User List View**
  - View all registered users
  - Search functionality:
    - Search by name
    - Search by email
    - Search by mobile
    - Search by role
  - User statistics:
    - Total orders count
    - Cart items count
  - User details:
    - Name
    - Email
    - Mobile number
    - Role (USER/ADMIN)
    - Email verification status
    - Account creation date

- **User Display**
  - Table view (desktop)
  - Card view (mobile)
  - Role badges
  - Verification status indicators

### Content Management

#### Slideshow Management
- **Hero Slideshow Control**
  - Add new slideshow images/videos
  - Upload images/videos
  - Edit slideshow items
  - Delete slideshow items
  - Reorder slideshow items (position management)
  - Set titles and subtitles
  - Toggle active/inactive status
  - Preview slideshow

#### Video Carousel Management
- **Video Carousel Control**
  - Add new carousel items
  - Upload videos/images
  - Edit carousel items
  - Delete carousel items
  - Reorder items (position management)
  - Set titles and subtitles
  - Toggle active/inactive status
  - Preview carousel

#### Editorial Showcase Management
- **Editorial Content Control**
  - Add new editorial features
  - Upload images
  - Edit features
  - Delete features
  - Reorder features (position management)
  - Set titles and subtitles
  - Link to products
  - Set custom link URLs
  - Choose layout:
    - Square
    - Wide (2 columns)
    - Tall (2 rows)
    - Hero (2x2)
  - Toggle active/inactive status
  - Preview showcase

#### Testimonials Management
- **Testimonials Control**
  - Add new testimonials
  - Upload customer photos
  - Edit testimonials
  - Delete testimonials
  - Reorder testimonials (position management)
  - Set customer name
  - Set testimonial title (optional)
  - Set testimonial content
  - Toggle active/inactive status
  - Preview testimonials

### Lead Management
- **Interested Customers**
  - View phone numbers collected from subscription form
  - See submission timestamps
  - Refresh list
  - Export capability (if implemented)

### Database Management
- **Database Viewer**
  - View database contents
  - Access to all tables
  - Data inspection tools

### Admin Security Features
- **Access Control**
  - Email-based admin access restriction
  - Admin panel verification system
  - Two-factor authentication support (if enabled)
  - Login attempt tracking
  - IP address logging
  - Admin activity logging

- **Activity Tracking**
  - Log all admin actions
  - Track resource modifications
  - IP address recording
  - User agent tracking
  - Timestamp for all activities

---

## 🔐 Authentication & Security

### User Registration
- **Sign Up Process**
  - Email and password registration
  - Name field (optional)
  - Mobile number (optional)
  - Password strength requirements
  - Email verification required
  - Verification email sent automatically
  - Verification link with 24-hour expiry

### User Login
- **Sign In Process**
  - Email and password authentication
  - Email verification check
  - Password validation
  - Session management
  - Remember me functionality (30-day sessions)
  - Redirect to intended page after login

### Email Verification
- **Verification System**
  - Email verification required before login
  - Verification link sent on registration
  - Resend verification email option
  - 24-hour link expiry
  - Secure token generation

### Password Management
- **Password Reset**
  - Forgot password functionality
  - Password reset email
  - Secure reset token
  - Token expiry
  - New password setting
  - Password hashing (bcrypt)

### Admin Authentication
- **Admin Login**
  - Email-based admin access
  - Admin panel verification
  - OTP-based verification (if enabled)
  - Two-factor authentication support
  - Login attempt limiting
  - Account lockout after failed attempts
  - IP address tracking
  - Session timeout (30 minutes)

### Security Features
- **Data Protection**
  - Password hashing (bcrypt with salt rounds)
  - Secure session management (JWT)
  - CSRF protection
  - SQL injection prevention (Prisma ORM)
  - XSS protection
  - Secure token generation
  - Environment variable protection

---

## 💳 Payment System

### Payment Gateway Integration
- **Razorpay Integration**
  - Razorpay payment gateway
  - Secure payment processing
  - Multiple payment methods support

### Payment Methods Supported
- **Credit/Debit Cards**
  - Visa
  - Mastercard
  - RuPay
  - Card validation
  - Secure card processing

- **UPI Payments**
  - PhonePe
  - Google Pay
  - Paytm
  - BHIM UPI
  - UPI ID support

- **Digital Wallets**
  - Paytm Wallet
  - PhonePe Wallet
  - Amazon Pay
  - Other supported wallets

- **Net Banking**
  - All major banks supported via Razorpay

### Payment Flow
- **Checkout Process**
  1. Cart review
  2. Delivery details entry
  3. Address validation
  4. Payment method selection
  5. Razorpay checkout
  6. Payment processing
  7. Payment verification
  8. Order creation
  9. Invoice generation
  10. Email notification

### Payment Features
- **Payment Options**
  - Pre-filled customer details
  - Editable customer information
  - Payment amount display
  - Order ID generation
  - Receipt generation
  - Payment status tracking

- **Payment Verification**
  - Server-side payment verification
  - Signature verification
  - Order ID validation
  - Payment ID tracking
  - Secure payment confirmation

### Order Creation
- **Post-Payment**
  - Automatic order creation on successful payment
  - Order status: PROCESSING
  - Order details saved
  - Customer information saved
  - Delivery address saved
  - Invoice generation
  - Email notification

---

## 📧 Invoice Generation & Email

### Invoice Generation
- **Automatic Invoice Creation**
  - Generated on order placement
  - Generated on successful payment
  - Unique invoice number
  - Invoice date and time
  - Complete order details

### Invoice Content
- **Invoice Details**
  - Company Information:
    - Company name (Hars Jewellery)
    - Full address
    - GSTIN/UIN
    - State code
    - Contact number
    - Email address
    - Company logo
  
  - Customer Information:
    - Customer name
    - Email address
    - Phone number
    - Delivery address (complete)
  
  - Order Information:
    - Invoice number
    - Invoice date
    - Order ID
    - Payment method
  
  - Product Details:
    - Product name
    - Unit price
    - Quantity
    - Line total
  
  - Price Breakdown:
    - Subtotal
    - Making Cost
    - Shipping Cost
    - Tax (3% GST)
    - Total Amount
  
  - Additional Information:
    - Thank you message
    - Company contact details

### Invoice Display
- **Invoice Viewing**
  - View invoice in admin panel
  - View invoice in user orders
  - Download as PDF
  - Print invoice
  - Responsive invoice design
  - Professional formatting

### Email Invoice System
- **Automatic Email Sending**
  - Invoice sent automatically on order creation
  - Invoice sent on successful payment
  - Email sent to customer email address
  - Professional HTML email template
  - Complete invoice in email body

### Email Features
- **Email Configuration**
  - SMTP email service
  - Nodemailer integration
  - HTML email templates
  - Email subject line customization
  - Email delivery tracking
  - Error handling for failed emails

### Email Templates
- **Invoice Email**
  - Professional design
  - Company branding
  - Complete invoice details
  - Responsive email layout
  - Print-friendly format
  - Mobile-optimized

### Test Invoice Feature
- **Testing Capabilities**
  - Test invoice email sending
  - Test with real orders
  - Test with mock orders
  - Email delivery verification

---

## 📦 Order Management

### Order Statuses
- **Order Lifecycle**
  - PENDING: Order placed, awaiting processing
  - PROCESSING: Order being prepared
  - SHIPPED: Order dispatched
  - DELIVERED: Order completed
  - CANCELLED: Order cancelled

### Order Information
- **Order Details**
  - Order ID (unique identifier)
  - Order date and time
  - Customer information
  - Delivery address
  - Order items (products, quantities, prices)
  - Order total
  - Order status
  - Payment status
  - Tracking information

### Shipping Management
- **Tracking Features**
  - Tracking number entry
  - Carrier selection
  - Tracking URL
  - Shipment date
  - Delivery date
  - Tracking status updates

### Address Management
- **Delivery Address**
  - Complete address storage
  - Address verification
  - Pincode validation
  - City and state auto-fill
  - Address verification methods:
    - AUTO_PINCODE: Automatic via pincode API
    - ADMIN: Manual admin verification
    - MANUAL: Manual verification
  - Verification timestamp
  - Verification status tracking

---

## 🛍️ Product Management

### Product Categories
- **Available Categories**
  - Rings
  - Necklaces
  - Earrings
  - Bracelets
  - Custom categories (extensible)

### Product Attributes
- **Product Information**
  - Product name
  - Product description
  - Product price
  - Product category
  - Stock status (boolean)
  - Stock count (numeric)
  - Gold weight in grams
  - Shipping cost
  - Main product image
  - Multiple product images
  - Image positioning

### Product Display
- **Product Presentation**
  - Product cards with images
  - Product detail pages
  - Image galleries
  - Category badges
  - Price display
  - Stock status indicators
  - Responsive design

### Inventory Management
- **Stock Control**
  - Stock count tracking
  - In stock/out of stock status
  - Automatic stock updates
  - Low stock alerts (if implemented)

---

## 👥 User Management

### User Roles
- **Role System**
  - USER: Regular customer
  - ADMIN: Administrator access

### User Information
- **User Data**
  - User ID (unique)
  - Email address (unique, required)
  - Name (optional)
  - Mobile number (optional, unique)
  - Password (hashed)
  - Role
  - Email verification status
  - Account creation date
  - Last login information

### User Features
- **User Capabilities**
  - Browse products
  - Add to cart
  - Place orders
  - View order history
  - View invoices
  - Manage profile
  - Email verification

---

## 🎨 Additional Features

### Image Management
- **Image Upload System**
  - Product image upload
  - Multiple image support
  - Image optimization
  - Image storage
  - Image URL generation
  - Image position management

### Content Management
- **Dynamic Content**
  - Homepage slideshow
  - Video carousel
  - Editorial showcase
  - Testimonials
  - All content manageable via admin panel

### Search & Filter
- **Product Discovery**
  - Category filtering
  - Price sorting
  - Name sorting
  - Date sorting
  - Search functionality (if implemented)

### Responsive Design
- **Multi-Device Support**
  - Mobile optimization
  - Tablet optimization
  - Desktop optimization
  - Touch-friendly interface
  - Responsive images
  - Adaptive layouts

### Performance Features
- **Optimization**
  - Image optimization
  - Lazy loading
  - Code splitting
  - Caching strategies
  - Fast page loads

### Legal Pages
- **Compliance**
  - Privacy Policy page
  - Terms & Conditions page
  - Shipping Policy page
  - Refund Policy page

### Analytics & Tracking
- **Monitoring** (if implemented)
  - Admin activity logging
  - Order tracking
  - User activity tracking
  - Performance monitoring

### Integration Features
- **Third-Party Services**
  - Razorpay payment gateway
  - Email service (SMTP)
  - Pincode validation API
  - Image upload service

### Security Features
- **Protection**
  - Secure authentication
  - Password hashing
  - Session management
  - CSRF protection
  - XSS protection
  - SQL injection prevention
  - Admin access control
  - Activity logging

---

## 📊 Summary Statistics

### Total Features Count
- **User Features**: 50+ features
- **Admin Features**: 60+ features
- **Authentication Features**: 10+ features
- **Payment Features**: 15+ features
- **Invoice Features**: 10+ features
- **Content Management**: 20+ features
- **Order Management**: 15+ features
- **Product Management**: 15+ features

### Key Highlights
✅ Complete e-commerce functionality
✅ Full admin panel with comprehensive controls
✅ Secure authentication and authorization
✅ Multiple payment methods
✅ Automatic invoice generation and email
✅ Content management system
✅ Order tracking and management
✅ Responsive design
✅ Professional UI/UX
✅ Security features

---

## 🚀 Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Authentication**: NextAuth.js
- **Database**: Prisma with SQLite
- **State Management**: Zustand
- **Notifications**: React Hot Toast
- **Payment**: Razorpay
- **Email**: Nodemailer
- **Image Processing**: Sharp
- **Forms**: React Hook Form

---

## 📝 Notes

- All features are fully functional and integrated
- The system supports both user and admin workflows
- Invoice generation is automatic and includes email delivery
- Payment processing is secure and verified
- Admin panel has comprehensive management capabilities
- The system is responsive and works on all devices
- Security features protect user data and admin access
- Content management allows dynamic homepage customization

---

**Last Updated**: Based on current codebase analysis
**Version**: 1.0
**Project**: Hars Jewellery E-commerce Website

