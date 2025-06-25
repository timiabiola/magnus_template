import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testSupabaseConnection() {
  console.log('🔗 Testing Supabase connection...\n');

  // Check environment variables
  if (!supabaseUrl) {
    console.error('❌ SUPABASE_URL is not set in .env file');
    return;
  }
  if (!supabaseAnonKey) {
    console.error('❌ SUPABASE_ANON_KEY is not set in .env file');
    return;
  }
  if (!supabaseServiceKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set in .env file');
    return;
  }

  console.log('✅ Environment variables are set');
  console.log(`📍 Connecting to: ${supabaseUrl}\n`);

  try {
    // Test 1: Basic connection with anon key
    console.log('1️⃣ Testing basic connection with anon key...');
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: anonTest, error: anonError } = await anonClient
      .from('documents')
      .select('count', { count: 'exact', head: true });

    if (anonError && !anonError.message.includes('permission denied')) {
      console.error('❌ Anon connection failed:', anonError.message);
    } else {
      console.log('✅ Anon client connected successfully');
    }

    // Test 2: Service role connection
    console.log('\n2️⃣ Testing service role connection...');
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: serviceTest, error: serviceError } = await serviceClient
      .from('documents')
      .select('count', { count: 'exact', head: true });

    if (serviceError) {
      console.error('❌ Service role connection failed:', serviceError.message);
      console.log('\n📋 Next steps:');
      console.log('1. Make sure you have run the database setup script');
      console.log('2. Check that the documents table exists');
      console.log('3. Verify your service role key is correct');
      return;
    } else {
      console.log('✅ Service role client connected successfully');
      console.log(`📊 Documents table exists with ${serviceTest?.length || 0} records`);
    }

    // Test 3: Vector extension check
    console.log('\n3️⃣ Testing vector extension...');
    const { data: extensionTest, error: extensionError } = await serviceClient
      .rpc('test_vector_setup');

    if (extensionError) {
      console.error('❌ Vector extension test failed:', extensionError.message);
      console.log('\n📋 You need to run the database setup script:');
      console.log('1. Go to Supabase Dashboard → SQL Editor');
      console.log('2. Copy the contents of supabase/setup_new_database.sql');
      console.log('3. Paste and execute the SQL');
    } else {
      console.log('✅ Vector extension is working');
      console.log(`📝 Response: ${extensionTest}`);
    }

    // Test 4: Test vector operations (if OpenAI key is available)
    if (process.env.OPENAI_API_KEY) {
      console.log('\n4️⃣ Testing vector operations...');
      try {
        const { SupabaseVectorStore } = await import('@langchain/community/vectorstores/supabase');
        const { OpenAIEmbeddings } = await import('@langchain/openai');

        const vectorStore = await SupabaseVectorStore.fromTexts(
          ['Connection test successful'],
          [{ test: true }],
          new OpenAIEmbeddings(),
          {
            client: serviceClient,
            tableName: 'documents',
            queryName: 'match_documents',
          }
        );

        console.log('✅ Vector operations working correctly');
        
        // Clean up test data
        await serviceClient
          .from('documents')
          .delete()
          .eq('metadata->test', true);
        
        console.log('🧹 Test data cleaned up');
      } catch (vectorError) {
        console.error('❌ Vector operations failed:', vectorError);
      }
    } else {
      console.log('\n4️⃣ Skipping vector test (OPENAI_API_KEY not set)');
    }

    console.log('\n🎉 Supabase connection test completed!');

  } catch (error) {
    console.error('❌ Connection test failed:', error);
  }
}

testSupabaseConnection(); 