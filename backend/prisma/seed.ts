import bcrypt from 'bcryptjs';
import {
  BuyerType,
  ListingSourceType,
  ListingStatus,
  NotificationType,
  PrismaClient,
  ProduceUnit,
  UserRole,
  VerificationStatus,
} from '@prisma/client';
import { env } from '../src/config/env';
import { GHANA_PLACES } from '../src/services/geolocation.service';
import { matchingEngineService } from '../src/services/matching-engine.service';
import { transportService } from '../src/services/transport.service';
import { offerService } from '../src/modules/offers/offer.service';

const prisma = new PrismaClient();
const PASSWORD_ROUNDS = 10;

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  d.setUTCHours(8, 0, 0, 0);
  return d;
}

const CATEGORIES: { name: string; slug: string; units: ProduceUnit[] }[] = [
  {
    name: 'Tomatoes',
    slug: 'tomatoes',
    units: [ProduceUnit.CRATE, ProduceUnit.KG, ProduceUnit.BASKET],
  },
  { name: 'Onions', slug: 'onions', units: [ProduceUnit.BAG, ProduceUnit.SACK, ProduceUnit.KG] },
  { name: 'Maize', slug: 'maize', units: [ProduceUnit.BAG, ProduceUnit.TONNE, ProduceUnit.KG] },
  { name: 'Cassava', slug: 'cassava', units: [ProduceUnit.BAG, ProduceUnit.KG] },
  { name: 'Yam', slug: 'yam', units: [ProduceUnit.PIECE, ProduceUnit.BAG] },
  { name: 'Plantain', slug: 'plantain', units: [ProduceUnit.BUNCH, ProduceUnit.BOX] },
  { name: 'Rice', slug: 'rice', units: [ProduceUnit.BAG, ProduceUnit.SACK, ProduceUnit.KG] },
  { name: 'Pepper', slug: 'pepper', units: [ProduceUnit.BASKET, ProduceUnit.KG, ProduceUnit.BAG] },
  { name: 'Okra', slug: 'okra', units: [ProduceUnit.BASKET, ProduceUnit.KG] },
  { name: 'Cabbage', slug: 'cabbage', units: [ProduceUnit.BOX, ProduceUnit.PIECE] },
  { name: 'Carrots', slug: 'carrots', units: [ProduceUnit.BOX, ProduceUnit.KG] },
  { name: 'Pineapple', slug: 'pineapple', units: [ProduceUnit.PIECE, ProduceUnit.BOX] },
  { name: 'Mango', slug: 'mango', units: [ProduceUnit.BOX, ProduceUnit.CRATE] },
  { name: 'Orange', slug: 'orange', units: [ProduceUnit.BAG, ProduceUnit.BOX] },
  { name: 'Watermelon', slug: 'watermelon', units: [ProduceUnit.PIECE, ProduceUnit.BOX] },
];

async function hash(pw: string): Promise<string> {
  return bcrypt.hash(pw, PASSWORD_ROUNDS);
}

async function clearDomainData(): Promise<void> {
  // Order matters due to FK constraints. Seed is development-only.
  await prisma.transportPoolSuggestion.deleteMany();
  await prisma.produceTransaction.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.matchRecommendation.deleteMany();
  await prisma.buyerDemand.deleteMany();
  await prisma.produceListing.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.farmerProfile.deleteMany();
  await prisma.buyerProfile.deleteMany();
  await prisma.user.deleteMany();
}

async function main(): Promise<void> {
  console.log('Seeding FarmLink AI database...');
  await clearDomainData();

  // --- Categories ---------------------------------------------------------
  const categoryBySlug = new Map<string, string>();
  for (const c of CATEGORIES) {
    const category = await prisma.produceCategory.upsert({
      where: { slug: c.slug },
      create: { name: c.name, slug: c.slug, unitOptions: c.units, isActive: true },
      update: { name: c.name, unitOptions: c.units, isActive: true },
    });
    categoryBySlug.set(c.slug, category.id);
  }
  console.log(`Seeded ${CATEGORIES.length} produce categories`);

  // --- Admin --------------------------------------------------------------
  await prisma.user.create({
    data: {
      fullName: env.ADMIN_FULL_NAME,
      phoneNumber: env.ADMIN_PHONE_NUMBER,
      email: env.ADMIN_EMAIL,
      passwordHash: await hash(env.ADMIN_PASSWORD),
      role: UserRole.ADMIN,
      phoneVerified: true,
    },
  });

  // --- Farmers ------------------------------------------------------------
  const farmerSeeds = [
    {
      name: 'Kwame Mensah',
      phone: '+233240000001',
      email: 'farmer@farmlink.local',
      password: 'FarmerPassword123!',
      place: 'agogo',
      farm: 'Mensah Family Farm',
      crops: ['Tomatoes', 'Pepper'],
    },
    {
      name: 'Akosua Boateng',
      phone: '+233240000002',
      email: 'akosua@farmlink.local',
      password: 'FarmerPassword123!',
      place: 'kumasi',
      farm: 'Boateng Greens',
      crops: ['Cabbage', 'Carrots'],
    },
    {
      name: 'Yaw Owusu',
      phone: '+233240000003',
      email: 'yaw@farmlink.local',
      password: 'FarmerPassword123!',
      place: 'techiman',
      farm: 'Owusu Agro',
      crops: ['Maize', 'Yam'],
    },
    {
      name: 'Adwoa Asante',
      phone: '+233240000004',
      email: 'adwoa@farmlink.local',
      password: 'FarmerPassword123!',
      place: 'koforidua',
      farm: 'Asante Orchards',
      crops: ['Pineapple', 'Mango'],
    },
    {
      name: 'Kojo Dampare',
      phone: '+233240000005',
      email: 'kojo@farmlink.local',
      password: 'FarmerPassword123!',
      place: 'tamale',
      farm: 'Northern Harvest',
      crops: ['Rice', 'Onions'],
    },
    {
      name: 'Efua Sarpong',
      phone: '+233240000006',
      email: 'efua@farmlink.local',
      password: 'FarmerPassword123!',
      place: 'agogo',
      farm: 'Sarpong Tomatoes',
      crops: ['Tomatoes'],
    },
  ];

  const farmers: { userId: string; profileId: string; place: string }[] = [];
  for (const f of farmerSeeds) {
    const loc = GHANA_PLACES[f.place];
    const user = await prisma.user.create({
      data: {
        fullName: f.name,
        phoneNumber: f.phone,
        email: f.email,
        passwordHash: await hash(f.password),
        role: UserRole.FARMER,
        phoneVerified: true,
        farmerProfile: {
          create: {
            farmName: f.farm,
            description: `${f.farm} based in ${f.place}.`,
            region: loc.region,
            district: loc.district,
            town: f.place.replace(/\b\w/g, (ch) => ch.toUpperCase()),
            latitude: loc.point.latitude,
            longitude: loc.point.longitude,
            primaryCrops: f.crops,
            farmSizeAcres: 5 + Math.round(Math.random() * 20),
            verificationStatus: VerificationStatus.VERIFIED,
          },
        },
      },
      include: { farmerProfile: true },
    });
    farmers.push({ userId: user.id, profileId: user.farmerProfile!.id, place: f.place });
  }
  console.log(`Seeded ${farmers.length} farmers`);

  // --- Buyers -------------------------------------------------------------
  const buyerSeeds = [
    {
      name: 'Golden Spoon Restaurant',
      phone: '+233260000001',
      email: 'buyer@farmlink.local',
      password: 'BuyerPassword123!',
      type: BuyerType.RESTAURANT,
      place: 'accra',
      prefers: ['tomatoes', 'pepper', 'onions'],
    },
    {
      name: 'Labadi Beach Hotel',
      phone: '+233260000002',
      email: 'hotel@farmlink.local',
      password: 'BuyerPassword123!',
      type: BuyerType.HOTEL,
      place: 'accra',
      prefers: ['tomatoes', 'carrots', 'cabbage'],
    },
    {
      name: 'Accra Senior High School',
      phone: '+233260000003',
      email: 'school@farmlink.local',
      password: 'BuyerPassword123!',
      type: BuyerType.SCHOOL,
      place: 'accra',
      prefers: ['rice', 'maize', 'yam'],
    },
    {
      name: 'FreshMart Supermarket',
      phone: '+233260000004',
      email: 'mart@farmlink.local',
      password: 'BuyerPassword123!',
      type: BuyerType.SUPERMARKET,
      place: 'kumasi',
      prefers: ['tomatoes', 'pineapple', 'mango'],
    },
    {
      name: 'Kejetia Market Traders',
      phone: '+233260000005',
      email: 'traders@farmlink.local',
      password: 'BuyerPassword123!',
      type: BuyerType.MARKET_TRADER,
      place: 'kumasi',
      prefers: ['onions', 'pepper', 'okra'],
    },
    {
      name: 'GoldAgro Processing',
      phone: '+233260000006',
      email: 'processor@farmlink.local',
      password: 'BuyerPassword123!',
      type: BuyerType.PROCESSOR,
      place: 'techiman',
      prefers: ['cassava', 'maize', 'tomatoes'],
    },
    {
      name: 'Cape Coast Wholesalers',
      phone: '+233260000007',
      email: 'wholesale@farmlink.local',
      password: 'BuyerPassword123!',
      type: BuyerType.WHOLESALER,
      place: 'cape coast',
      prefers: ['watermelon', 'orange', 'pineapple'],
    },
  ];

  const buyers: { userId: string; profileId: string }[] = [];
  for (const b of buyerSeeds) {
    const loc = GHANA_PLACES[b.place];
    const user = await prisma.user.create({
      data: {
        fullName: b.name,
        phoneNumber: b.phone,
        email: b.email,
        passwordHash: await hash(b.password),
        role: UserRole.BUYER,
        phoneVerified: true,
        buyerProfile: {
          create: {
            businessName: b.name,
            buyerType: b.type,
            description: `${b.name} sourcing fresh produce.`,
            region: loc.region,
            district: loc.district,
            town: b.place.replace(/\b\w/g, (ch) => ch.toUpperCase()),
            latitude: loc.point.latitude,
            longitude: loc.point.longitude,
            preferredProduce: b.prefers,
            minimumOrderQuantity: 10,
            maximumTravelDistanceKm: 250,
            verificationStatus: VerificationStatus.VERIFIED,
          },
        },
      },
      include: { buyerProfile: true },
    });
    buyers.push({ userId: user.id, profileId: user.buyerProfile!.id });
  }
  console.log(`Seeded ${buyers.length} buyers`);

  // --- Buyer demands ------------------------------------------------------
  const demandSpecs = [
    { buyer: 0, slug: 'tomatoes', min: 30, max: 100, unit: ProduceUnit.CRATE, price: 200 },
    { buyer: 0, slug: 'pepper', min: 5, max: 20, unit: ProduceUnit.BASKET, price: 150 },
    { buyer: 1, slug: 'tomatoes', min: 20, max: 60, unit: ProduceUnit.CRATE, price: 220 },
    { buyer: 2, slug: 'rice', min: 50, max: 200, unit: ProduceUnit.BAG, price: 400 },
    { buyer: 3, slug: 'pineapple', min: 100, max: 500, unit: ProduceUnit.PIECE, price: 8 },
    { buyer: 4, slug: 'onions', min: 20, max: 80, unit: ProduceUnit.BAG, price: 300 },
    { buyer: 5, slug: 'cassava', min: 40, max: 150, unit: ProduceUnit.BAG, price: 120 },
    { buyer: 6, slug: 'watermelon', min: 50, max: 200, unit: ProduceUnit.PIECE, price: 15 },
  ];
  for (const d of demandSpecs) {
    await prisma.buyerDemand.create({
      data: {
        buyerId: buyers[d.buyer].profileId,
        categoryId: categoryBySlug.get(d.slug)!,
        minimumQuantity: d.min,
        maximumQuantity: d.max,
        unit: d.unit,
        preferredPriceMaximum: d.price,
        requiredFrom: daysFromNow(0),
        requiredUntil: daysFromNow(30),
        preferredRegions: [],
        isRecurring: true,
        frequency: 'WEEKLY',
        isActive: true,
      },
    });
  }
  console.log(`Seeded ${demandSpecs.length} buyer demands`);

  // --- Produce listings ---------------------------------------------------
  const listingSpecs = [
    {
      farmer: 0,
      slug: 'tomatoes',
      title: 'Fresh tomatoes available in Agogo',
      qty: 60,
      unit: ProduceUnit.CRATE,
      price: 180,
      days: 3,
    },
    {
      farmer: 5,
      slug: 'tomatoes',
      title: 'Grade A tomatoes ready in Agogo',
      qty: 45,
      unit: ProduceUnit.CRATE,
      price: 190,
      days: 2,
    },
    {
      farmer: 0,
      slug: 'pepper',
      title: 'Hot peppers from Agogo',
      qty: 12,
      unit: ProduceUnit.BASKET,
      price: 140,
      days: 5,
    },
    {
      farmer: 1,
      slug: 'cabbage',
      title: 'Fresh cabbage heads from Kumasi',
      qty: 80,
      unit: ProduceUnit.BOX,
      price: 60,
      days: 4,
    },
    {
      farmer: 1,
      slug: 'carrots',
      title: 'Crunchy carrots, Kumasi',
      qty: 50,
      unit: ProduceUnit.BOX,
      price: 90,
      days: 6,
    },
    {
      farmer: 2,
      slug: 'maize',
      title: 'Dry maize in Techiman',
      qty: 120,
      unit: ProduceUnit.BAG,
      price: 250,
      days: 7,
    },
    {
      farmer: 2,
      slug: 'yam',
      title: 'Puna yam tubers, Techiman',
      qty: 300,
      unit: ProduceUnit.PIECE,
      price: 12,
      days: 10,
    },
    {
      farmer: 3,
      slug: 'pineapple',
      title: 'Sweet pineapples from Koforidua',
      qty: 400,
      unit: ProduceUnit.PIECE,
      price: 7,
      days: 3,
    },
    {
      farmer: 3,
      slug: 'mango',
      title: 'Ripe mangoes, Eastern region',
      qty: 60,
      unit: ProduceUnit.BOX,
      price: 110,
      days: 5,
    },
    {
      farmer: 4,
      slug: 'rice',
      title: 'Local rice harvest, Tamale',
      qty: 150,
      unit: ProduceUnit.BAG,
      price: 380,
      days: 8,
    },
    {
      farmer: 4,
      slug: 'onions',
      title: 'Onions in bulk, Tamale',
      qty: 70,
      unit: ProduceUnit.BAG,
      price: 280,
      days: 4,
    },
  ];

  const listingIds: string[] = [];
  for (const l of listingSpecs) {
    const farmer = farmers[l.farmer];
    const loc = GHANA_PLACES[farmer.place];
    const listing = await prisma.produceListing.create({
      data: {
        farmerId: farmer.profileId,
        categoryId: categoryBySlug.get(l.slug)!,
        title: l.title,
        description: `${l.title}. Sourced directly from the farm and ready for bulk purchase.`,
        quantity: l.qty,
        unit: l.unit,
        minimumOrderQuantity: Math.max(1, Math.round(l.qty * 0.1)),
        pricePerUnit: l.price,
        currency: 'GHS',
        harvestDate: daysFromNow(l.days),
        availableFrom: daysFromNow(l.days),
        availableUntil: daysFromNow(l.days + 14),
        qualityGrade: 'A',
        farmingMethod: 'CONVENTIONAL',
        region: loc.region,
        district: loc.district,
        town: farmer.place.replace(/\b\w/g, (ch) => ch.toUpperCase()),
        latitude: loc.point.latitude,
        longitude: loc.point.longitude,
        status: ListingStatus.PUBLISHED,
        sourceType: ListingSourceType.FORM,
        publishedAt: new Date(),
        transportPoolEligible: true,
      },
    });
    listingIds.push(listing.id);
  }
  console.log(`Seeded ${listingIds.length} published listings`);

  // --- Matching + transport pooling --------------------------------------
  for (const id of listingIds) {
    await matchingEngineService.generateMatchesForListing(id);
  }
  for (const id of listingIds) {
    await transportService.generateForListing(id);
  }
  console.log('Generated match recommendations and transport suggestions');

  // --- Offers + transactions ---------------------------------------------
  // Buyer 0 (restaurant) offers on the first tomato listing -> accepted.
  const offer1 = await offerService.createOffer(buyers[0].userId, {
    listingId: listingIds[0],
    offeredQuantity: 40,
    unit: ProduceUnit.CRATE,
    offeredPricePerUnit: 178,
    message: 'We can collect early next week.',
    proposedPickupDate: daysFromNow(4),
  });
  await offerService.acceptByFarmer(farmers[0].userId, offer1.id);

  // Buyer 3 (supermarket) offers on pineapples -> accepted.
  const offer2 = await offerService.createOffer(buyers[3].userId, {
    listingId: listingIds[7],
    offeredQuantity: 200,
    unit: ProduceUnit.PIECE,
    offeredPricePerUnit: 7,
    message: 'Weekly supply needed.',
    proposedPickupDate: daysFromNow(4),
  });
  await offerService.acceptByFarmer(farmers[3].userId, offer2.id);

  // A couple of pending offers for demo variety.
  await offerService.createOffer(buyers[1].userId, {
    listingId: listingIds[1],
    offeredQuantity: 30,
    unit: ProduceUnit.CRATE,
    offeredPricePerUnit: 185,
    proposedPickupDate: daysFromNow(3),
  });
  await offerService.createOffer(buyers[4].userId, {
    listingId: listingIds[10],
    offeredQuantity: 40,
    unit: ProduceUnit.BAG,
    offeredPricePerUnit: 275,
    proposedPickupDate: daysFromNow(5),
  });
  console.log('Seeded offers and 2 accepted transactions');

  // --- System notification + audit log ------------------------------------
  await prisma.notification.create({
    data: {
      userId: farmers[0].userId,
      type: NotificationType.SYSTEM,
      title: 'Welcome to FarmLink AI',
      message: 'Your demo account is ready. Explore listings, matches and offers.',
    },
  });
  await prisma.auditLog.create({
    data: {
      action: 'SEED_COMPLETED',
      entityType: 'System',
      metadata: { listings: listingIds.length },
    },
  });

  console.log('\nSeed complete. Demo credentials (development only):');
  console.log(`  Admin:  ${env.ADMIN_EMAIL} / ${env.ADMIN_PASSWORD}`);
  console.log('  Farmer: farmer@farmlink.local / FarmerPassword123!');
  console.log('  Buyer:  buyer@farmlink.local / BuyerPassword123!');
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
