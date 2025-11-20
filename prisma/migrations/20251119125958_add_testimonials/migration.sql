-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "mobile" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "emailVerifiedAt" DATETIME,
    "verifyOtpHash" TEXT,
    "verifyOtpExpiresAt" DATETIME,
    "loginOtpHash" TEXT,
    "loginOtpExpiresAt" DATETIME,
    "otpAttemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastOtpSentAt" DATETIME,
    "adminLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "adminLoginLockedUntil" DATETIME,
    "lastAdminLoginAt" DATETIME,
    "lastAdminLoginIp" TEXT,
    "adminTwoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "adminTwoFactorSecret" TEXT,
    "adminPanelVerifiedAt" DATETIME,
    "adminPanelVerifyToken" TEXT,
    "adminPanelVerifyExpiresAt" DATETIME,
    "resetPasswordToken" TEXT,
    "resetPasswordExpiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "image" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "stockCount" INTEGER NOT NULL DEFAULT 0,
    "goldWeightGrams" REAL,
    "shippingCost" REAL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "total" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "customerName" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "addressLine1" TEXT NOT NULL DEFAULT '',
    "addressLine2" TEXT,
    "city" TEXT NOT NULL DEFAULT '',
    "state" TEXT NOT NULL DEFAULT '',
    "postalCode" TEXT NOT NULL DEFAULT '',
    "addressVerified" BOOLEAN NOT NULL DEFAULT false,
    "addressVerifiedAt" DATETIME,
    "addressVerifiedBy" TEXT,
    "addressVerificationMethod" TEXT,
    "trackingNumber" TEXT,
    "trackingCarrier" TEXT,
    "trackingUrl" TEXT,
    "shippedAt" DATETIME,
    "deliveredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "GoldPrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "pricePerGram" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SlideshowImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT NOT NULL DEFAULT 'image',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VideoCarouselItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "type" TEXT NOT NULL DEFAULT 'video',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AdminActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT,
    "resourceId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ServiceStatus" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'service-status',
    "isStopped" BOOLEAN NOT NULL DEFAULT false,
    "stoppedAt" DATETIME,
    "message" TEXT DEFAULT 'Our services are stopped today. Please check after 12 hours.',
    "updatedAt" DATETIME NOT NULL,
    "updatedBy" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_userId_productId_key" ON "CartItem"("userId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_phone_key" ON "Subscriber"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "GoldPrice_date_key" ON "GoldPrice"("date");

-- CreateIndex
CREATE INDEX "AdminActivity_userId_idx" ON "AdminActivity"("userId");

-- CreateIndex
CREATE INDEX "AdminActivity_createdAt_idx" ON "AdminActivity"("createdAt");
