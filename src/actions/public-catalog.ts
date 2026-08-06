'use server';

import type { PropertyFilters } from '@/types';
import * as propertyService from '@/services/property-service';
import * as agentService from '@/services/agent-service';

/**
 * Thin bridge so Client Components can reach the Prisma-backed catalogue —
 * they can't import property-service/agent-service directly (Prisma only
 * runs server-side), but they can call a Server Action. Every export here
 * just delegates; the actual logic and the frontend-shape mapping stays in
 * the two services.
 */

export async function searchPropertiesAction(filters: PropertyFilters) {
  return propertyService.searchProperties(filters);
}

export async function searchAllAction(filters: PropertyFilters) {
  return propertyService.searchAll(filters);
}

export async function getPropertiesByIdsAction(ids: string[]) {
  return propertyService.getPropertiesByIds(ids);
}

export async function getPropertyByIdAction(id: string) {
  return propertyService.getPropertyById(id);
}

export async function getAgentByIdAction(id: string) {
  return agentService.getAgentById(id);
}

export async function getAgentsByIdsAction(ids: string[]) {
  return agentService.getAgentsByIds(ids);
}
