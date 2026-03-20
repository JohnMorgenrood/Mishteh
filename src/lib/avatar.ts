export function isUploadedProfileImage(image?: string | null) {
  if (!image) return false;
  return image.startsWith('/uploads/');
}

export function getAvatarInitial(name?: string | null) {
  return (name || 'S').trim().charAt(0).toUpperCase() || 'S';
}
