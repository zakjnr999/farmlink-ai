import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Application } from 'express';
import { createApp } from '../../src/app';
import { prisma } from '../../src/config/database';

/**
 * Full-flow integration tests. These require a reachable, migrated PostgreSQL
 * database. They are skipped by default and run when RUN_DB_TESTS=1 is set:
 *
 *   RUN_DB_TESTS=1 DATABASE_URL=postgresql://... npm test
 */
const runDb = process.env.RUN_DB_TESTS === '1';
const suite = runDb ? describe : describe.skip;

suite('FarmLink API integration flow', () => {
  let app: Application;
  let categoryId = '';
  let farmerToken = '';
  let buyerToken = '';
  let listingId = '';
  let offerId = '';

  const unique = Date.now();
  const farmerPhone = `+2335${String(unique).slice(-8)}`;
  const buyerPhone = `+2336${String(unique).slice(-8)}`;

  beforeAll(async () => {
    app = createApp();

    const category = await prisma.produceCategory.upsert({
      where: { slug: 'tomatoes' },
      create: { name: 'Tomatoes', slug: 'tomatoes', unitOptions: ['CRATE', 'KG'] },
      update: {},
    });
    categoryId = category.id;
  });

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
  });

  it('registers a farmer', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      fullName: 'Test Farmer',
      phoneNumber: farmerPhone,
      password: 'FarmerPassword123!',
      role: 'FARMER',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toBeTruthy();
    farmerToken = res.body.data.accessToken;
  });

  it('registers a buyer', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      fullName: 'Test Buyer',
      phoneNumber: buyerPhone,
      password: 'BuyerPassword123!',
      role: 'BUYER',
    });
    expect(res.status).toBe(201);
    buyerToken = res.body.data.accessToken;
  });

  it('rejects public admin registration', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Hacker',
        phoneNumber: `+2337${String(unique).slice(-8)}`,
        password: 'Password123!',
        role: 'ADMIN',
      });
    expect(res.status).toBe(422);
  });

  it('rejects login with the wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ identifier: farmerPhone, password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('rejects protected routes without a token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('creates a farmer profile and a draft listing, then publishes it', async () => {
    const profile = await request(app)
      .post('/api/v1/farmers/profile')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        farmName: 'Test Farm',
        region: 'Ashanti',
        district: 'Asante Akim North',
        town: 'Agogo',
        latitude: 6.8001,
        longitude: -1.0819,
        primaryCrops: ['Tomatoes'],
      });
    expect(profile.status).toBe(201);

    const created = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        categoryId,
        title: 'Fresh tomatoes',
        description: 'Fresh tomatoes for sale in Agogo.',
        quantity: 60,
        unit: 'CRATE',
        minimumOrderQuantity: 5,
        pricePerUnit: 180,
        harvestDate: '2026-07-01',
        availableFrom: '2026-07-01',
        region: 'Ashanti',
        district: 'Asante Akim North',
        town: 'Agogo',
        latitude: 6.8001,
        longitude: -1.0819,
      });
    expect(created.status).toBe(201);
    listingId = created.body.data.listing.id;

    const published = await request(app)
      .post(`/api/v1/listings/${listingId}/publish`)
      .set('Authorization', `Bearer ${farmerToken}`);
    expect(published.status).toBe(200);
    expect(published.body.data.listing.status).toBe('PUBLISHED');
  });

  it('prevents a buyer from creating listings (authorization)', async () => {
    const res = await request(app)
      .post('/api/v1/listings')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({});
    expect(res.status).toBe(403);
  });

  it('lets a buyer create a profile, a demand and an offer', async () => {
    await request(app)
      .post('/api/v1/buyers/profile')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        businessName: 'Test Restaurant',
        buyerType: 'RESTAURANT',
        region: 'Ashanti',
        district: 'Kumasi Metropolitan',
        town: 'Kumasi',
        latitude: 6.6885,
        longitude: -1.6244,
        preferredProduce: ['tomatoes'],
      });

    const demand = await request(app)
      .post('/api/v1/buyers/demands')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        categoryId,
        minimumQuantity: 20,
        maximumQuantity: 80,
        unit: 'CRATE',
        preferredPriceMaximum: 200,
      });
    expect(demand.status).toBe(201);

    const offer = await request(app)
      .post('/api/v1/offers')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        listingId,
        offeredQuantity: 40,
        unit: 'CRATE',
        offeredPricePerUnit: 175,
        proposedPickupDate: '2026-07-02',
      });
    expect(offer.status).toBe(201);
    offerId = offer.body.data.offer.id;
    expect(offer.body.data.offer.totalAmount).toBe(7000);
  });

  it('rejects an offer that exceeds the available quantity', async () => {
    const res = await request(app)
      .post('/api/v1/offers')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        listingId,
        offeredQuantity: 1000,
        unit: 'CRATE',
        offeredPricePerUnit: 175,
        proposedPickupDate: '2026-07-02',
      });
    expect(res.status).toBe(400);
  });

  it('lets the farmer accept the offer, creating a transaction', async () => {
    const res = await request(app)
      .post(`/api/v1/farmers/offers/${offerId}/accept`)
      .set('Authorization', `Bearer ${farmerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.transaction).toBeTruthy();
    expect(res.body.data.transaction.totalAmount).toBe(7000);

    const listing = await prisma.produceListing.findUnique({ where: { id: listingId } });
    expect(listing).not.toBeNull();
    expect(Number(listing?.reservedQuantity)).toBe(40);
  });

  it('prevents accepting the same offer twice', async () => {
    const res = await request(app)
      .post(`/api/v1/farmers/offers/${offerId}/accept`)
      .set('Authorization', `Bearer ${farmerToken}`);
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
