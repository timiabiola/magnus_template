import dotenv from 'dotenv';
dotenv.config();

import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { OpenAIEmbeddings } from '@langchain/openai';
import { createClient } from '@supabase/supabase-js';

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) throw new Error(`Expected SUPABASE_SERVICE_ROLE_KEY`);

const url = process.env.SUPABASE_URL;
if (!url) throw new Error(`Expected env var SUPABASE_URL`);

export const testRLSVectorStore = async () => {
  console.log('Testing vector store with RLS enabled...');
  
  // Create client with service role key (should have full access)
  const client = createClient(url, supabaseKey);

  try {
    // Test 1: Basic vector store operations
    console.log('1. Testing vector store creation and search...');
    
    const vectorStore = await SupabaseVectorStore.fromTexts(
      ['RLS is now enabled', 'Security is important', 'Vector search works'],
      [{ id: 'rls1' }, { id: 'security1' }, { id: 'vector1' }],
      new OpenAIEmbeddings(),
      {
        client,
        tableName: 'documents',
        queryName: 'match_documents',
      }
    );

    const searchResult = await vectorStore.similaritySearch('security', 1);
    console.log('✅ Vector search result:', searchResult[0]);

    // Test 2: Direct table access with service role
    console.log('2. Testing direct table access with service role...');
    const { data: documents, error: selectError } = await client
      .from('documents')
      .select('*')
      .limit(3);

    if (selectError) {
      console.error('❌ Error accessing documents table:', selectError);
    } else {
      console.log(`✅ Successfully accessed ${documents?.length || 0} documents`);
    }

    // Test 3: Try with anon key (should fail without proper policies)
    console.log('3. Testing access with anon key (should be restricted)...');
    const anonClient = createClient(url, process.env.SUPABASE_ANON_KEY!);
    const { data: anonData, error: anonError } = await anonClient
      .from('documents')
      .select('*')
      .limit(1);

    if (anonError) {
      console.log('✅ Anon access properly restricted:', anonError.message);
    } else {
      console.log('⚠️ Anon access not restricted - check RLS policies');
    }

    console.log('\n🎉 RLS testing completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during RLS testing:', error);
  }
};

testRLSVectorStore(); 