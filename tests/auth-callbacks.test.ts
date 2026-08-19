import { describe, expect, it } from 'vitest';

import { AUTH_CALLBACK_PATH, isRecoveryRedirect, parseAuthCallbackLocation, UPDATE_PASSWORD_PATH } from '@/auth/authUrls';
import { MIN_PASSWORD_LENGTH, passwordMessage } from '@/auth/passwordPolicy';

describe('password policy', () => {
  it('requires at least 8 characters', () => {
    expect(MIN_PASSWORD_LENGTH).toBe(8);
    expect(passwordMessage).toContain('8');
  });
});

describe('OAuth and recovery callbacks', () => {
  it('sends Google OAuth through /auth/callback', () => {
    expect(AUTH_CALLBACK_PATH).toBe('/auth/callback');
  });

  it('sends password reset links through /auth/update-password', () => {
    expect(UPDATE_PASSWORD_PATH).toBe('/auth/update-password');
  });

  it('exchanges a PKCE code from the callback query string', () => {
    expect(parseAuthCallbackLocation('?code=abc123', '')).toEqual({
      error: null,
      code: 'abc123',
    });
  });

  it('surfaces provider errors from the callback query or hash', () => {
    expect(parseAuthCallbackLocation('?error=access_denied', '')).toEqual({
      error: 'access_denied',
      code: null,
    });
    expect(parseAuthCallbackLocation('', '#error_description=User+cancelled')).toEqual({
      error: 'User cancelled',
      code: null,
    });
  });

  it('treats recovery hash, query, and reset-link code as password recovery', () => {
    expect(
      isRecoveryRedirect({
        search: '',
        hash: '#type=recovery',
        pathname: '/auth/callback',
      })
    ).toBe(true);
    expect(
      isRecoveryRedirect({
        search: '?type=recovery',
        hash: '',
        pathname: '/auth/callback',
      })
    ).toBe(true);
    expect(
      isRecoveryRedirect({
        search: '?code=reset-code',
        hash: '',
        pathname: '/auth/update-password',
      })
    ).toBe(true);
    expect(
      isRecoveryRedirect({
        search: '',
        hash: '',
        pathname: '/posts',
      })
    ).toBe(false);
  });
});
