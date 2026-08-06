export const STAGE_LABELS: Record<string, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  VISIT_SCHEDULED: 'Visit scheduled',
  NEGOTIATION: 'Negotiation',
  CLOSED_WON: 'Closed won',
  CLOSED_LOST: 'Closed lost',
};

export const STAGE_ORDER = [
  'NEW',
  'CONTACTED',
  'VISIT_SCHEDULED',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST',
] as const;

export const SOURCE_LABELS: Record<string, string> = {
  WEBSITE_VIEWING: 'Website — viewing request',
  WEBSITE_CONTACT: 'Website — contact form',
  WEBSITE_AGENT_MESSAGE: 'Website — message to agent',
  MANUAL: 'Manual entry',
  REFERRAL: 'Referral',
  OTHER: 'Other',
};

export const STATUS_LABELS: Record<string, string> = {
  FOR_SALE: 'For sale',
  FOR_RENT: 'For rent',
  SOLD: 'Sold',
  NEW_DEVELOPMENT: 'New development',
};

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  VILLA: 'Villa',
  APARTMENT: 'Apartment',
  TOWNHOUSE: 'Townhouse',
  PENTHOUSE: 'Penthouse',
  LOFT: 'Loft',
  ESTATE: 'Estate',
  OFFICE: 'Office',
};

export const ACTIVITY_ACTION_LABELS: Record<string, string> = {
  CREATED: 'created',
  UPDATED: 'updated',
  STAGE_CHANGED: 'changed stage of',
  NOTE_ADDED: 'added a note to',
  ASSIGNED: 'reassigned',
  STATUS_CHANGED: 'changed status of',
  DELETED: 'deleted',
};
