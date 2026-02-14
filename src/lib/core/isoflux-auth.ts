// =====================================================
// ISOFLUX / REACTOR API - DUAL AUTH (SESSION OR API KEY)
// Types and re-exports only; implementation in get-isoflux-context.ts and with-isoflux-auth.ts
// =====================================================

export interface IsoFluxContext {
  userId: string | null;
  organizationId: string;
  authMethod: 'session' | 'api_key';
  role?: string | null;
}

export { getIsoFluxContext } from './get-isoflux-context';
export type { IsoFluxAuthResult } from './get-isoflux-context';
