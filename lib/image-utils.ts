/**
 * Check if an image URL should be unoptimized
 * Images from /uploads/ or /api/uploads/ should be unoptimized
 * to avoid Next.js image optimization issues with dynamically uploaded files
 */
export function shouldUnoptimizeImage(url: string | undefined | null): boolean {
  if (!url) return false
  return url.startsWith('/uploads/') || url.startsWith('/api/uploads/')
}




