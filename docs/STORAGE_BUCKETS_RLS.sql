-- Wedding Budget Tool - Storage Buckets RLS Policies
-- For Supabase Storage with Row Level Security

-- NOTE: First, manually create these buckets in Supabase Dashboard → Storage:
-- 1. avatars (Public)
-- 2. receipts (Private)
-- 3. event-docs (Private)

-- Then run the RLS policies below in the SQL Editor

-- ============================================================================
-- AVATARS BUCKET (Public) - Profile pictures
-- ============================================================================

-- Allow anyone to view avatar images (public bucket)
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- RECEIPTS BUCKET (Private) - Budget receipts/documents
-- ============================================================================

-- Allow event members to view receipts for their events
CREATE POLICY "Event members can view event receipts"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'receipts' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.event_members em
      WHERE em.user_id = auth.uid()
      AND em.event_id = (storage.foldername(name))[1]::uuid
    )
  );

-- Allow event members to upload receipts
CREATE POLICY "Event members can upload receipts"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'receipts' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.event_members em
      WHERE em.user_id = auth.uid()
      AND em.event_id = (storage.foldername(name))[1]::uuid
    )
  );

-- Allow receipt uploaders to update their receipts
CREATE POLICY "Users can update own receipts"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'receipts' AND
    auth.role() = 'authenticated' AND
    owner_id = auth.uid()
  );

-- Allow receipt uploaders to delete their receipts
CREATE POLICY "Users can delete own receipts"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'receipts' AND
    auth.role() = 'authenticated' AND
    owner_id = auth.uid()
  );

-- ============================================================================
-- EVENT-DOCS BUCKET (Private) - Event-related documents
-- ============================================================================

-- Allow event members to view event documents
CREATE POLICY "Event members can view event documents"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'event-docs' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.event_members em
      WHERE em.user_id = auth.uid()
      AND em.event_id = (storage.foldername(name))[1]::uuid
    )
  );

-- Allow event members with write permissions to upload documents
CREATE POLICY "Event members can upload event documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'event-docs' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.event_members em
      WHERE em.user_id = auth.uid()
      AND em.event_id = (storage.foldername(name))[1]::uuid
      AND em.role IN ('COUPLE_OWNER', 'COUPLE_EDITOR', 'HELPER_EDITOR', 'PLANNER_READONLY')
    )
  );

-- Allow owners and editors to update documents
CREATE POLICY "Event members can update event documents"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'event-docs' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.event_members em
      WHERE em.user_id = auth.uid()
      AND em.event_id = (storage.foldername(name))[1]::uuid
      AND em.role IN ('COUPLE_OWNER', 'COUPLE_EDITOR', 'HELPER_EDITOR')
    )
  );

-- Allow owners and editors to delete documents
CREATE POLICY "Event members can delete event documents"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'event-docs' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.event_members em
      WHERE em.user_id = auth.uid()
      AND em.event_id = (storage.foldername(name))[1]::uuid
      AND em.role IN ('COUPLE_OWNER', 'COUPLE_EDITOR', 'HELPER_EDITOR')
    )
  );

-- ============================================================================
-- BUCKET STORAGE LIMITS (Optional - set via Dashboard)
-- ============================================================================
-- 
-- avatars: Max 5MB per file, 500MB total
-- receipts: Max 50MB per file, 5GB total  
-- event-docs: Max 100MB per file, 10GB total
--
-- Set these in Supabase Dashboard → Storage → [bucket] → Settings
