/**
 * Validates Supabase env for server routes (Amplify, Vercel, etc.).
 * NEXT_PUBLIC_* must exist at build time for the client; the service role key
 * must be set on the host for API routes that use the admin client.
 */
function looksLikeJwt(value: string): boolean {
  return value.startsWith('eyJ');
}

export function getMissingSupabaseServerEnvMessage(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (url && looksLikeJwt(url)) {
    return (
      'NEXT_PUBLIC_SUPABASE_URL is set to a JWT token. It must be your Supabase project URL only, e.g. ' +
      'https://YOUR_PROJECT_REF.supabase.co (Supabase → Settings → General → Project URL). ' +
      'Put the anon JWT in NEXT_PUBLIC_SUPABASE_ANON_KEY and the service_role JWT in SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  if (!url || !anon) {
    return (
      'Server is missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'In AWS Amplify: Hosting → Environment variables — add both for this branch, then redeploy.'
    );
  }
  if (!service) {
    return (
      'Server is missing SUPABASE_SERVICE_ROLE_KEY at runtime. ' +
      'In Amplify: confirm the variable name is exactly SUPABASE_SERVICE_ROLE_KEY, scope includes this branch, then redeploy. ' +
      'Value = legacy service_role JWT from Supabase → Settings → API Keys → Legacy anon, service_role.'
    );
  }
  return null;
}

export function missingSupabaseServerEnvResponse(): Response | null {
  const msg = getMissingSupabaseServerEnvMessage();
  if (!msg) return null;
  return Response.json({ error: msg }, { status: 503 });
}
