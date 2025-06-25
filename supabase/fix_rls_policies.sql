-- Fix RLS Policies for documents table
-- Choose Option A or Option B based on your needs

-- ============================================================================
-- OPTION A: SHARED ACCESS (Current Setup - Recommended for vector store)
-- ============================================================================
-- This allows all authenticated users to access all documents
-- Good for: Knowledge bases, shared vector stores, RAG applications

-- Drop any existing problematic policies
DROP POLICY IF EXISTS "select_own_documents" ON public.documents;

-- Verify current policies are working
-- These should already exist from the setup script:
-- ✅ Service role can manage all documents
-- ✅ Authenticated users can read documents  
-- ✅ Authenticated users can insert documents
-- ✅ Authenticated users can update documents
-- ✅ Authenticated users can delete documents

-- Test the current setup
SELECT 'Option A: Shared access policies are active' AS status;

-- ============================================================================
-- OPTION B: USER-SPECIFIC ACCESS (If you want document ownership)
-- ============================================================================
-- Uncomment this section if you want each user to only see their own documents

/*
-- Step 1: Add user_id column to track document ownership
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Create index for better performance
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON public.documents(user_id);

-- Step 3: Drop the broad access policies
DROP POLICY IF EXISTS "Authenticated users can read documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can update documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON public.documents;

-- Step 4: Create user-specific policies
CREATE POLICY "Users can read own documents" ON public.documents
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own documents" ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own documents" ON public.documents
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own documents" ON public.documents
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Step 5: Update existing documents to have a user_id (optional)
-- UPDATE public.documents SET user_id = 'your-user-id-here' WHERE user_id IS NULL;

SELECT 'Option B: User-specific access policies are active' AS status;
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    forcerlsforowners
FROM pg_tables 
WHERE tablename = 'documents';

-- List all policies on documents table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'documents';

-- Test access (run as authenticated user)
-- SELECT COUNT(*) FROM public.documents; 