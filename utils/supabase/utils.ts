// utils/supabase/utils.ts
import { createClient } from "./server";

export async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}