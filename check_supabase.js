const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tfstrmqthvxrdhepjfoi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmc3RybXF0aHZ4cmRoZXBqZm9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTQzMzAsImV4cCI6MjA2OTEzMDMzMH0.4DD9El6Ks9eCFMd9g6cRqoBe7-kffGOkzUW6JxU5XoU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log('Starting search...');
  const possibleNames = ['sections', 'modules', 'section', 'module', 'learn_sections', 'learn_modules', 'learning_sections', 'learning_modules', 'profiles'];
  for (const table of possibleNames) {
    try {
      const { data, error } = await supabase.from(table).select('*', { count: 'exact' }).limit(1);
      if (!error) {
        console.log(`FOUND TABLE: ${table}`);
      } else {
        console.log(`Table ${table} failed: ${error.code} ${error.message}`);
      }
    } catch (e) {
      console.log(`Table ${table} catch: ${e.message}`);
    }
  }
  console.log('Finished search');
}

checkTables();
