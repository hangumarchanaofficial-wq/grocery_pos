import { createClient } from '@/lib/supabase/server';
import { successResponse } from '@/lib/auth';

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return successResponse({ message: 'Logged out' });
}