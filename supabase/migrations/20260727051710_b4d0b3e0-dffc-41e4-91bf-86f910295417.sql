CREATE POLICY "Public can read media" ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'media');