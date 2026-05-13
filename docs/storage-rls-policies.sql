-- =============================================
-- STORAGE BUCKET SETUP & RLS POLICIES
-- =============================================

-- 1. Ensure avatars bucket exists (if not already created via UI)
-- Done via Supabase Storage UI, but policies must be applied via SQL

-- 2. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Drop old policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own avatars" ON storage.objects;

-- 4. CREATE POLICY: Authenticated users can upload to avatars bucket
--    Files must be named: {user_id}-{timestamp}.{ext}
CREATE POLICY "Allow authenticated users to upload avatars"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (string_to_array(name, '-'))[1] = auth.uid()::text
  );

-- 5. CREATE POLICY: Public read access to avatars (so UI can display them)
CREATE POLICY "Allow public read access to avatars"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- 6. CREATE POLICY: Users can delete their own avatars
CREATE POLICY "Allow users to delete their own avatars"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (string_to_array(name, '-'))[1] = auth.uid()::text
  );

-- 7. CREATE POLICY: Users can update their own avatars (replace old one)
CREATE POLICY "Allow users to update their own avatars"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (string_to_array(name, '-'))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (string_to_array(name, '-'))[1] = auth.uid()::text
  );
