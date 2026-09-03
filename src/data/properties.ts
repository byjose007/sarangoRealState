import type { FloorPlan, ListingStatus, Property, PropertyType } from '@/types';
import { pick, range, seeded, slugify } from '@/lib/utils';
import { imageCount, unsplash } from './images';
import { agents } from './agents';
import { amenities, cities } from './reference';

const TYPES: PropertyType[] = [
  'house',
  'apartment',
  'land',
  'estate',
  'studio',
  'penthouse',
  'townhouse',
  'commercial',
  'office',
  'villa',
  'loft',
];

const STREETS = [
  'Av. Ordóñez Lasso',
  'Av. Solano',
  'Av. 12 de Octubre',
  'Av. González Suárez',
  'Av. de las Américas',
  'Av. Remigio Crespo Toral',
  'Av. 10 de Agosto',
  'Av. Paucarbamba',
  'Calle Larga',
  'Av. Loja',
  'Av. Huayna Cápac',
  'Av. Don Bosco',
  'Av. Paseo 3 de Noviembre',
  'Av. Primero de Mayo',
  'Sector Challuabamba',
  'Sector San Joaquín',
  'Sector Puertas del Sol',
  'Sector Misicata',
  'Sector Totoracocha',
  'Sector El Vergel',
];

const QUALIFIERS = [
  'Exclusiva',
  'Moderna',
  'Esquinera',
  'Amplia',
  'Luminosa',
  'Campestre',
  'Panorámica',
  'Renovada',
  'De Lujo',
  'Independiente',
  'Céntrica',
  'Estratégica',
];

const SUBJECTS: Record<PropertyType, string> = {
  house: 'Casa Residencial',
  apartment: 'Departamento',
  land: 'Terreno / Lote',
  estate: 'Finca / Quinta',
  studio: 'Suite / Estudio',
  penthouse: 'Penthouse',
  townhouse: 'Casa en Conjunto',
  commercial: 'Local Comercial',
  office: 'Oficina Corporativa',
  villa: 'Villa',
  loft: 'Loft',
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
  const city = cities[0]; // Operación exclusiva en Cuenca
  const type = TYPES[Math.floor(rng() * TYPES.length)];
  const statusRoll = rng();
  const status: ListingStatus =
    statusRoll > 0.94
      ? 'sold'
      : statusRoll > 0.78
        ? 'new-development'
        : statusRoll > 0.42
          ? 'for-sale'
          : 'for-rent';

  const isLand = type === 'land';
  const isCommercialOrOffice = type === 'office' || type === 'commercial';
  const isStudio = type === 'studio';

  const bedrooms = isLand || isCommercialOrOffice ? 0 : isStudio ? 1 : 1 + Math.floor(rng() * 5);
  const bathrooms = isLand
    ? 0
    : isCommercialOrOffice
      ? 1
      : isStudio
        ? 1
        : Math.max(1, Math.round(bedrooms * 0.8) + (rng() > 0.6 ? 1 : 0));
  const area = isLand
    ? 300 + Math.floor(rng() * 2200)
    : isStudio
      ? 45 + Math.floor(rng() * 35)
      : 120 + Math.floor(rng() * 450);
  const landArea = isLand
    ? area
    : type === 'apartment' || type === 'penthouse' || type === 'loft' || isStudio
      ? 0
      : area + Math.floor(rng() * 350);
  const yearBuilt = 1995 + Math.floor(rng() * 30);
  const isRent = status === 'for-rent';
  const basePrice = isRent
    ? 450 + Math.round((area * (2.5 + rng() * 3)) / 10) * 10
    : Math.round((75000 + area * (650 + rng() * 650)) / 1000) * 1000;

  const streetNumber = 100 + Math.floor(rng() * 8900);
  const street = pick(rng, STREETS);
  const qualifier = pick(rng, QUALIFIERS);
  const title =
    index === 0
      ? 'Penthouse Exclusivo con Vista Panorámica al Río Tomebamba'
      : `${qualifier} ${SUBJECTS[type]} en ${street}`;
  const reference = `VS-${String(index + 1).padStart(3, '0')}-AZUAY`;
  const imageStart = index * 3;

  const amenityIds = amenities
    .filter(() => rng() > 0.55)
    .slice(0, 10)
    .map((amenity) => amenity.id);

  const isJoseSarango = index === 0;
  const isMayancelaRent = index === 1;
  const isParqueIndustrialComm = index === 2;

  const resolvedTitle = isJoseSarango
    ? 'Penthouse Exclusivo con Vista Panorámica al Río Tomebamba'
    : isMayancelaRent
      ? 'Departamento de 2 Habitaciones en San Vicente de Mayancela'
      : isParqueIndustrialComm
        ? '500 m² en Arriendo (Pisos 2 al 4) – Sector Parque Industrial'
        : `${qualifier} ${SUBJECTS[type]} en ${street}`;

  const resolvedReference = isMayancelaRent
    ? 'VS-002-AZUAY'
    : isParqueIndustrialComm
      ? 'VS-003-AZUAY'
      : reference;

  return {
    id: `p-${index + 1}`,
    reference: resolvedReference,
    slug: `${slugify(resolvedTitle)}-${resolvedReference.toLowerCase()}`,
    title: resolvedTitle,
    description: isJoseSarango
      ? 'Magnífico penthouse de lujo ubicado en el exclusivo sector de Cuenca, Ecuador. Diseñado con finos acabados de madera y mármol, amplios ventanales de piso a techo, terraza privada con vista directa al río Tomebamba, 3 dormitorios principales con baño en suite, cocina de concepto abierto y parqueadero subterráneo privado. Inspeccionado y documentado con garantía Sarango Real Estate.'
      : isMayancelaRent
        ? '¡Departamento de 2 habitaciones en arriendo en Cuenca!\n\nUbicado en San Vicente de Mayancela, a solo 5 minutos del Parque Industrial de Cuenca, en un sector con fácil acceso y un entorno tranquilo.\n\nCaracterísticas:\n• 2 habitaciones\n• Sala, cocina y comedor integrados\n• 1 baño completo\n• Garaje para 1 vehículo\n• Servicios básicos incluidos\n• Área de lavandería con conexiones para lavadora y secadora (gas o eléctrica)\n\nCondiciones:\n• Contrato mínimo de 1 año\n• No se aceptan mascotas\n• Canon mensual: $320 (incluye servicios básicos)\n• Garantía: $320'
        : isParqueIndustrialComm
          ? '500 m² EN ARRIENDO desde el segundo piso hasta el cuarto piso Del Edificio / SECTOR PARQUE INDUSTRIAL – CUENCA\n\n¿Tu empresa está lista para dar el siguiente paso?\n\nPresentamos un espacio de 500 m² en arriendo, ubicado estratégicamente en calle Cojimíes y Camino a Patamarca, a pocos pasos del Campus Universitario de la Universidad Católica, sector Parque Industrial de Cuenca.\n\n¿Por qué este espacio?\n• 500 m² para desarrollar y adaptar tu proyecto\n• Ubicación estratégica y de fácil acceso\n• Sector comercial y residencial consolidado\n• Ideal para empresas, oficinas corporativas, consultorios, academias, instituciones, coworking y negocios en expansión\n\nCondiciones:\n• Canon: $2.000 mensuales + $2.000 de garantía.'
          : describe(type, 'Cuenca', area, yearBuilt, bedrooms),
    status: isJoseSarango
      ? 'for-sale'
      : isMayancelaRent || isParqueIndustrialComm
        ? 'for-rent'
        : status,
    type: isJoseSarango
      ? 'penthouse'
      : isMayancelaRent
        ? 'apartment'
        : isParqueIndustrialComm
          ? 'commercial'
          : type,
    price: isJoseSarango
      ? 285000
      : isMayancelaRent
        ? 320
        : isParqueIndustrialComm
          ? 2000
          : basePrice,
    pricePeriod: isJoseSarango
      ? 'total'
      : isMayancelaRent || isParqueIndustrialComm || isRent
        ? 'month'
        : 'total',
    deposit: isMayancelaRent ? 320 : isParqueIndustrialComm ? 2000 : undefined,
    leaseTerm: isMayancelaRent ? '1 año' : isParqueIndustrialComm ? '1 año' : undefined,
    utilitiesIncluded: isMayancelaRent ? true : isParqueIndustrialComm ? false : undefined,
    petsAllowed: isMayancelaRent ? false : undefined,
    floorLevel: isParqueIndustrialComm ? 'Pisos 2 al 4 del Edificio' : undefined,
    commercialUse: isParqueIndustrialComm
      ? 'Oficinas corporativas, consultorios, academias, instituciones, coworking y negocios en expansión'
      : undefined,
    address: isJoseSarango
      ? 'Edificio Alameda 1, Calle José Astudillo Regalado, Cuenca, Ecuador'
      : isMayancelaRent
        ? 'San Vicente de Mayancela, a 5 min del Parque Industrial, Cuenca'
        : isParqueIndustrialComm
          ? 'Calle Cojimíes y Camino a Patamarca, Sector Parque Industrial, Cuenca'
          : `${streetNumber} ${street}, Cuenca, Azuay`,
    citySlug: 'cuenca',
    coordinates: isJoseSarango
      ? { lat: -2.9001, lng: -79.0059 }
      : isMayancelaRent
        ? { lat: -2.865, lng: -78.989 }
        : isParqueIndustrialComm
          ? { lat: -2.871, lng: -78.982 }
          : {
              lat: Number((-2.9001 + (rng() - 0.5) * 0.06).toFixed(5)),
              lng: Number((-79.0059 + (rng() - 0.5) * 0.06).toFixed(5)),
            },
    bedrooms: isJoseSarango ? 3 : isMayancelaRent ? 2 : isParqueIndustrialComm ? 0 : bedrooms,
    bathrooms: isJoseSarango ? 3 : isMayancelaRent ? 1 : isParqueIndustrialComm ? 4 : bathrooms,
    garages: isJoseSarango
      ? 2
      : isMayancelaRent
        ? 1
        : isParqueIndustrialComm
          ? 4
          : type === 'apartment' || type === 'loft'
            ? Math.round(rng())
            : 1 + Math.floor(rng() * 2),
    area: isJoseSarango ? 260 : isMayancelaRent ? 75 : isParqueIndustrialComm ? 500 : area,
    landArea: isJoseSarango ? 0 : landArea,
    yearBuilt: isJoseSarango
      ? 2023
      : isMayancelaRent
        ? 2022
        : isParqueIndustrialComm
          ? 2021
          : yearBuilt,
    energyRating: (['A', 'B', 'C', 'D'] as const)[Math.floor(rng() * 4)],
    featured: isJoseSarango || isMayancelaRent || isParqueIndustrialComm ? true : rng() > 0.72,
    images: range(6).map((i) => unsplash((imageStart + i * 5) % imageCount, 1400, 950)),
    amenityIds: isMayancelaRent
      ? ['a8', 'a13', 'a21', 'a25', 'a26']
      : isParqueIndustrialComm
        ? ['a13', 'a14', 'a21', 'a23', 'a27', 'a28', 'a29']
        : amenityIds.length
          ? amenityIds
          : ['a1', 'a10', 'a13'],
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
          {
            id: 'd1',
            name: 'Carpeta de Inspección y Avalúo',
            type: 'pdf',
            size: '2.4 MB',
            href: '#',
          },
          {
            id: 'd2',
            name: 'Planos Arquitectónicos Medidos',
            type: 'pdf',
            size: '1.1 MB',
            href: '#',
          },
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
    hoaFee:
      type === 'apartment' || type === 'penthouse' ? 120 + Math.floor(rng() * 480) : undefined,
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
