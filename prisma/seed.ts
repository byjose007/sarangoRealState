import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@/generated/prisma/client';
import type { ListingStatus, Property, PropertyType as FrontendPropertyType } from '@/types';
import { agents as mockAgents } from '@/data/agents';
import { properties as mockProperties } from '@/data/properties';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const STATUS_MAP: Record<ListingStatus, 'FOR_SALE' | 'FOR_RENT' | 'SOLD' | 'NEW_DEVELOPMENT'> = {
  'for-sale': 'FOR_SALE',
  'for-rent': 'FOR_RENT',
  sold: 'SOLD',
  'new-development': 'NEW_DEVELOPMENT',
};

const TYPE_MAP: Record<FrontendPropertyType, string> = {
  villa: 'VILLA',
  apartment: 'APARTMENT',
  townhouse: 'TOWNHOUSE',
  penthouse: 'PENTHOUSE',
  loft: 'LOFT',
  estate: 'ESTATE',
  office: 'OFFICE',
};

const PRICE_PERIOD_MAP: Record<Property['pricePeriod'], 'MONTH' | 'TOTAL'> = {
  month: 'MONTH',
  total: 'TOTAL',
};

const DEV_PASSWORD = 'vestra-dev-2026';

/**
 * `src/data/{agents,properties}.ts` is a *template* fixture: alongside the
 * one real agent (José Sarango) it still carries the original Vestra demo
 * — a second fake agent ("Arlene McCoy", whose social links are literally
 * copy-pasted from José's) and ~100 procedurally generated fake listings
 * with stock Unsplash photography. Seeding all of that into a real
 * database would put a fabricated agent and fabricated inventory on the
 * live site.
 *
 * Default (`npm run db:seed`) is production-safe: the real admin login
 * plus José Sarango, zero properties — a clean slate for real listings
 * added through /admin/properties. Pass SEED_DEMO_DATA=1 to also seed the
 * template's fake agent + generated catalogue, for local development only.
 */
const SEED_DEMO_DATA = process.env.SEED_DEMO_DATA === '1' || process.env.SEED_DEMO_DATA === 'true';
const REAL_AGENT_SLUGS = new Set(['jose-sarango']);

async function upsertUser(email: string, role: 'ADMIN' | 'AGENT') {
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);
  return prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, role },
  });
}

async function main() {
  console.log(`Seeding admin user... (SEED_DEMO_DATA=${SEED_DEMO_DATA ? 'on — includes template demo content' : 'off — production-safe'})`);
  await upsertUser('admin@vestra.estate', 'ADMIN');

  const agentsToSeed = SEED_DEMO_DATA ? mockAgents : mockAgents.filter((agent) => REAL_AGENT_SLUGS.has(agent.slug));
  // Even the one listing the generator hand-tailors with José's real address/
  // price/description (see src/data/properties.ts — `isJoseSarango`) still
  // renders it with stock Unsplash photography, same as every generated
  // listing. A specific real address with photos that aren't of that
  // address is worse than an empty catalogue, so production mode seeds no
  // properties at all — every listing comes from a real one added through
  // /admin/properties, photos included.
  const propertiesToSeed = SEED_DEMO_DATA ? mockProperties : [];

  console.log(`Seeding ${agentsToSeed.length} agent(s)...`);
  const agentIdByMockId = new Map<string, string>();

  for (const agent of agentsToSeed) {
    const localPart = agent.email.split('@')[0].replace(/[^a-z0-9.]/gi, '');
    const loginEmail = `${localPart}@vestra.estate`;
    const user = await upsertUser(loginEmail, 'AGENT');

    const created = await prisma.agent.upsert({
      where: { slug: agent.slug },
      update: {
        name: agent.name,
        role: agent.role,
        license: agent.license,
        bio: agent.bio,
        phone: agent.phone,
        email: agent.email,
        address: agent.address,
        specialties: agent.specialties,
      },
      create: {
        slug: agent.slug,
        name: agent.name,
        role: agent.role,
        license: agent.license,
        avatar: agent.avatar,
        phone: agent.phone,
        email: agent.email,
        address: agent.address,
        citySlug: agent.citySlug,
        bio: agent.bio,
        languages: agent.languages,
        specialties: agent.specialties,
        experienceYears: agent.experienceYears,
        dealsClosed: agent.dealsClosed,
        rating: agent.rating,
        social: agent.social,
        userId: user.id,
      },
    });
    agentIdByMockId.set(agent.id, created.id);
  }

  console.log(`Seeding ${propertiesToSeed.length} properties...`);
  for (const property of propertiesToSeed) {
    const agentId = agentIdByMockId.get(property.agentId);
    if (!agentId) {
      console.warn(`Skipping ${property.slug} — unknown mock agentId ${property.agentId}`);
      continue;
    }

    await prisma.property.upsert({
      where: { slug: property.slug },
      update: {},
      create: {
        reference: property.reference,
        slug: property.slug,
        title: property.title,
        description: property.description,
        status: STATUS_MAP[property.status],
        type: TYPE_MAP[property.type] as never,
        price: property.price,
        pricePeriod: PRICE_PERIOD_MAP[property.pricePeriod],
        address: property.address,
        citySlug: property.citySlug,
        lat: property.coordinates.lat,
        lng: property.coordinates.lng,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        garages: property.garages,
        area: property.area,
        landArea: property.landArea,
        yearBuilt: property.yearBuilt,
        energyRating: property.energyRating,
        featured: property.featured,
        amenityIds: property.amenityIds,
        videoUrl: property.videoUrl,
        tourUrl: property.tourUrl,
        views: property.views,
        hoaFee: property.hoaFee,
        propertyTax: property.propertyTax,
        nearby: property.nearby,
        createdAt: new Date(property.createdAt),
        agentId,
        images: {
          create: property.images.map((url, position) => ({ url, position })),
        },
        floorPlans: {
          create: property.floorPlans.map((plan) => ({
            name: plan.name,
            level: plan.level,
            area: plan.area,
            bedrooms: plan.bedrooms,
            bathrooms: plan.bathrooms,
            outline: plan.outline,
            rooms: plan.rooms,
          })),
        },
        documents: {
          create: property.documents.map((doc) => ({
            name: doc.name,
            type: doc.type.toUpperCase() as never,
            size: doc.size,
            href: doc.href,
          })),
        },
      },
    });
  }

  console.log('Done.');
  if (!SEED_DEMO_DATA) {
    console.log('Catalogue is empty by design — add real listings via /admin/properties.');
    console.log('Pass SEED_DEMO_DATA=1 to also load the template demo agent + generated listings for local dev.');
  }
  console.log(`Dev login password for every seeded user: ${DEV_PASSWORD}`);
  console.log('Admin: admin@vestra.estate');
  for (const agent of agentsToSeed) {
    const localPart = agent.email.split('@')[0].replace(/[^a-z0-9.]/gi, '');
    console.log(`Agent (${agent.name}): ${localPart}@vestra.estate`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
