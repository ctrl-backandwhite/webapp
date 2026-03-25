import { TestBed } from '@angular/core/testing';
import { OAuth2ConfigService, OAuth2Config } from './oauth2-config.service';

describe('OAuth2ConfigService', () => {
    let service: OAuth2ConfigService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [OAuth2ConfigService],
        });
        service = TestBed.inject(OAuth2ConfigService);
    });

    describe('getConfig', () => {
        it('should return a config object', () => {
            const config: OAuth2Config = service.getConfig();
            expect(config).toBeDefined();
            expect(config.clientId).toBeDefined();
            expect(config.redirectUri).toBeDefined();
            expect(config.authorizationEndpoint).toBeDefined();
            expect(config.scope).toBeDefined();
            expect(config.responseType).toBe('code');
            expect(config.codeChallengeMethod).toBe('S256');
        });

        it('should return a copy so mutations do not affect internal state', () => {
            const config1 = service.getConfig();
            config1.clientId = 'modified';
            const config2 = service.getConfig();
            expect(config2.clientId).not.toBe('modified');
        });
    });

    describe('buildAuthorizationUrl', () => {
        it('should include all required params', () => {
            const url = service.buildAuthorizationUrl('test-challenge');
            expect(url).toContain('client_id=');
            expect(url).toContain('redirect_uri=');
            expect(url).toContain('scope=');
            expect(url).toContain('response_type=code');
            expect(url).toContain('response_mode=');
            expect(url).toContain('code_challenge_method=S256');
            expect(url).toContain('code_challenge=test-challenge');
        });

        it('should use the authorization endpoint as base URL', () => {
            const config = service.getConfig();
            const url = service.buildAuthorizationUrl('abc');
            expect(url.startsWith(config.authorizationEndpoint)).toBe(true);
        });
    });
});
