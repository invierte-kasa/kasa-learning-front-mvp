const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tfstrmqthvxrdhepjfoi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmc3RybXF0aHZ4cmRoZXBqZm9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTQzMzAsImV4cCI6MjA2OTEzMDMzMH0.4DD9El6Ks9eCFMd9g6cRqoBe7-kffGOkzUW6JxU5XoU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log("Attempting to connect to Supabase Auth...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'wrongpassword123'
  });

  if (error) {
    console.log("Connection successful! Received expected error from Supabase:");
    console.log(`Error: ${error.message}`);
  } else {
    console.log("Unexpected success! Logged in as test@example.com");
  }
}

testLogin();
