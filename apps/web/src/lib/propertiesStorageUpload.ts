import { getSupabaseBrowserClient } from './supabase-browser';

export const PROPERTIES_STORAGE_BUCKET = 'properties';

function safeFileSegment(name: string): string {
  const s = name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');
  return (s || 'file').slice(0, 200);
}

/**
 * Upload each file immediately to Storage `properties` and return public URLs.
 * Paths: `images/${Date.now()}-{i}-{safeName}` / `videos/...` so multi-select stays unique.
 */
export async function uploadListingFilesToPropertiesBucket(
  files: File[],
  kind: 'image' | 'video',
): Promise<string[]> {
  if (!files.length) return [];
  const supabase = getSupabaseBrowserClient();
  const folder = kind === 'image' ? 'images' : 'videos';
  const urls: string[] = [];
  const ts = Date.now();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const objectPath = `${folder}/${ts}-${i}-${safeFileSegment(file.name)}`;
    const { data, error } = await supabase.storage.from(PROPERTIES_STORAGE_BUCKET).upload(objectPath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });
    if (error) {
      throw new Error(error.message || 'Storage upload failed');
    }
    const { data: publicUrl } = supabase.storage.from(PROPERTIES_STORAGE_BUCKET).getPublicUrl(data.path);
    urls.push(publicUrl.publicUrl);
  }

  return urls;
}
