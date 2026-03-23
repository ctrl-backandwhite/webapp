import { TestBed } from '@angular/core/testing';
import { PKCEService, PKCEChallenge } from './pkce.service';

describe('PKCEService', () => {
    let service: PKCEService;

    beforeEach(() => {
        sessionStorage.clear();
        TestBed.configureTestingModule({
            providers: [PKCEService],
        });
        service = TestBed.inject(PKCEService);
    });

    afterEach(() => sessionStorage.clear());

    describe('generateChallengeAsync', () => {
        it('should return a PKCEChallenge with verifier and challenge', async () => {
            const result: PKCEChallenge = await service.generateChallengeAsync();
            expect(result.verifier).toBeDefined();
            expect(result.challenge).toBeDefined();
            expect(result.verifier.length).toBe(128);
        });

        it('should store the verifier in sessionStorage', async () => {
            await service.generateChallengeAsync();
            const stored = sessionStorage.getItem('pkce_verifier');
            expect(stored).not.toBeNull();
            expect(stored!.length).toBe(128);
        });

        it('should produce a base64url-encoded challenge (no +, /, or =)', async () => {
            const result = await service.generateChallengeAsync();
            expect(result.challenge).not.toMatch(/[+/=]/);
        });

        it('should generate different verifiers on each call', async () => {
            const r1 = await service.generateChallengeAsync();
            const r2 = await service.generateChallengeAsync();
            expect(r1.verifier).not.toBe(r2.verifier);
        });
    });

    describe('getStoredVerifier', () => {
        it('should return null when no verifier is stored', () => {
            expect(service.getStoredVerifier()).toBeNull();
        });

        it('should return the stored verifier after generating a challenge', async () => {
            const result = await service.generateChallengeAsync();
            expect(service.getStoredVerifier()).toBe(result.verifier);
        });
    });

    describe('clearVerifier', () => {
        it('should remove the verifier from sessionStorage', async () => {
            await service.generateChallengeAsync();
            service.clearVerifier();
            expect(service.getStoredVerifier()).toBeNull();
        });
    });
});
