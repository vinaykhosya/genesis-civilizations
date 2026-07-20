import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tyajlotsxwocxxawcwta.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5YWpsb3RzeHdvY3h4YXdjd3RhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNDE0MTYsImV4cCI6MjA5OTYxNzQxNn0.kQXHspjD8uvq2FLpHUcXeCFUMY_rwaiCJeExPAWwQ7c";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
