export interface GrantType {
    id: number;
    value: string;
    enabled: boolean;
}

export type GrantTypeInput = Omit<GrantType, 'id'>;
