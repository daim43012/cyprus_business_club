export function photoSrc(photo?: string | null) {
  if (!photo) return null;

  if (photo.startsWith("http://") || photo.startsWith("https://")) {
    return photo;
  }

  const file = photo.split("/").pop();
  if (!file) return null;

  return `/api/photo/${encodeURIComponent(file)}`;
}
