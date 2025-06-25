-- Setup script for new Supabase database
-- Run this in your Supabase SQL Editor to set up vector search

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 2. Create documents table for vector storage
CREATE TABLE IF NOT EXISTS public.documents (
    id BIGSERIAL PRIMARY KEY,
    content TEXT,
    metadata JSONB,
    embedding vector(1536) -- OpenAI embedding dimension
);

-- 3. Create vector similarity search function
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.78,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id bigint,
    content text,
    metadata jsonb,
    similarity float
)
LANGUAGE SQL STABLE
AS $$
SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
FROM documents
WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
ORDER BY similarity DESC
LIMIT match_count;
$$;

-- 4. Create index for better performance
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 5. Enable Row Level Security
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
-- Service role has full access (needed for vector operations)
CREATE POLICY "Service role can manage all documents" ON public.documents
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Authenticated users can read documents
CREATE POLICY "Authenticated users can read documents" ON public.documents
FOR SELECT
TO authenticated
USING (true);

-- Authenticated users can insert documents
CREATE POLICY "Authenticated users can insert documents" ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update documents
CREATE POLICY "Authenticated users can update documents" ON public.documents
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated users can delete documents
CREATE POLICY "Authenticated users can delete documents" ON public.documents
FOR DELETE
TO authenticated
USING (true);

-- 7. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO service_role;
GRANT USAGE, SELECT ON SEQUENCE documents_id_seq TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE documents_id_seq TO service_role;

-- 8. Create a test function to verify setup
CREATE OR REPLACE FUNCTION test_vector_setup()
RETURNS TEXT
LANGUAGE SQL
AS $$
SELECT 'Vector database setup complete! Ready for LangChain integration.';
$$;

-- Run the test
SELECT test_vector_setup(); 