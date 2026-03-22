export interface GatewayRoute {
  id: string;
  uri: string;
  predicates: string[];
  filters: string[];
  order: number;
  enabled: boolean;
  rateLimitReplenishRate?: number | null;
  rateLimitBurstCapacity?: number | null;
  rateLimitRequestedTokens?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GatewayRouteInput {
  id: string;
  uri: string;
  predicates: string[];
  filters: string[];
  order: number;
  rateLimitReplenishRate?: number | null;
  rateLimitBurstCapacity?: number | null;
  rateLimitRequestedTokens?: number | null;
}

export interface BulkImportResult {
  created: number;
  skipped: number;
  skippedIds: string[];
  errors: string[];
}
