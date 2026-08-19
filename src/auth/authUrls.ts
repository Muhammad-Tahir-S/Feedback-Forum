export const AUTH_CALLBACK_PATH = '/auth/callback';
export const UPDATE_PASSWORD_PATH = '/auth/update-password';

export function parseAuthCallbackLocation(search: string, hash: string) {
  const searchParams = new URLSearchParams(search.replace(/^\?/, ''));
  const hashParams = new URLSearchParams(hash.replace(/^#/, ''));

  const error =
    searchParams.get('error_description') ||
    searchParams.get('error') ||
    hashParams.get('error_description') ||
    hashParams.get('error');

  return {
    error,
    code: searchParams.get('code'),
  };
}

export function isRecoveryRedirect(input: { search: string; hash: string; pathname: string }) {
  const search = new URLSearchParams(input.search.replace(/^\?/, ''));
  const hash = new URLSearchParams(input.hash.replace(/^#/, ''));

  return (
    hash.get('type') === 'recovery' ||
    search.get('type') === 'recovery' ||
    (input.pathname.includes(UPDATE_PASSWORD_PATH) && search.has('code'))
  );
}
