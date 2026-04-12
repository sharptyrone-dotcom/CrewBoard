-- Allow image uploads in the vessel-documents storage bucket.
--
-- The bucket was created in 012 with a PDF-only MIME allowlist. The
-- training module builder now supports image content blocks that upload
-- JPG/PNG/WebP files to the same bucket under a training/ prefix. This
-- migration widens the allowlist to include those image types.

update storage.buckets
set allowed_mime_types = array[
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
]
where id = 'vessel-documents';
