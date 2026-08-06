import { z } from 'zod';

const socialSchema = z
  .object({
    tiktok: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    facebook: z.string().url().optional().or(z.literal('')),
  })
  .default({});

const slug = z
  .string()
  .min(1, 'Required')
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens only');

export const agentScalarSchema = z.object({
  slug,
  name: z.string().min(1, 'Required'),
  role: z.string().min(1, 'Required'),
  license: z.string().optional().or(z.literal('')),
  avatar: z.string().min(1, 'Required'),
  phone: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  address: z.string().optional().or(z.literal('')),
  citySlug: z.string().min(1, 'Required'),
  bio: z.string().min(1, 'Required'),
  languages: z.array(z.string()).default([]),
  specialties: z.array(z.string()).default([]),
  experienceYears: z.coerce.number().int().min(0).default(0),
  dealsClosed: z.coerce.number().int().min(0).default(0),
  rating: z.coerce.number().min(0).max(5).default(0),
  social: socialSchema,
});

export const createAgentSchema = agentScalarSchema.extend({
  loginEmail: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
});

export const updateAgentSchema = agentScalarSchema.partial();

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;

const listingStatus = z.enum(['FOR_SALE', 'FOR_RENT', 'SOLD', 'NEW_DEVELOPMENT']);
const propertyType = z.enum(['VILLA', 'APARTMENT', 'TOWNHOUSE', 'PENTHOUSE', 'LOFT', 'ESTATE', 'OFFICE']);
const pricePeriod = z.enum(['MONTH', 'TOTAL']);
const energyRating = z.enum(['A', 'B', 'C', 'D']);

export const propertyScalarSchema = z.object({
  reference: z.string().min(1, 'Required'),
  slug,
  title: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
  status: listingStatus,
  type: propertyType,
  price: z.coerce.number().int().positive('Must be greater than 0'),
  pricePeriod,
  address: z.string().min(1, 'Required'),
  citySlug: z.string().min(1, 'Required'),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().int().min(0),
  garages: z.coerce.number().int().min(0).default(0),
  area: z.coerce.number().int().positive('Must be greater than 0'),
  landArea: z.coerce.number().int().min(0).default(0),
  yearBuilt: z.coerce.number().int().optional(),
  energyRating: energyRating.optional(),
  featured: z.coerce.boolean().default(false),
  amenityIds: z.array(z.string()).default([]),
  videoUrl: z.string().url().optional().or(z.literal('')),
  tourUrl: z.string().url().optional().or(z.literal('')),
  hoaFee: z.coerce.number().int().optional(),
  propertyTax: z.coerce.number().int().min(0).default(0),
  nearby: z.array(z.object({ label: z.string(), distance: z.coerce.number() })).default([]),
});

export const createPropertySchema = propertyScalarSchema.extend({
  /** Required when the actor is ADMIN; ignored (forced to the actor's own agent) for AGENT. */
  agentId: z.string().min(1).optional(),
});

export const updatePropertySchema = propertyScalarSchema.partial();

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;

export const clientScalarSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export const createClientSchema = clientScalarSchema;
export const updateClientSchema = clientScalarSchema.partial();

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;

export const leadStageSchema = z.enum([
  'NEW',
  'CONTACTED',
  'VISIT_SCHEDULED',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST',
]);

export const leadSourceSchema = z.enum([
  'WEBSITE_VIEWING',
  'WEBSITE_CONTACT',
  'WEBSITE_AGENT_MESSAGE',
  'MANUAL',
  'REFERRAL',
  'OTHER',
]);

export const createLeadSchema = z.object({
  clientId: z.string().min(1, 'Required'),
  propertyId: z.string().optional().or(z.literal('')),
  assignedAgentId: z.string().optional().or(z.literal('')),
  source: leadSourceSchema.default('MANUAL'),
  message: z.string().optional().or(z.literal('')),
});

export const leadNoteSchema = z.object({
  body: z.string().min(1, 'Note cannot be empty'),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
