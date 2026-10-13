import type { Files, RefImage } from "./types";

/** Inlines style.css and script.js into index.html so the page runs as one document. */
export function renderPreview(files: Files, images: RefImage[]): string {
  let h = files.html.text;
  h = h.replace(/<link[^>]*href=["']style\.css["'][^>]*>/i, () => "<style>\n" + files.css.text + "\n</style>");
  h = h.replace(/<script[^>]*src=["']script\.js["'][^>]*><\/script>/i, () => "<script>\n" + files.js.text.replace(/<\/script/gi, "<\\/script") + "\n</script>");
  if (images[0]) h = h.split("reference.jpg").join(images[0].url);
  return h;
}
export const fileSlug = (name: string): string => (name.trim() || "my-project").replace(/[^\w-]+/g, "-").toLowerCase();
export function download(html: string, projectName: string): string {
  const slug = fileSlug(projectName);
  const blob = new Blob([html], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = slug + ".html";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  return slug;
}
