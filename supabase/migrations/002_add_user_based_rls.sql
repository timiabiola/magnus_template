-- Optional: Add user_id column to documents table for user-based ownership
-- Uncomment and run this if you want user-specific document access

/*
-- Add user_id column to documents table
ALTER TABLE public.documents 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can read documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can update documents" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON public.documents;

-- Create more restrictive user-based policies
CREATE POLICY "Users can read their own documents" ON public.documents
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents" ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" ON public.documents
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" ON public.documents
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create index for better performance on user_id queries
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON public.documents(user_id);
*/ 