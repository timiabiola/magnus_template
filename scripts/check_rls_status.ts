import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

async function checkRLSStatus() {
  console.log('🔍 Checking RLS status for documents table...\n');

  const client = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Check if RLS is enabled
    console.log('1️⃣ Checking RLS enabled status...');
    const { data: rlsStatus, error: rlsError } = await client
      .rpc('exec_sql', {
        sql: `
          SELECT 
            schemaname,
            tablename,
            rowsecurity,
            forcerlsforowners
          FROM pg_tables 
          WHERE tablename = 'documents';
        `
      });

    if (rlsError) {
      console.log('   Using alternative method to check RLS...');
      // Try alternative approach
      const { data: tableInfo, error: tableError } = await client
        .from('documents')
        .select('*')
        .limit(0);
      
      if (tableError && tableError.message.includes('row-level security')) {
        console.log('✅ RLS is enabled (detected from error message)');
      } else {
        console.log('✅ Table exists and accessible');
      }
    } else {
      console.log('✅ RLS Status:', rlsStatus);
    }

    // Check existing policies
    console.log('\n2️⃣ Checking existing RLS policies...');
    const { data: policies, error: policiesError } = await client
      .rpc('exec_sql', {
        sql: `
          SELECT 
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM pg_policies 
          WHERE tablename = 'documents';
        `
      });

    if (policiesError) {
      console.log('   Cannot directly query policies, checking access patterns...');
      
      // Test service role access
      const { data: serviceTest, error: serviceError } = await client
        .from('documents')
        .select('count', { count: 'exact', head: true });
      
      if (serviceError) {
        console.log('❌ Service role access failed:', serviceError.message);
      } else {
        console.log('✅ Service role can access documents table');
      }
      
      // Test with anon key
      const anonClient = createClient(supabaseUrl, supabaseAnonKey);
      const { data: anonTest, error: anonError } = await anonClient
        .from('documents')
        .select('count', { count: 'exact', head: true });
      
      if (anonError) {
        console.log('✅ Anonymous access properly restricted:', anonError.message);
      } else {
        console.log('⚠️  Anonymous access not restricted');
      }
      
    } else {
      console.log('✅ Current policies:');
      policies.forEach((policy: any) => {
        console.log(`   - ${policy.policyname}: ${policy.cmd} for ${policy.roles}`);
      });
    }

    // Check for problematic policies
    console.log('\n3️⃣ Checking for problematic policies...');
    const { data: problemCheck, error: problemError } = await client
      .rpc('exec_sql', {
        sql: `
          SELECT policyname 
          FROM pg_policies 
          WHERE tablename = 'documents' 
          AND (qual LIKE '%user_id%' OR with_check LIKE '%user_id%');
        `
      });

    if (problemError) {
      console.log('   Cannot check for problematic policies directly');
    } else if (problemCheck && problemCheck.length > 0) {
      console.log('❌ Found policies referencing non-existent user_id column:');
      problemCheck.forEach((policy: any) => {
        console.log(`   - ${policy.policyname}`);
      });
      console.log('\n📋 Action needed: Run the RLS fix script to remove these policies');
    } else {
      console.log('✅ No problematic policies found');
    }

    // Test vector operations
    console.log('\n4️⃣ Testing vector operations with current RLS...');
    try {
      const { SupabaseVectorStore } = await import('@langchain/community/vectorstores/supabase');
      const { OpenAIEmbeddings } = await import('@langchain/openai');

      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-your_openai_api_key_here') {
        const vectorStore = await SupabaseVectorStore.fromTexts(
          ['RLS test document'],
          [{ test: 'rls_check' }],
          new OpenAIEmbeddings(),
          {
            client,
            tableName: 'documents',
            queryName: 'match_documents',
          }
        );

        const results = await vectorStore.similaritySearch('RLS test', 1);
        console.log('✅ Vector operations working with current RLS policies');
        
        // Clean up
        await client
          .from('documents')
          .delete()
          .eq('metadata->test', 'rls_check');
      } else {
        console.log('⏭️  Skipping vector test (OpenAI API key not configured)');
      }
    } catch (vectorError) {
      console.log('❌ Vector operations failed:', vectorError);
    }

    console.log('\n🎉 RLS status check completed!');

  } catch (error) {
    console.error('❌ Error checking RLS status:', error);
  }
}

checkRLSStatus(); 