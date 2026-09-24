import { z } from 'zod';

import { apiClient } from '@/lib/api/client';
import { validateResponse } from '@/lib/api/zodFetch';

import { supportTicketSchema } from './schemas';

export interface CreateSupportTicketPayload {
  subject: string;
  message: string;
}

// customer-app-api-map.md §11 — VERIFIED against the live backend's
// /openapi.json (2026-09-20). Trailing slash is load-bearing on both calls
// below, same precedent as /favourites/ and /reviews/: the backend
// 307-redirects the slash-less path to an `http://` (not `https://`)
// Location, which iOS/Android both refuse to follow — the bare path
// silently fails on-device. Calling the canonical slash-terminated path
// avoids the redirect entirely.
export async function createSupportTicket(payload: CreateSupportTicketPayload) {
  const response = await apiClient.post('/support-tickets/', payload);
  return validateResponse(supportTicketSchema, response, 'POST /support-tickets/');
}

// Lists the caller's own tickets. Not surfaced in the UI yet (Contact Us
// only creates tickets today), kept alongside `createSupportTicket` since
// it's the natural counterpart on this endpoint.
export async function getSupportTickets() {
  const response = await apiClient.get('/support-tickets/');
  return validateResponse(z.array(supportTicketSchema), response, 'GET /support-tickets/');
}
