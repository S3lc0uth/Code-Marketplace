// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://uoptiiynepvkwauohkjp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvcHRpaXluZXB2a3dhdW9oa2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyODc5NDgsImV4cCI6MjA1Nzg2Mzk0OH0.sz79RmdYKdp8vdaw778qOGpEHscw1bsD6fxPQpJivWA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);