export const isValidImageUrl = (url?: string | null) => {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  return !!trimmed && !trimmed.startsWith('blob:');
};

export const normalizeImageList = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((url) => (typeof url === 'string' ? url.trim() : ''))
    .filter((url) => isValidImageUrl(url));
};

export const pickPrimaryImage = (candidate?: string, gallery: string[] = []): string => {
  if (isValidImageUrl(candidate)) {
    return (candidate || '').trim();
  }
  const fallback = gallery.find((url) => isValidImageUrl(url));
  return fallback ? fallback.trim() : '';
};

