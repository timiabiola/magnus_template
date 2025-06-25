-- Enable RLS on the documents table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to have full access (for vector operations)
CREATE POLICY "Service role can manage all documents" ON public.documents
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create policy to allow authenticated users to read documents
CREATE POLICY "Authenticated users can read documents" ON public.documents
FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow authenticated users to insert documents
CREATE POLICY "Authenticated users can insert documents" ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow authenticated users to update their own documents (if you add a user_id column later)
-- For now, we'll allow updates for authenticated users
CREATE POLICY "Authenticated users can update documents" ON public.documents
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy to allow authenticated users to delete documents
CREATE POLICY "Authenticated users can delete documents" ON public.documents
FOR DELETE
TO authenticated
USING (true);

-- Grant necessary permissions to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO service_role; 