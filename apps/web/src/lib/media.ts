/** Resolve upload paths returned by the API for use in img src */
export function mediaUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('/uploads')) return path;
  return path;
}
