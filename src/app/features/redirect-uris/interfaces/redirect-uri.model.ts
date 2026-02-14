export interface RedirectUri {
    id: number;
    name: string;
    value: string;
    enabled: boolean;
}

export type RedirectUriInput = Omit<RedirectUri, 'id'>;
