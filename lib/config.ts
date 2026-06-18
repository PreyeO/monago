function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const config = {
  supabase: {
    url: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  },
  stripe: {
    publishableKey: requireEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
    secretKey: process.env.STRIPE_SECRET_KEY ?? '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  },
  admin: {
    password: process.env.ADMIN_PASSWORD ?? '',
  },
} as const;
