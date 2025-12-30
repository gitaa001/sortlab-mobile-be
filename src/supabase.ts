import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const url = process.env.SUPABASE_URL!;
const anon = process.env.SUPABASE_ANON_KEY!;

if (!url || !anon) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env");
}

export const supabase = createClient(url, anon);
