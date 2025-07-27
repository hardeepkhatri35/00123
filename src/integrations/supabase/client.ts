import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://oaxerqspdvtnrzmqevvk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9heGVycXNwZHZ0bnJ6bXFldnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjE4NDAsImV4cCI6MjA2OTAzNzg0MH0.aK9n2tCgBryH-JOaZJYpsPTTGli-knbOX3-uWHl6O_Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);