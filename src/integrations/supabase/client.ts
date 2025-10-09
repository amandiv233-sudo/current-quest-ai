// src/integrations/supabase/client.ts

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rpeinhaejyqssnkhdipa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwZWluaGFlanlxc3Nua2hkaXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMzg0MzUsImV4cCI6MjA3MjgxNDQzNX0.O-msNL9Ppf1IcBD2ntjWAl5baIzM9BZjfVgdk49-jPc";

// The custom auth block has been removed to allow default session handling.
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);