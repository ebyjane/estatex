import { getSupabaseBrowserClient } from './supabase-browser';

export const PROPERTIES_STORAGE_BUCKET = 'properties';

function safeFileSegment(name: string): string {
  const s = name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');
  return (s || 'file').slice(0, 200);
}

/**
 * Upload listing media to Supabase Storage `properties` bucket and return public URLs.
 * Requires bucket to exist and public read (or use signed URLs separately).
 */
export async function uploadPropertyMediaToSupabase(
  files: File[],
  kind: 'image' | 'video',
): Promise<string[]> {
  if (!files.length) return [];
  const supabase = getSupabaseBrowserClient();
  const folder = kind === 'image' ? 'images' : 'videos';
  const urls: string[] = [];

  for (const file of files) {
    const path = `${folder}/${crypto.randomUUID()}/${safeFileSegment(file.name)}`;
    const { data, error } = await supabase.storage.from(PROPERTIES_STORAGE_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });
    if (error) {
      throw new Error(error.message || 'Storage upload failed');
    }
    const { data: pub } = supabase.storage.from(PROPERTIES_STORAGE_BUCKET).getPublicUrl(data.path);
    urls.push(pub.publicUrl);
  }

  return urls;
}
