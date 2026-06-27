-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('FARMER', 'BUYER', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BuyerType" AS ENUM ('RESTAURANT', 'HOTEL', 'SCHOOL', 'SUPERMARKET', 'MARKET_TRADER', 'WHOLESALER', 'PROCESSOR', 'INDIVIDUAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ProduceUnit" AS ENUM ('KG', 'TONNE', 'CRATE', 'BAG', 'BOX', 'BUNCH', 'PIECE', 'BASKET', 'SACK');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'PARTIALLY_RESERVED', 'RESERVED', 'SOLD', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ListingSourceType" AS ENUM ('FORM', 'TEXT', 'VOICE_TRANSCRIPTION', 'ADMIN');

-- CreateEnum
CREATE TYPE "RecommendationStatus" AS ENUM ('RECOMMENDED', 'VIEWED', 'DISMISSED', 'OFFERED', 'CONVERTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('CONFIRMED', 'AWAITING_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "TransportPoolStatus" AS ENUM ('SUGGESTED', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MATCH_FOUND', 'OFFER_RECEIVED', 'OFFER_ACCEPTED', 'OFFER_REJECTED', 'LISTING_EXPIRING', 'TRANSPORT_POOL_FOUND', 'ACCOUNT_UPDATE', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "email" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "profileImageUrl" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "farmName" TEXT NOT NULL,
    "description" TEXT,
    "region" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "town" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "primaryCrops" TEXT[],
    "farmSizeAcres" DOUBLE PRECISION,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarmerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "buyerType" "BuyerType" NOT NULL,
    "description" TEXT,
    "region" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "town" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "preferredProduce" TEXT[],
    "minimumOrderQuantity" DOUBLE PRECISION,
    "maximumTravelDistanceKm" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuyerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProduceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "unitOptions" "ProduceUnit"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProduceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProduceListing" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(12,2) NOT NULL,
    "reservedQuantity" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "unit" "ProduceUnit" NOT NULL,
    "minimumOrderQuantity" DECIMAL(12,2) NOT NULL DEFAULT 1,
    "pricePerUnit" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'GHS',
    "harvestDate" TIMESTAMP(3) NOT NULL,
    "availableFrom" TIMESTAMP(3) NOT NULL,
    "availableUntil" TIMESTAMP(3),
    "qualityGrade" TEXT,
    "farmingMethod" TEXT,
    "region" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "town" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "sourceType" "ListingSourceType" NOT NULL DEFAULT 'FORM',
    "rawInputText" TEXT,
    "aiExtractionConfidence" DOUBLE PRECISION,
    "transportPoolEligible" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProduceListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerDemand" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "minimumQuantity" DECIMAL(12,2) NOT NULL,
    "maximumQuantity" DECIMAL(12,2),
    "unit" "ProduceUnit" NOT NULL,
    "preferredPriceMaximum" DECIMAL(12,2),
    "requiredFrom" TIMESTAMP(3),
    "requiredUntil" TIMESTAMP(3),
    "preferredRegions" TEXT[],
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "frequency" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuyerDemand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchRecommendation" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "produceScore" DOUBLE PRECISION NOT NULL,
    "quantityScore" DOUBLE PRECISION NOT NULL,
    "distanceScore" DOUBLE PRECISION NOT NULL,
    "dateScore" DOUBLE PRECISION NOT NULL,
    "priceScore" DOUBLE PRECISION NOT NULL,
    "explanation" TEXT NOT NULL,
    "status" "RecommendationStatus" NOT NULL DEFAULT 'RECOMMENDED',
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewedAt" TIMESTAMP(3),

    CONSTRAINT "MatchRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "offeredQuantity" DECIMAL(12,2) NOT NULL,
    "unit" "ProduceUnit" NOT NULL,
    "offeredPricePerUnit" DECIMAL(12,2) NOT NULL,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "message" TEXT,
    "proposedPickupDate" TIMESTAMP(3) NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProduceTransaction" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "agreedQuantity" DECIMAL(12,2) NOT NULL,
    "unit" "ProduceUnit" NOT NULL,
    "agreedPricePerUnit" DECIMAL(12,2) NOT NULL,
    "totalAmount" DECIMAL(14,2) NOT NULL,
    "pickupDate" TIMESTAMP(3) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'CONFIRMED',
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProduceTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransportPoolSuggestion" (
    "id" TEXT NOT NULL,
    "primaryListingId" TEXT NOT NULL,
    "secondaryListingId" TEXT NOT NULL,
    "distanceBetweenFarmsKm" DOUBLE PRECISION NOT NULL,
    "destinationSimilarityScore" DOUBLE PRECISION NOT NULL,
    "estimatedSavingsPercentage" DOUBLE PRECISION,
    "explanation" TEXT NOT NULL,
    "status" "TransportPoolStatus" NOT NULL DEFAULT 'SUGGESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportPoolSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_accountStatus_idx" ON "User"("accountStatus");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FarmerProfile_userId_key" ON "FarmerProfile"("userId");

-- CreateIndex
CREATE INDEX "FarmerProfile_region_idx" ON "FarmerProfile"("region");

-- CreateIndex
CREATE INDEX "FarmerProfile_verificationStatus_idx" ON "FarmerProfile"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "BuyerProfile_userId_key" ON "BuyerProfile"("userId");

-- CreateIndex
CREATE INDEX "BuyerProfile_region_idx" ON "BuyerProfile"("region");

-- CreateIndex
CREATE INDEX "BuyerProfile_buyerType_idx" ON "BuyerProfile"("buyerType");

-- CreateIndex
CREATE INDEX "BuyerProfile_verificationStatus_idx" ON "BuyerProfile"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ProduceCategory_name_key" ON "ProduceCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProduceCategory_slug_key" ON "ProduceCategory"("slug");

-- CreateIndex
CREATE INDEX "ProduceCategory_isActive_idx" ON "ProduceCategory"("isActive");

-- CreateIndex
CREATE INDEX "ProduceListing_status_idx" ON "ProduceListing"("status");

-- CreateIndex
CREATE INDEX "ProduceListing_categoryId_idx" ON "ProduceListing"("categoryId");

-- CreateIndex
CREATE INDEX "ProduceListing_farmerId_idx" ON "ProduceListing"("farmerId");

-- CreateIndex
CREATE INDEX "ProduceListing_region_idx" ON "ProduceListing"("region");

-- CreateIndex
CREATE INDEX "ProduceListing_harvestDate_idx" ON "ProduceListing"("harvestDate");

-- CreateIndex
CREATE INDEX "ProduceListing_createdAt_idx" ON "ProduceListing"("createdAt");

-- CreateIndex
CREATE INDEX "ProduceListing_status_categoryId_idx" ON "ProduceListing"("status", "categoryId");

-- CreateIndex
CREATE INDEX "BuyerDemand_buyerId_idx" ON "BuyerDemand"("buyerId");

-- CreateIndex
CREATE INDEX "BuyerDemand_categoryId_idx" ON "BuyerDemand"("categoryId");

-- CreateIndex
CREATE INDEX "BuyerDemand_isActive_idx" ON "BuyerDemand"("isActive");

-- CreateIndex
CREATE INDEX "MatchRecommendation_buyerId_status_idx" ON "MatchRecommendation"("buyerId", "status");

-- CreateIndex
CREATE INDEX "MatchRecommendation_listingId_idx" ON "MatchRecommendation"("listingId");

-- CreateIndex
CREATE INDEX "MatchRecommendation_score_idx" ON "MatchRecommendation"("score");

-- CreateIndex
CREATE UNIQUE INDEX "MatchRecommendation_listingId_buyerId_key" ON "MatchRecommendation"("listingId", "buyerId");

-- CreateIndex
CREATE INDEX "Offer_listingId_status_idx" ON "Offer"("listingId", "status");

-- CreateIndex
CREATE INDEX "Offer_buyerId_status_idx" ON "Offer"("buyerId", "status");

-- CreateIndex
CREATE INDEX "Offer_status_idx" ON "Offer"("status");

-- CreateIndex
CREATE INDEX "Offer_createdAt_idx" ON "Offer"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProduceTransaction_offerId_key" ON "ProduceTransaction"("offerId");

-- CreateIndex
CREATE INDEX "ProduceTransaction_farmerId_idx" ON "ProduceTransaction"("farmerId");

-- CreateIndex
CREATE INDEX "ProduceTransaction_buyerId_idx" ON "ProduceTransaction"("buyerId");

-- CreateIndex
CREATE INDEX "ProduceTransaction_status_idx" ON "ProduceTransaction"("status");

-- CreateIndex
CREATE INDEX "ProduceTransaction_createdAt_idx" ON "ProduceTransaction"("createdAt");

-- CreateIndex
CREATE INDEX "TransportPoolSuggestion_status_idx" ON "TransportPoolSuggestion"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TransportPoolSuggestion_primaryListingId_secondaryListingId_key" ON "TransportPoolSuggestion"("primaryListingId", "secondaryListingId");

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "FarmerProfile" ADD CONSTRAINT "FarmerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerProfile" ADD CONSTRAINT "BuyerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProduceListing" ADD CONSTRAINT "ProduceListing_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "FarmerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProduceListing" ADD CONSTRAINT "ProduceListing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProduceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerDemand" ADD CONSTRAINT "BuyerDemand_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "BuyerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerDemand" ADD CONSTRAINT "BuyerDemand_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProduceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchRecommendation" ADD CONSTRAINT "MatchRecommendation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "ProduceListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchRecommendation" ADD CONSTRAINT "MatchRecommendation_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "BuyerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "ProduceListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "BuyerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProduceTransaction" ADD CONSTRAINT "ProduceTransaction_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProduceTransaction" ADD CONSTRAINT "ProduceTransaction_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "ProduceListing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProduceTransaction" ADD CONSTRAINT "ProduceTransaction_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "BuyerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportPoolSuggestion" ADD CONSTRAINT "TransportPoolSuggestion_primaryListingId_fkey" FOREIGN KEY ("primaryListingId") REFERENCES "ProduceListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransportPoolSuggestion" ADD CONSTRAINT "TransportPoolSuggestion_secondaryListingId_fkey" FOREIGN KEY ("secondaryListingId") REFERENCES "ProduceListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

