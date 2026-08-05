import type { FloorPlan, ListingStatus, Property, PropertyType } from '@/types';
import { pick, range, seeded, slugify } from '@/lib/utils';
import { imageCount, unsplash } from './images';
import { agents } from './agents';
import { amenities, cities } from './reference';

const TYPES: PropertyType[] = [
  'villa',
  'apartment',
  'townhouse',
  'penthouse',
  'loft',
  'estate',
  'office',
];

const STREETS = [
  'Maplewood Drive',
  'Pinecrest Lane',
  'Riverwalk Boulevard',
  'Aster Court',
  'Kestrel Row',
  'Juniper Terrace',
  'Larkspur Way',
  'Foundry Street',
  'Alder Crossing',
  'Harbourline Avenue',
  'Sycamore Bend',
  'Quarry Hill Road',
  'Belmont Rise',
  'Ellsworth Place',
  'Cobalt Mews',
];

const QUALIFIERS = [
  'Measured',
  'North-facing',
  'Courtyard',
  'Timber-framed',
  'Skylit',
  'Corner-lot',
  'Garden-level',
  'Ridge-view',
  'Restored',
  'Double-height',
  'Canal-side',
  'Terraced',
];

const SUBJECTS: Record<PropertyType, string> = {
  villa: 'villa',
  apartment: 'apartment',
  townhouse: 'townhouse',
  penthouse: 'penthouse',
  loft: 'loft',
  estate: 'estate',
  office: 'workspace',
};

const NEARBY_LABELS = [
  'School',
  'Supermarket',
  'Pharmacy',
  'Park',
  'Transit stop',
  'Hospital',
  'Café',
  'Gym',
];

function describe(type: PropertyType, city: string, area: number, year: number, beds: number) {
  return [
    `A ${SUBJECTS[type]} of ${area.toLocaleString('en-US')} sq ft on the ${city} side of the line, built in ${year} and surveyed by our field team this quarter.`,
    `The plan puts the living space along the longest glazed wall, so the ${beds} bedrooms sit away from the street. Ceilings are generous, storage is built in rather than added, and the services were re-run during the last renovation.`,
    `Everything on this page — floor plans, utility readings, document pack — comes from that survey. If something is missing from the record, it is because it does not exist yet, and your agent will tell you so.`,
  ].join('\n\n');
}

function buildFloorPlans(rng: () => number, beds: number, area: number): FloorPlan[] {
  const levels = area > 3200 ? 2 : 1;
  return range(levels).map((level) => {
    const share = level === 0 ? 0.62 : 0.38;
    return {
      id: `fp-${level + 1}`,
      name: level === 0 ? 'Ground level' : 'Upper level',
      level: level + 1,
      area: Math.round(area * (levels === 1 ? 1 : share)),
      bedrooms: level === 0 ? Math.max(1, Math.floor(beds / 2)) : Math.ceil(beds / 2),
      bathrooms: level === 0 ? 1 : Math.max(1, Math.round(beds / 2)),
      outline:
        level === 0
          ? '20,20 300,20 300,120 220,120 220,200 20,200'
          : '20,20 300,20 300,200 160,200 160,120 20,120',
      rooms:
        level === 0
          ? [
              { name: 'Living', x: 70, y: 70 },
              { name: 'Kitchen', x: 235, y: 70 },
              { name: 'Study', x: 70, y: 165 },
              { name: 'Bath', x: 168, y: 165 },
            ]
          : [
              { name: 'Primary', x: 80, y: 70 },
              { name: 'Bed 2', x: 240, y: 70 },
              { name: 'Bath', x: 240, y: 165 },
            ],
    };
  });
}

function createProperty(index: number): Property {
  const rng = seeded(1200 + index * 91);
  const city = cities[index % cities.length];
  const type = TYPES[Math.floor(rng() * TYPES.length)];
  const statusRoll = rng();
  const status: ListingStatus =
    statusRoll > 0.94 ? 'sold' : statusRoll > 0.78 ? 'new-development' : statusRoll > 0.42 ? 'for-sale' : 'for-rent';

  const bedrooms = type === 'office' ? 0 : 1 + Math.floor(rng() * 5);
  const bathrooms = Math.max(1, Math.round(bedrooms * 0.8) + (rng() > 0.6 ? 1 : 0));
  const area = 620 + Math.floor(rng() * 4200);
  const landArea = type === 'apartment' || type === 'penthouse' || type === 'loft' ? 0 : area + Math.floor(rng() * 6000);
  const yearBuilt = 1968 + Math.floor(rng() * 57);
  const isRent = status === 'for-rent';
  const basePrice = isRent
    ? 1400 + Math.round((area * (0.9 + rng() * 1.5)) / 10) * 10
    : Math.round((240000 + area * (180 + rng() * 460)) / 1000) * 1000;

  const streetNumber = 100 + Math.floor(rng() * 8900);
  const street = pick(rng, STREETS);
  const qualifier = pick(rng, QUALIFIERS);
  const title = index === 0
    ? 'Penthouse Exclusivo con Vista Panorámica al Río Tomebamba'
    : `${qualifier} ${SUBJECTS[type]} on ${street.split(' ')[0]}`;
  const reference = `VS-${String(index + 1).padStart(3, '0')}-${city.state}`;
  const imageStart = index * 3;

  const amenityIds = amenities
    .filter(() => rng() > 0.55)
    .slice(0, 10)
    .map((amenity) => amenity.id);

  const isJoseSarango = index === 0;

  return {
    id: `p-${index + 1}`,
    reference,
    slug: `${slugify(title)}-${reference.toLowerCase()}`,
    title,
    description: isJoseSarango
      ? 'Magnífico penthouse de lujo ubicado en el exclusivo sector de Cuenca, Ecuador. Diseñado con finos acabados de madera y mármol, amplios ventanales de piso a techo, terraza privada con vista directa al río Tomebamba, 3 dormitorios principales con baño en suite, cocina de concepto abierto y parqueadero subterráneo privado. Inspeccionado y documentado con garantía Sarango Real Estate.'
      : describe(type, city.name, area, yearBuilt, bedrooms),
    status: isJoseSarango ? 'for-sale' : status,
    type: isJoseSarango ? 'penthouse' : type,
    price: isJoseSarango ? 285000 : basePrice,
    pricePeriod: isJoseSarango ? 'total' : isRent ? 'month' : 'total',
    address: isJoseSarango
      ? 'Edificio Alameda 1, Calle José Astudillo Regalado, Cuenca, Ecuador'
      : `${streetNumber} ${street}, ${city.name}, ${city.state}`,
    citySlug: isJoseSarango ? 'cuenca' : city.slug,
    coordinates: isJoseSarango
      ? { lat: -2.9001, lng: -79.0059 }
      : {
          lat: Number((city.coordinates.lat + (rng() - 0.5) * 0.14).toFixed(5)),
          lng: Number((city.coordinates.lng + (rng() - 0.5) * 0.14).toFixed(5)),
        },
    bedrooms: isJoseSarango ? 3 : bedrooms,
    bathrooms: isJoseSarango ? 3 : bathrooms,
    garages: isJoseSarango ? 2 : type === 'apartment' || type === 'loft' ? Math.round(rng()) : 1 + Math.floor(rng() * 2),
    area: isJoseSarango ? 260 : area,
    landArea: isJoseSarango ? 0 : landArea,
    yearBuilt: isJoseSarango ? 2023 : yearBuilt,
    energyRating: (['A', 'B', 'C', 'D'] as const)[Math.floor(rng() * 4)],
    featured: isJoseSarango ? true : rng() > 0.72,
    images: range(6).map((i) => unsplash((imageStart + i * 5) % imageCount, 1400, 950)),
    amenityIds: amenityIds.length ? amenityIds : ['a1', 'a10', 'a13'],
    floorPlans: isJoseSarango
      ? [
          {
            id: 'fp-1',
            name: 'Planta Principal',
            level: 1,
            area: 160,
            bedrooms: 1,
            bathrooms: 1,
            outline: '20,20 300,20 300,120 220,120 220,200 20,200',
            rooms: [
              { name: 'Sala Estar', x: 70, y: 70 },
              { name: 'Cocina', x: 235, y: 70 },
              { name: 'Comedor', x: 70, y: 165 },
              { name: 'Baño Social', x: 168, y: 165 },
            ],
          },
          {
            id: 'fp-2',
            name: 'Planta Alta & Terraza',
            level: 2,
            area: 100,
            bedrooms: 2,
            bathrooms: 2,
            outline: '20,20 300,20 300,200 160,200 160,120 20,120',
            rooms: [
              { name: 'Dormitorio Master', x: 80, y: 70 },
              { name: 'Dormitorio 2', x: 240, y: 70 },
              { name: 'Terraza Panorámica', x: 240, y: 165 },
            ],
          },
        ]
      : buildFloorPlans(rng, bedrooms, area),
    documents: isJoseSarango
      ? [
          { id: 'd1', name: 'Carpeta de Inspección y Avalúo', type: 'pdf', size: '2.4 MB', href: '#' },
          { id: 'd2', name: 'Planos Arquitectónicos Medidos', type: 'pdf', size: '1.1 MB', href: '#' },
          { id: 'd3', name: 'Certificado de Suministros', type: 'pdf', size: '620 KB', href: '#' },
        ]
      : [
          { id: 'd1', name: 'Survey pack', type: 'pdf', size: '2.4 MB', href: '#' },
          { id: 'd2', name: 'Floor plans', type: 'pdf', size: '1.1 MB', href: '#' },
          { id: 'd3', name: 'Utility readings', type: 'pdf', size: '620 KB', href: '#' },
        ],
    videoUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
    tourUrl: rng() > 0.4 ? 'https://www.google.com/maps/embed?pb=' : undefined,
    agentId: isJoseSarango ? 'ag-1' : 'ag-2',
    createdAt: new Date(Date.UTC(2025, 11 - (index % 11), 1 + (index % 27))).toISOString(),
    views: 120 + Math.floor(rng() * 5400),
    hoaFee: type === 'apartment' || type === 'penthouse' ? 120 + Math.floor(rng() * 480) : undefined,
    propertyTax: Math.round(basePrice * (isRent ? 0 : 0.011)),
    nearby: NEARBY_LABELS.map((label) => ({
      label,
      distance: Number((0.3 + rng() * 2.4).toFixed(1)),
    })),
  };
}

export const properties: Property[] = range(100).map(createProperty);

export const propertyBySlug = (slug: string) => properties.find((item) => item.slug === slug);
export const propertyById = (id: string) => properties.find((item) => item.id === id);
export const featuredProperties = properties.filter((item) => item.featured);
