import { z } from 'zod';

// customer-app-api-map.md §1 — sample under "Google sign-in exchange" / "refresh"
export const tokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
});

export type TokenResponse = z.infer<typeof tokenResponseSchema>;
