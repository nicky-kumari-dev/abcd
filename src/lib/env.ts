/**
 * Server-only environment access with explicit, non-leaking validation.
 * Read these inside server function handlers / server routes only.
 */

const DESCRIPTIONS: Record<string, string> = {
  SUPABASE_URL: "Your Supabase project URL (https://<ref>.supabase.co)",
  SUPABASE_PUBLISHABLE_KEY: "Your Supabase publishable (anon) key",
  SUPABASE_SERVICE_ROLE_KEY: "Your Supabase service role / secret key (server only)",
};

/** Returns the variable value, or throws a message that names the variable but never its value. */
export function requireServerEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required server environment variable: ${name}` +
        (DESCRIPTIONS[name] ? ` — ${DESCRIPTIONS[name]}.` : ".") +
        " Set it in your hosting provider's environment settings (or .env locally, see .env.example).",
    );
  }
  return value;
}
