import { execFileSync } from 'node:child_process';

export type LocalSupabaseEnv = {
  url: string;
  publishableKey: string;
  secretKey: string;
};

function envValue(...names: string[]) {
  for (const name of names) {
    const value = process.env[name];
    if (value) return value;
  }
  return undefined;
}

function parseEnvOutput(output: string) {
  for (const line of output.split('\n')) {
    const separator = line.indexOf('=');
    if (separator === -1) continue;
    const key = line.slice(0, separator);
    const value = line.slice(separator + 1).replace(/^['"]|['"]$/g, '');
    if (key && value && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function loadLocalSupabaseEnv(): LocalSupabaseEnv | null {
  const existingUrl = envValue('SUPABASE_URL', 'API_URL');
  const existingPublishable = envValue('SUPABASE_PUBLISHABLE_KEY', 'PUBLISHABLE_KEY', 'ANON_KEY');
  const existingSecret = envValue('SUPABASE_SECRET_KEY', 'SECRET_KEY', 'SERVICE_ROLE_KEY');

  if (existingUrl && existingPublishable && existingSecret) {
    return {
      url: existingUrl,
      publishableKey: existingPublishable,
      secretKey: existingSecret,
    };
  }

  try {
    const output = execFileSync('pnpm', ['exec', 'supabase', 'status', '-o', 'env'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    parseEnvOutput(output);
  } catch {
    return null;
  }

  const url = envValue('SUPABASE_URL', 'API_URL');
  const publishableKey = envValue('SUPABASE_PUBLISHABLE_KEY', 'PUBLISHABLE_KEY', 'ANON_KEY');
  const secretKey = envValue('SUPABASE_SECRET_KEY', 'SECRET_KEY', 'SERVICE_ROLE_KEY');

  if (!url || !publishableKey || !secretKey) {
    return null;
  }

  return { url, publishableKey, secretKey };
}
