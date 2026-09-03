export const STAGE_LABELS_ES: Record<string, string> = {
  NEW: 'Nuevo',
  CONTACTED: 'Contactado',
  VISIT_SCHEDULED: 'Visita agendada',
  NEGOTIATION: 'Negociación',
  CLOSED_WON: 'Cerrado ganado',
  CLOSED_LOST: 'Cerrado perdido',
};

export const STAGE_LABELS_EN: Record<string, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  VISIT_SCHEDULED: 'Visit scheduled',
  NEGOTIATION: 'Negotiation',
  CLOSED_WON: 'Closed won',
  CLOSED_LOST: 'Closed lost',
};

export const STAGE_LABELS: Record<string, string> = STAGE_LABELS_ES;

export function getStageLabel(stage: string, lang: 'es' | 'en' = 'es'): string {
  const dict = lang === 'en' ? STAGE_LABELS_EN : STAGE_LABELS_ES;
  return dict[stage] ?? stage;
}

export const STAGE_ORDER = [
  'NEW',
  'CONTACTED',
  'VISIT_SCHEDULED',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST',
] as const;

export const SOURCE_LABELS_ES: Record<string, string> = {
  WEBSITE_VIEWING: 'Web — Solicitud de visita',
  WEBSITE_CONTACT: 'Web — Formulario de contacto',
  WEBSITE_AGENT_MESSAGE: 'Web — Mensaje a agente',
  MANUAL: 'Registro manual',
  REFERRAL: 'Referido',
  OTHER: 'Otro',
};

export const SOURCE_LABELS_EN: Record<string, string> = {
  WEBSITE_VIEWING: 'Website — viewing request',
  WEBSITE_CONTACT: 'Website — contact form',
  WEBSITE_AGENT_MESSAGE: 'Website — message to agent',
  MANUAL: 'Manual entry',
  REFERRAL: 'Referral',
  OTHER: 'Other',
};

export const SOURCE_LABELS: Record<string, string> = SOURCE_LABELS_ES;

export function getSourceLabel(source: string, lang: 'es' | 'en' = 'es'): string {
  const dict = lang === 'en' ? SOURCE_LABELS_EN : SOURCE_LABELS_ES;
  return dict[source] ?? source;
}

export const STATUS_LABELS_ES: Record<string, string> = {
  FOR_SALE: 'En venta',
  FOR_RENT: 'En alquiler',
  SOLD: 'Vendida',
  NEW_DEVELOPMENT: 'Nuevo desarrollo',
};

export const STATUS_LABELS_EN: Record<string, string> = {
  FOR_SALE: 'For sale',
  FOR_RENT: 'For rent',
  SOLD: 'Sold',
  NEW_DEVELOPMENT: 'New development',
};

export const STATUS_LABELS: Record<string, string> = STATUS_LABELS_ES;

export function getStatusLabel(status: string, lang: 'es' | 'en' = 'es'): string {
  const dict = lang === 'en' ? STATUS_LABELS_EN : STATUS_LABELS_ES;
  return dict[status] ?? status;
}

export const PROPERTY_TYPE_LABELS_ES: Record<string, string> = {
  HOUSE: 'Casa',
  APARTMENT: 'Departamento',
  LAND: 'Terreno / Lote',
  ESTATE: 'Finca / Quinta',
  STUDIO: 'Suite / Estudio',
  PENTHOUSE: 'Ático / Penthouse',
  TOWNHOUSE: 'Casa en conjunto / Adosada',
  COMMERCIAL: 'Local comercial',
  OFFICE: 'Oficina',
  VILLA: 'Villa',
  LOFT: 'Loft',
};

export const PROPERTY_TYPE_LABELS_EN: Record<string, string> = {
  HOUSE: 'House',
  APARTMENT: 'Apartment',
  LAND: 'Land / Lot',
  ESTATE: 'Estate / Country property',
  STUDIO: 'Studio / Suite',
  PENTHOUSE: 'Penthouse',
  TOWNHOUSE: 'Townhouse',
  COMMERCIAL: 'Commercial space',
  OFFICE: 'Office',
  VILLA: 'Villa',
  LOFT: 'Loft',
};

export const PROPERTY_TYPE_LABELS: Record<string, string> = PROPERTY_TYPE_LABELS_ES;

export function getPropertyTypeLabel(type: string, lang: 'es' | 'en' = 'es'): string {
  const dict = lang === 'en' ? PROPERTY_TYPE_LABELS_EN : PROPERTY_TYPE_LABELS_ES;
  return dict[type] ?? type;
}

export const ACTIVITY_ACTION_LABELS_ES: Record<string, string> = {
  CREATED: 'creó',
  UPDATED: 'actualizó',
  STAGE_CHANGED: 'cambió etapa de',
  NOTE_ADDED: 'agregó una nota a',
  ASSIGNED: 'reasignó',
  STATUS_CHANGED: 'cambió estado de',
  DELETED: 'eliminó',
};

export const ACTIVITY_ACTION_LABELS_EN: Record<string, string> = {
  CREATED: 'created',
  UPDATED: 'updated',
  STAGE_CHANGED: 'changed stage of',
  NOTE_ADDED: 'added a note to',
  ASSIGNED: 'reassigned',
  STATUS_CHANGED: 'changed status of',
  DELETED: 'deleted',
};

export const ACTIVITY_ACTION_LABELS: Record<string, string> = ACTIVITY_ACTION_LABELS_ES;

export function getActivityActionLabel(action: string, lang: 'es' | 'en' = 'es'): string {
  const dict = lang === 'en' ? ACTIVITY_ACTION_LABELS_EN : ACTIVITY_ACTION_LABELS_ES;
  return dict[action] ?? action.toLowerCase();
}
