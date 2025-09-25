-- Create storage bucket for service images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-images',
  'service-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access to service images
CREATE POLICY "Public read access for service images" ON storage.objects
FOR SELECT USING (bucket_id = 'service-images');

-- Policy to allow authenticated users to upload service images (admin only in practice)
CREATE POLICY "Authenticated users can upload service images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'service-images' 
  AND auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to delete service images (admin only in practice)
CREATE POLICY "Authenticated users can delete service images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'service-images' 
  AND auth.role() = 'authenticated'
);