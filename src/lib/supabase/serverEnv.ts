/**
 * Validates Supabase env for server routes (Amplify, Vercel, etc.).
 * NEXT_PUBLIC_* must exist at build time for the client; the service role key
 * must be set on the host for API routes that use the admin client.
 */
export function getMissingSupabaseServerEnvMessage(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !anon) {
    return (
      'Server is missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'In AWS Amplify: Hosting → Environment variables — add both for this branch, then redeploy.'
    );
  }
  if (!service) {
    return (
      'Server is missing SUPABASE_SERVICE_ROLE_KEY. ' +
      'In AWS Amplify: Hosting → Environment variables — add it (Settings → API → service_role in Supabase). ' +
      'Redeploy after saving; it is never exposed to the browser.'
    );
  }
  return null;
}

export function missingSupabaseServerEnvResponse(): Response | null {
  const msg = getMissingSupabaseServerEnvMessage();
  if (!msg) return null;
  return Response.json({ error: msg }, { status: 503 });
}
