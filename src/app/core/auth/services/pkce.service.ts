import { Injectable } from '@angular/core';

export interface PKCEChallenge {
    verifier: string;
    challenge: string;
}

@Injectable({
    providedIn: 'root'
})
export class PKCEService {
    private readonly PKCE_VERIFIER_KEY = 'pkce_verifier';

    async generateChallengeAsync(): Promise<PKCEChallenge> {
        const verifier = this.generateVerifier();
        const challenge = await this.computeChallengeAsync(verifier);

        sessionStorage.setItem(this.PKCE_VERIFIER_KEY, verifier);

        return { verifier, challenge };
    }

    getStoredVerifier(): string | null {
        return sessionStorage.getItem(this.PKCE_VERIFIER_KEY);
    }

    clearVerifier(): void {
        sessionStorage.removeItem(this.PKCE_VERIFIER_KEY);
    }

    private generateVerifier(): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~';
        let verifier = '';
        const length = 128;
        const randomValues = new Uint8Array(length);
        crypto.getRandomValues(randomValues);

        for (let i = 0; i < length; i++) {
            verifier += characters[randomValues[i] % characters.length];
        }
        return verifier;
    }

    private async computeChallengeAsync(verifier: string): Promise<string> {
        const data = new TextEncoder().encode(verifier);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return this.base64UrlEncode(hash);
    }

    // Converts ArrayBuffer to base64url for PKCE.
    private base64UrlEncode(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (const byte of bytes) {
            binary += String.fromCharCode(byte);
        }

        return btoa(binary)
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }
}
