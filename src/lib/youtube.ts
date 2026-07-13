export function extractYouTubeId(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.hostname === 'youtu.be') return url.pathname.slice(1).split('/')[0] || null;
    if (url.hostname.endsWith('youtube.com')) {
      if (url.pathname === '/watch') return url.searchParams.get('v');
      const match = url.pathname.match(/^\/(?:shorts|embed)\/([^/?]+)/);
      return match?.[1] || null;
    }
  } catch {
    return /^[a-zA-Z0-9_-]{11}$/.test(value) ? value : null;
  }
  return null;
}
