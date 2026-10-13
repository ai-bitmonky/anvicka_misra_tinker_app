import { NAMES, ink, theme } from "./colors";
import { esc } from "./templates";
import type { FileKey, Files, Palette } from "./types";

/** Mutable working copy an action edits. */
export interface Ctx { files: Files; pal: Palette }
export interface Action { file: FileKey; plain: string; apply(ctx: Ctx): string }

export function setVar(ctx: Ctx, n: string, v: string): boolean {
  const re = new RegExp("(--" + n + ":\\s*)[^;]+;");
  if (!re.test(ctx.files.css.text)) return false;
  ctx.files.css.text = ctx.files.css.text.replace(re, "$1" + v + ";");
  return true;
}
export function getVar(ctx: Ctx, n: string): string | null {
  const m = ctx.files.css.text.match(new RegExp("--" + n + ":\\s*([^;]+);"));
  return m ? m[1].trim() : null;
}
export function applyTheme(ctx: Ctx): void {
  const t = theme(ctx.pal);
  setVar(ctx, "bg", t.bg); setVar(ctx, "surface", t.surface); setVar(ctx, "text", t.text);
}

/** Turns a plain-words request into one code change (or null if not understood). */
export function interpret(q: string, files: Files): Action | null {
  const l = q.toLowerCase();
  let m: RegExpMatchArray | null;
  const hex = l.match(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/);
  const name = Object.keys(NAMES).find((n) => new RegExp("\\b" + n + "\\b").test(l));
  if (hex || (name && !/\b(background|bg)\b/.test(l))) {
    const c = hex ? hex[0] : NAMES[name as string];
    const label = name || c;
    return { file: "css", plain: "The main colour (used on buttons and links) is now " + label + ".", apply(x) {
      x.pal.accent = c; setVar(x, "accent", c); setVar(x, "accent-text", ink(c));
      if (!x.pal.useImg) { x.pal.tint = c; applyTheme(x); }
      return "Changed the main colour to " + label + ".";
    } };
  }
  if (/\b(dark|night)\b/.test(l) && !/\bnot\b/.test(l)) return { file: "css", plain: "Dark pages use a near-black background and light text.", apply(x) { x.pal.mode = "dark"; applyTheme(x); return "Switched to a dark look."; } };
  if (/\b(light|bright|white)\b/.test(l)) return { file: "css", plain: "Light pages use a pale background and dark text.", apply(x) { x.pal.mode = "light"; applyTheme(x); return "Switched to a light look."; } };
  if (/\b(bigger|larger|increase|zoom)\b/.test(l) && /text|font|size|writing|letters/.test(l)) return { file: "css", plain: "Text size is one number at the top of the style file. Everything else scales from it.", apply(x) { const n = Math.min(22, parseInt(getVar(x, "size") || "16") + 2); setVar(x, "size", n + "px"); return "Made the text bigger (" + n + "px)."; } };
  if (/\b(smaller|decrease|reduce|shrink)\b/.test(l) && /text|font|size|writing|letters/.test(l)) return { file: "css", plain: "Text size is one number at the top of the style file.", apply(x) { const n = Math.max(12, parseInt(getVar(x, "size") || "16") - 2); setVar(x, "size", n + "px"); return "Made the text smaller (" + n + "px)."; } };
  if (/round|curv|soft/.test(l)) return { file: "css", plain: "“Radius” is how round the corners are. Bigger number, rounder corners.", apply(x) { const n = Math.min(40, parseInt(getVar(x, "radius") || "14") + 10); setVar(x, "radius", n + "px"); return "Rounded the corners (" + n + "px)."; } };
  if (/sharp|square|straight corner/.test(l)) return { file: "css", plain: "“Radius” is how round the corners are.", apply(x) { setVar(x, "radius", "4px"); return "Made the corners sharper."; } };
  if ((m = q.match(/(?:title|heading|headline|name)\s*(?:to|as|:|is)?\s*["“]?(.+?)["”]?$/i)) && m[1].length > 1) {
    const raw = m[1].trim();
    return { file: "html", plain: "The big heading lives in the h1 tags in the HTML file.", apply(x) {
      const t = esc(raw);
      x.files.html.text = x.files.html.text.replace(/(<h1>)[\s\S]*?(<\/h1>)/, "$1" + t + "$2").replace(/(<title>)[\s\S]*?(<\/title>)/, "$1" + t + "$2");
      return "Changed the title to “" + raw + "”.";
    } };
  }
  if ((m = q.match(/add (?:a |another )?(?:section|card|box)(?: about| for| called| on)?\s+(.+)$/i)) && files.html.text.includes("<!-- more cards go here -->")) {
    const raw = m[1].trim();
    return { file: "html", plain: "Each box is an “article” in the HTML file. I copied one and changed the words.", apply(x) {
      const t = esc(raw.replace(/^./, (c) => c.toUpperCase()));
      x.files.html.text = x.files.html.text.replace("<!-- more cards go here -->", '<article class="card"><h3>' + t + '</h3><p>Write something about this here.</p></article>\n        <!-- more cards go here -->');
      return "Added a new box called “" + raw + "”.";
    } };
  }
  return null;
}
