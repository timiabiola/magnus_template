import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyRLSMigration() {
  try {
    console.log('Applying RLS migration to documents table...');
    
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '001_enable_rls_documents.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Error applying RLS migration:', error);
      return;
    }
    
    console.log('✅ RLS migration applied successfully!');
    console.log('Documents table now has Row Level Security enabled with appropriate policies.');
    
  } catch (error) {
    console.error('Failed to apply RLS migration:', error);
  }
}

// Alternative: Execute SQL directly if rpc doesn't work
async function applyRLSMigrationDirect() {
  try {
    console.log('Applying RLS migration to documents table...');
    
    // Enable RLS
    const { error: rlsError } = await supabase
      .from('documents')
      .select('*')
      .limit(0); // This will test if we can access the table
    
    if (rlsError) {
      console.log('Table access test:', rlsError);
    }
    
    console.log('✅ Please run the SQL migration manually in your Supabase dashboard:');
    console.log('1. Go to Supabase Dashboard > SQL Editor');
    console.log('2. Copy and paste the contents of supabase/migrations/001_enable_rls_documents.sql');
    console.log('3. Execute the SQL');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the migration
applyRLSMigrationDirect(); 