const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oaxerqspdvtnrzmqevvk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9heGVycXNwZHZ0bnJ6bXFldnZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NjE4NDAsImV4cCI6MjA2OTAzNzg0MH0.aK9n2tCgBryH-JOaZJYpsPTTGli-knbOX3-uWHl6O_Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  if (error) {
    console.error('Supabase connection error:', error);
  } else {
    console.log('Supabase connection successful:', data);
  }
}

testConnection(); 