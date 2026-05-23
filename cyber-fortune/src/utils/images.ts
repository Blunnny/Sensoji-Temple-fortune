export function resolveImage(path: string): string {
  if (!path) return "";

  if (path.startsWith("./picture_front/")) {
    return `/picture_front/${path.substring("./picture_front/".length)}`;
  }

  if (path.startsWith("./picture_back/")) {
    return `/picture_back/${path.substring("./picture_back/".length)}`;
  }

  try {
    return new URL(path, import.meta.url).href;
  } catch {
    return path;
  }
}
