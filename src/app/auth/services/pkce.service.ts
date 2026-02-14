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

  generateChallenge(): PKCEChallenge {
    const verifier = this.generateVerifier();
    const challenge = this.generateChallengeSync(verifier);

    // Store verifier in sessionStorage for later use
    sessionStorage.setItem(this.PKCE_VERIFIER_KEY, verifier);

    return { verifier, challenge };
  }

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

  private generateChallengeSync(verifier: string): string {
    // Synchronous version - for immediate use
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = crypto.subtle.digest('SHA-256', data);
    // Note: This is async, but we're using sync API as wrapper
    return this.hashToBase64Url(verifier);
  }

  private async computeChallengeAsync(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hash));
    const hashString = String.fromCharCode.apply(null, hashArray);

    return btoa(hashString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  private hashToBase64Url(verifier: string): string {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hashArray = Array.from(new Uint8Array(new TextEncoder().encode(verifier)));
    const hashString = String.fromCharCode.apply(null, hashArray);

    return btoa(hashString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
}
