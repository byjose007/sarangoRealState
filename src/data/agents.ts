import type { Agent } from '@/types';
import { avatar } from './images';
import { cities } from './reference';

/**
 * Fixture data for blog byline attribution ONLY — `Article.authorId` in
 * `data/articles.ts` references these ids. The real agent directory (used
 * by /agents, property listings, the admin panel) is Prisma-backed via
 * `@/services/agent-service`. Blog content isn't managed from the admin
 * panel, so this stays static rather than being unified with the DB.
 */
export const agents: Agent[] = [
  {
    id: 'ag-1',
    slug: 'jose-sarango',
    name: 'José Sarango',
    role: 'Agente Corredor de Bienes Raíces (TSBR Lic. 551 -A)',
    license: 'Licencia 551 -A',
    avatar: '/images/jose-sarango.jpg',
    phone: '+593 98 672 6084',
    email: 'jasarangoguaillas69@gmail.com',
    address: 'Edificio Alameda 1, Local número 4, calles José Astudillo Regalado, Cuenca, Ecuador',
    citySlug: 'cuenca',
    bio: 'Especialista en la compra, venta e inversión de propiedades en Cuenca, brindando asesoría estratégica, valoración profesional y negociaciones orientadas a maximizar el patrimonio de cada cliente. Agente corredor de bienes raíces certificado TSBR con Licencia 551 -A, respaldando cada transacción con total transparencia y profesionalismo.',
    languages: ['Español', 'Inglés'],
    specialties: [
      'Licencia 551 -A',
      'Ingeniero Comercial',
      'Corredor TSBR',
      'Compra & Venta',
      'Asesoría Inmobiliaria',
      'Inversiones Patrimoniales',
    ],
    experienceYears: 5,
    dealsClosed: 280,
    rating: 5.0,
    social: {
      tiktok: 'https://www.tiktok.com/@josesarango695?_r=1&_t=ZS-98bPoOtmY6R',
      instagram: 'https://www.instagram.com/josestalinsarangoguaillas',
      facebook: 'https://www.facebook.com/people/Sarango-Real-Estate/61562774117839/',
    },
  },
  {
    id: 'ag-2',
    slug: 'arlene-mccoy',
    name: 'Arlene McCoy',
    role: 'Senior Agent',
    avatar: avatar(1),
    phone: '+1 (300) 555-0101',
    email: 'arlene.mccoy@sarangorealestate.com',
    citySlug: 'cuenca',
    bio: 'Arlene carries a senior advisory portfolio focusing on luxury condos and investment developments. She provides transparent, data-driven insights and personalized client guidance.',
    languages: ['English', 'Spanish'],
    specialties: ['Luxury Condos', 'Investment Yield', 'Relocation'],
    experienceYears: 12,
    dealsClosed: 195,
    rating: 4.9,
    social: {
      tiktok: 'https://www.tiktok.com/@josesarango695?_r=1&_t=ZS-98bPoOtmY6R',
      instagram: 'https://www.instagram.com/josestalinsarangoguaillas',
      facebook: 'https://www.facebook.com/people/Sarango-Real-Estate/61562774117839/',
    },
  },
];

export const agentById = (id: string) => agents.find((agent) => agent.id === id);
export const agentBySlug = (slug: string) => agents.find((agent) => agent.slug === slug);
