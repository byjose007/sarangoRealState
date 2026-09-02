import type { Amenity, City, Testimonial } from '@/types';
import { avatar, unsplash } from './images';

export const cities: City[] = [
  {
    id: 'c-cuenca',
    slug: 'cuenca',
    name: 'Cuenca',
    state: 'Azuay',
    country: 'Ecuador',
    image: unsplash(2, 900, 1100),
    coordinates: { lat: -2.9001, lng: -79.0059 },
    blurb: 'Centro histórico colonial, exclusivas residencias y desarrollos de alta calidad.',
    blurbEn: 'Colonial old town, exclusive residences and high-quality developments.',
  },
  {
    id: 'c-quito',
    slug: 'quito',
    name: 'Quito',
    state: 'Pichincha',
    country: 'Ecuador',
    image: unsplash(4, 900, 1100),
    coordinates: { lat: -0.1807, lng: -78.4678 },
    blurb:
      'Capital andina con barrios patrimoniales y proyectos residenciales en plena expansión al norte.',
    blurbEn:
      'Andean capital with heritage neighbourhoods and residential projects expanding to the north.',
  },
  {
    id: 'c-guayaquil',
    slug: 'guayaquil',
    name: 'Guayaquil',
    state: 'Guayas',
    country: 'Ecuador',
    image: unsplash(6, 900, 1100),
    coordinates: { lat: -2.1894, lng: -79.8891 },
    blurb:
      'Principal puerto y motor económico del país, con torres frente al Malecón y nuevos desarrollos en Vía a la Costa.',
    blurbEn:
      "Ecuador's main port and economic engine, with towers along the Malecón and new developments on Vía a la Costa.",
  },
  {
    id: 'c-samborondon',
    slug: 'samborondon',
    name: 'Samborondón',
    state: 'Guayas',
    country: 'Ecuador',
    image: unsplash(8, 900, 1100),
    coordinates: { lat: -1.9667, lng: -79.7333 },
    blurb:
      'Urbanizaciones cerradas y residencias de alto nivel junto a Guayaquil, referente del segmento premium.',
    blurbEn:
      'Gated communities and high-end residences next to Guayaquil, the benchmark for the premium segment.',
  },
  {
    id: 'c-manta',
    slug: 'manta',
    name: 'Manta',
    state: 'Manabí',
    country: 'Ecuador',
    image: unsplash(10, 900, 1100),
    coordinates: { lat: -0.9677, lng: -80.7089 },
    blurb:
      'Costa del Pacífico con proyectos frente al mar y una demanda creciente de segunda vivienda.',
    blurbEn: 'Pacific coastline with beachfront projects and growing demand for second homes.',
  },
  {
    id: 'c-salinas',
    slug: 'salinas',
    name: 'Salinas',
    state: 'Santa Elena',
    country: 'Ecuador',
    image: unsplash(12, 900, 1100),
    coordinates: { lat: -2.2038, lng: -80.9584 },
    blurb:
      'Balneario y destino de segunda residencia, con condominios frente a la playa muy cotizados.',
    blurbEn: 'Beach resort and second-home destination, with sought-after beachfront condominiums.',
  },
  {
    id: 'c-ambato',
    slug: 'ambato',
    name: 'Ambato',
    state: 'Tungurahua',
    country: 'Ecuador',
    image: unsplash(14, 900, 1100),
    coordinates: { lat: -1.2543, lng: -78.6229 },
    blurb:
      'Centro comercial de la sierra centro, con barrios residenciales consolidados y buena plusvalía.',
    blurbEn:
      'Commercial hub of the central highlands, with established residential neighbourhoods and solid appreciation.',
  },
  {
    id: 'c-ibarra',
    slug: 'ibarra',
    name: 'Ibarra',
    state: 'Imbabura',
    country: 'Ecuador',
    image: unsplash(16, 900, 1100),
    coordinates: { lat: 0.3517, lng: -78.1223 },
    blurb:
      'La ciudad blanca del norte, con propiedades coloniales y desarrollos familiares en expansión.',
    blurbEn:
      'The White City of the north, with colonial properties and growing family developments.',
  },
  {
    id: 'c-riobamba',
    slug: 'riobamba',
    name: 'Riobamba',
    state: 'Chimborazo',
    country: 'Ecuador',
    image: unsplash(18, 900, 1100),
    coordinates: { lat: -1.6636, lng: -78.6546 },
    blurb:
      'Corazón de la sierra central, con vistas al Chimborazo y un mercado residencial accesible.',
    blurbEn:
      'Heart of the central highlands, with views of Chimborazo and an accessible residential market.',
  },
  {
    id: 'c-loja',
    slug: 'loja',
    name: 'Loja',
    state: 'Loja',
    country: 'Ecuador',
    image: unsplash(20, 900, 1100),
    coordinates: { lat: -3.9931, lng: -79.2042 },
    blurb:
      'Ciudad universitaria y cultural del sur, con un mercado residencial estable y en crecimiento sostenido.',
    blurbEn:
      'University and cultural city in the south, with a stable, steadily growing residential market.',
  },
];

export const amenities: Amenity[] = [
  { id: 'a1', label: 'Air conditioning', icon: 'Wind', group: 'indoor' },
  { id: 'a2', label: 'Underfloor heating', icon: 'Thermometer', group: 'indoor' },
  { id: 'a3', label: 'Fireplace', icon: 'Flame', group: 'indoor' },
  { id: 'a4', label: 'Walk-in closet', icon: 'Shirt', group: 'indoor' },
  { id: 'a5', label: 'Chef kitchen', icon: 'ChefHat', group: 'indoor' },
  { id: 'a6', label: 'Home office', icon: 'Laptop', group: 'indoor' },
  { id: 'a7', label: 'Wine cellar', icon: 'Wine', group: 'indoor' },
  { id: 'a8', label: 'Laundry room', icon: 'WashingMachine', group: 'indoor' },
  { id: 'a9', label: 'Private pool', icon: 'Waves', group: 'outdoor' },
  { id: 'a10', label: 'Garden', icon: 'Trees', group: 'outdoor' },
  { id: 'a11', label: 'Roof terrace', icon: 'Sun', group: 'outdoor' },
  { id: 'a12', label: 'Outdoor kitchen', icon: 'Utensils', group: 'outdoor' },
  { id: 'a13', label: 'Covered parking', icon: 'Car', group: 'building' },
  { id: 'a14', label: 'Elevator', icon: 'MoveVertical', group: 'building' },
  { id: 'a15', label: 'Concierge', icon: 'BellRing', group: 'building' },
  { id: 'a16', label: 'Fitness room', icon: 'Dumbbell', group: 'building' },
  { id: 'a17', label: 'Pet friendly', icon: 'PawPrint', group: 'building' },
  { id: 'a18', label: 'Storage unit', icon: 'Package', group: 'building' },
  { id: 'a19', label: 'Solar panels', icon: 'SunMedium', group: 'utility' },
  { id: 'a20', label: 'EV charger', icon: 'Zap', group: 'utility' },
  { id: 'a21', label: 'Fibre internet', icon: 'Wifi', group: 'utility' },
  { id: 'a22', label: 'Smart home', icon: 'Cpu', group: 'utility' },
  { id: 'a23', label: 'Security system', icon: 'ShieldCheck', group: 'utility' },
  { id: 'a24', label: 'Water softener', icon: 'Droplets', group: 'utility' },
];

export function getAmenities(isEs: boolean = true): Amenity[] {
  if (!isEs) return amenities;
  const esLabels: Record<string, string> = {
    a1: 'Aire acondicionado',
    a2: 'Suelo radiante',
    a3: 'Chimenea',
    a4: 'Vestidor',
    a5: 'Cocina de diseño',
    a6: 'Despacho / Oficina',
    a7: 'Bodega',
    a8: 'Zona de lavandería',
    a9: 'Piscina privada',
    a10: 'Jardín',
    a11: 'Terraza en cubierta',
    a12: 'Cocina exterior',
    a13: 'Aparcamiento cubierto',
    a14: 'Ascensor',
    a15: 'Conserjería',
    a16: 'Gimnasio',
    a17: 'Admite mascotas',
    a18: 'Trastero',
    a19: 'Paneles solares',
    a20: 'Cargador coche eléctrico',
    a21: 'Fibra óptica',
    a22: 'Domótica',
    a23: 'Sistema de seguridad',
    a24: 'Descalcificador de agua',
  };
  return amenities.map((item) => ({
    ...item,
    label: esLabels[item.id] || item.label,
  }));
}

export const testimonialsEs: Testimonial[] = [
  {
    id: 't1',
    name: 'Jessica Moreau',
    location: 'Quito, Pichincha',
    avatar: avatar(9),
    quote:
      'Midieron la parcela con cinta métrica e higrómetro antes de mostrarnos el precio. La auditoría detectó un problema de drenaje que el vendedor subsanó antes del cierre.',
    rating: 5,
    dealType: 'Compró una villa · $1.24M',
  },
  {
    id: 't2',
    name: 'Michael Tran',
    location: 'Guayaquil, Guayas',
    avatar: avatar(12),
    quote:
      'Tres ofertas en once días, y nuestra asesora nos aconsejó rechazar la más alta. Tuvo toda la razón respecto al riesgo de financiación.',
    rating: 5,
    dealType: 'Vendió una casa · $980K',
  },
  {
    id: 't3',
    name: 'Sarah Lindqvist',
    location: 'Manta, Manabí',
    avatar: avatar(23),
    quote:
      'Los planos y el dossier documental estaban listos antes de la primera visita. Comparé cuatro áticos en una sola tarde.',
    rating: 5,
    dealType: 'Compró un ático · $2.1M',
  },
  {
    id: 't4',
    name: 'Daniel Okafor',
    location: 'Samborondón, Guayas',
    avatar: avatar(33),
    quote:
      'Alquilo dos viviendas a través de Vestra. Las liquidaciones llegan puntuales el día 2 de cada mes y el tiempo de desocupación ha sido inferior a una semana.',
    rating: 5,
    dealType: 'Inversor · 2 unidades gestionadas',
  },
  {
    id: 't5',
    name: 'Amelia Ruiz',
    location: 'Cuenca, Azuay',
    avatar: avatar(45),
    quote:
      'Nos trasladábamos desde el extranjero y lo visitamos todo por vídeo. Nada de la casa nos sorprendió cuando aterrizamos.',
    rating: 5,
    dealType: 'Compró una casa · $860K',
  },
  {
    id: 't6',
    name: 'Owen Whitfield',
    location: 'Ibarra, Imbabura',
    avatar: avatar(51),
    quote:
      'Respuestas transparentes sobre lo que realmente costaría la reforma. Eso es mucho más raro de lo que debería.',
    rating: 4,
    dealType: 'Compró un adosado · $645K',
  },
];

export const testimonialsEn: Testimonial[] = [
  {
    id: 't1',
    name: 'Jessica Moreau',
    location: 'Quito, Pichincha',
    avatar: avatar(9),
    quote:
      'They walked the lot with a tape measure and a moisture meter before we ever saw a price. The survey caught a drainage issue the seller fixed at closing.',
    rating: 5,
    dealType: 'Bought a villa · $1.24M',
  },
  {
    id: 't2',
    name: 'Michael Tran',
    location: 'Guayaquil, Guayas',
    avatar: avatar(12),
    quote:
      'Three offers in eleven days, and our agent talked us out of the highest one. She was right about the financing risk.',
    rating: 5,
    dealType: 'Sold a craftsman · $980K',
  },
  {
    id: 't3',
    name: 'Sarah Lindqvist',
    location: 'Manta, Manabí',
    avatar: avatar(23),
    quote:
      'The floor plans and the documents pack were ready before the first viewing. I compared four penthouses in one afternoon.',
    rating: 5,
    dealType: 'Bought a penthouse · $2.1M',
  },
  {
    id: 't4',
    name: 'Daniel Okafor',
    location: 'Samborondón, Guayas',
    avatar: avatar(33),
    quote:
      'I rent out two units through Vestra. Statements arrive on the second of the month and the vacancy gap has been under a week.',
    rating: 5,
    dealType: 'Investor · 2 units managed',
  },
  {
    id: 't5',
    name: 'Amelia Ruiz',
    location: 'Cuenca, Azuay',
    avatar: avatar(45),
    quote:
      'We were relocating from abroad and toured everything on video. Nothing about the house surprised us when we landed.',
    rating: 5,
    dealType: 'Bought a single house · $860K',
  },
  {
    id: 't6',
    name: 'Owen Whitfield',
    location: 'Ibarra, Imbabura',
    avatar: avatar(51),
    quote:
      'Straight answers about what the renovation would actually cost. That is rarer than it should be.',
    rating: 4,
    dealType: 'Bought a townhouse · $645K',
  },
];

export function getTestimonials(isEs: boolean = true) {
  return isEs ? testimonialsEs : testimonialsEn;
}

export const testimonials = testimonialsEs;

export const partners = [
  'Nordhaus',
  'Terra Lumen',
  'Kestrel Bank',
  'Almanac Title',
  'Solstice Build',
  'Meridian Capital',
  'Fieldnote Survey',
  'Cobalt Insurance',
];

export const faqsEs = [
  {
    question: '¿Qué incluye exactamente una auditoría Vestra?',
    answer:
      'Un plano medido de cada planta, registro fotográfico de cada estancia, lecturas de consumos y eficiencias, y notas técnicas de transparencia sobre cualquier reforma o detalle técnico.',
  },
  {
    question: '¿Debo pagar por trabajar con un agente comprador?',
    answer:
      'No. En compras de segunda mano nuestros honorarios los abona la parte vendedora en el momento del cierre. En obra nueva los abona la promotora.',
  },
  {
    question: '¿Con qué rapidez puedo agendar una visita?',
    answer:
      'Selecciona un horario en cualquier propiedad y recibirás confirmación en menos de 2 horas laborables. Las visitas en el mismo día son habituales en nuestras sedes.',
  },
  {
    question: '¿Puedo comprar desde el extranjero?',
    answer:
      'Sí. Realizamos visitas en vídeo en directo, coordinamos con notaría local y gestionamos la financiación a distancia.',
  },
  {
    question: '¿Gestionan también alquileres?',
    answer:
      'Sí. Los alquileres de larga estancia se auditan bajo el mismo estándar y ofrecemos gestión integral incluyendo selección de inquilinos y liquidaciones mensuales.',
  },
  {
    question: '¿Qué ocurre con mis viviendas guardadas y comparaciones?',
    answer:
      'Permanecen en tu dispositivo. Guardamos favoritos y comparaciones en almacenamiento local sin necesidad de registro ni envío a servidores.',
  },
];

export const faqsEn = [
  {
    question: 'What does a Vestra survey actually include?',
    answer:
      'A measured floor plan of every level, a photographic record of each room, utility and energy readings, and a note of anything we would want disclosed if we were buying.',
  },
  {
    question: 'Do I pay to work with a buying agent?',
    answer:
      'No. On resale purchases our fee is paid from the seller side at closing. On new developments the developer pays it. You will see the exact figure in writing before you make an offer.',
  },
  {
    question: 'How fast can I schedule a viewing?',
    answer:
      'Pick a slot on any listing page and you get a confirmation within two business hours. Same-day viewings are usually possible at our offices.',
  },
  {
    question: 'Can I buy from abroad?',
    answer:
      'Yes. We run recorded video tours, arrange a local notary, and coordinate with your lender. About a fifth of our closings last year never had the buyer in the room.',
  },
  {
    question: 'Do you handle rentals as well as sales?',
    answer:
      'We do. Long-term rentals are surveyed to the same standard, and landlords can hand over management including tenant screening, maintenance and monthly statements.',
  },
  {
    question: 'What happens to my saved homes and comparisons?',
    answer:
      'They stay on your device. This template stores favourites, comparisons and recently viewed homes in local storage — no account required, nothing sent to a server.',
  },
];

export function getFaqs(isEs: boolean = true) {
  return isEs ? faqsEs : faqsEn;
}

export const faqs = faqsEs;

export const companyStatsEs = [
  { value: 4200, suffix: '+', label: 'Viviendas auditadas', detail: 'desde 2009' },
  {
    value: 1.8,
    suffix: 'B',
    prefix: '$',
    label: 'Volumen transaccionado',
    detail: 'últimos 5 años',
  },
  { value: 24, suffix: '', label: 'Días en mercado', detail: 'mediana, 2025' },
  {
    value: 98,
    suffix: '%',
    label: 'Fidelización de clientes',
    detail: 'repetición o recomendación',
  },
];

export const companyStatsEn = [
  { value: 4200, suffix: '+', label: 'Homes surveyed', detail: 'since 2009' },
  { value: 1.8, suffix: 'B', prefix: '$', label: 'Closed volume', detail: 'last 5 years' },
  { value: 24, suffix: '', label: 'Days on market', detail: 'median, 2025' },
  { value: 98, suffix: '%', label: 'Client retention', detail: 'repeat or referral' },
];

export function getCompanyStats(isEs: boolean = true) {
  return isEs ? companyStatsEs : companyStatsEn;
}

export const companyStats = companyStatsEs;

export const milestonesEs = [
  {
    year: '2009',
    title: 'Una oficina, una visión',
    body: 'Sarango Real Estate abre en Cuenca con una promesa: asesoramiento transparente e inspección completa.',
  },
  {
    year: '2014',
    title: 'La auditoría se convierte en estándar',
    body: 'Publicamos nuestro primer informe estandarizado. Los compradores comienzan a exigirlo por nombre.',
  },
  {
    year: '2019',
    title: 'Crecimiento de equipo',
    body: 'Ampliación de servicios inmobiliarios. El equipo técnico crece con asesores trabajando junto a agentes.',
  },
  {
    year: '2023',
    title: 'Todo documentado online',
    body: 'Planos, consumos de suministros y dossiers documentales accesibles online en cada ficha.',
  },
];

export const milestonesEn = [
  {
    year: '2009',
    title: 'One office, clear vision',
    body: 'Sarango Real Estate opens in Cuenca with a single promise: transparent guidance and full inspection.',
  },
  {
    year: '2014',
    title: 'The survey becomes the product',
    body: 'We publish our first standardised survey pack. Buyers start asking other brokerages for it by name.',
  },
  {
    year: '2019',
    title: 'Team expansion',
    body: 'Expanding bespoke real estate services. The field team grows to expert advisors working alongside agents.',
  },
  {
    year: '2023',
    title: 'Everything on the record',
    body: 'Floor plans, utility readings and document packs move online, attached to every listing page.',
  },
];

export function getMilestones(isEs: boolean = true) {
  return isEs ? milestonesEs : milestonesEn;
}

export const milestones = milestonesEs;
