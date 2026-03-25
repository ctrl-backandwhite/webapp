import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
  });

  afterEach(() => localStorage.clear());

  describe('setTokens', () => {
    it('should store access token in localStorage', () => {
      service.setTokens('abc123');
      expect(localStorage.getItem('access_token')).toBe('abc123');
    });

    it('should store token type', () => {
      service.setTokens('abc', undefined, 3600, 'Bearer');
      expect(localStorage.getItem('token_type')).toBe('Bearer');
    });

    it('should store refresh token when provided', () => {
      service.setTokens('abc', 'refresh_xyz');
      expect(localStorage.getItem('refresh_token')).toBe('refresh_xyz');
    });

    it('should not store refresh token when not provided', () => {
      service.setTokens('abc');
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });

    it('should store expiration time based on expiresIn', () => {
      const before = Date.now();
      service.setTokens('abc', undefined, 3600);
      const stored = parseInt(localStorage.getItem('token_expires_at')!, 10);
      expect(stored).toBeGreaterThanOrEqual(before + 3600 * 1000);
    });
  });

  describe('getAccessToken', () => {
    it('should return null when no token stored', () => {
      expect(service.getAccessToken()).toBeNull();
    });

    it('should return stored token', () => {
      service.setTokens('my-token');
      expect(service.getAccessToken()).toBe('my-token');
    });
  });

  describe('getRefreshToken', () => {
    it('should return null when no refresh token stored', () => {
      expect(service.getRefreshToken()).toBeNull();
    });

    it('should return stored refresh token', () => {
      service.setTokens('access', 'my-refresh');
      expect(service.getRefreshToken()).toBe('my-refresh');
    });
  });

  describe('getTokenType', () => {
    it('should return Bearer by default', () => {
      expect(service.getTokenType()).toBe('Bearer');
    });

    it('should return stored token type', () => {
      service.setTokens('abc', undefined, 3600, 'DPoP');
      expect(service.getTokenType()).toBe('DPoP');
    });
  });

  describe('getExpiresAt', () => {
    it('should return null when no expiration stored', () => {
      expect(service.getExpiresAt()).toBeNull();
    });

    it('should return parsed number', () => {
      service.setTokens('abc', undefined, 1000);
      expect(service.getExpiresAt()).toBeGreaterThan(0);
    });
  });

  describe('isTokenExpired', () => {
    it('should return true when no token stored', () => {
      expect(service.isTokenExpired()).toBe(true);
    });

    it('should return false for future expiration', () => {
      service.setTokens('abc', undefined, 3600);
      expect(service.isTokenExpired()).toBe(false);
    });

    it('should return true for past expiration', () => {
      localStorage.setItem('token_expires_at', '1000');
      expect(service.isTokenExpired()).toBe(true);
    });
  });

  describe('hasAccessToken', () => {
    it('should return false when no token', () => {
      expect(service.hasAccessToken()).toBe(false);
    });

    it('should return true when token exists', () => {
      service.setTokens('abc');
      expect(service.hasAccessToken()).toBe(true);
    });
  });

  describe('clearTokens', () => {
    it('should remove all token keys from localStorage', () => {
      service.setTokens('abc', 'refresh', 3600, 'Bearer');
      service.clearTokens();
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(localStorage.getItem('token_expires_at')).toBeNull();
      expect(localStorage.getItem('token_type')).toBeNull();
    });
  });

  describe('getAccessTokenPayload', () => {
    it('should return null when no token', () => {
      expect(service.getAccessTokenPayload()).toBeNull();
    });

    it('should return null for malformed token', () => {
      localStorage.setItem('access_token', 'not-a-jwt');
      expect(service.getAccessTokenPayload()).toBeNull();
    });

    it('should decode a valid JWT payload', () => {
      const payload = { sub: 'user1', roles: ['ADMIN'] };
      const encoded = btoa(JSON.stringify(payload));
      const jwt = `header.${encoded}.signature`;
      localStorage.setItem('access_token', jwt);
      const result = service.getAccessTokenPayload();
      expect(result).toEqual(payload);
    });

    it('should return null for invalid base64 payload', () => {
      localStorage.setItem('access_token', 'header.!!!invalid!!!.sig');
      expect(service.getAccessTokenPayload()).toBeNull();
    });
  });
});
