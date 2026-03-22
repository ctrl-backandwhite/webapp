export interface GatewayRoute {
  id: string;
  uri: string;
  predicates: string[];
  filters: string[];
  order: number;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GatewayRouteInput {
  id: string;
  uri: string;
  predicates: string[];
  filters: string[];
  order: number;
}
