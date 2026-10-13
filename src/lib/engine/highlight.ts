import { esc } from "./templates";
import type { FileKey } from "./types";

/** Syntax colouring — returns HTML with span classes k/s/c/n/p/at. */
export function hl(lang: FileKey, src: string): string {
  return src.split("\n").map((line) => {
    const e = esc(line);
    if (lang === "html") {
      return e.replace(/(&lt;!--.*?--&gt;)|(&lt;\/?[\w-]+|\/?&gt;)|("[^"]*")|(\s[\w:-]+(?==))/g, (m, c, t, s, a) =>
        c ? '<span class="c">' + c + "</span>" : t ? '<span class="k">' + t + "</span>" : s ? '<span class="s">' + s + "</span>" : '<span class="at">' + a + "</span>");
    }
    if (lang === "css") {
      if (/^\s*\/\*/.test(e)) return '<span class="c">' + e + "</span>";
      if (/^[^:;{}]*\{\s*$/.test(e) || (/^[^{}]*\{.*\}\s*$/.test(e) && !/^\s*[\w-]+\s*:/.test(e))) {
        return e.replace(/^([^{]*)(\{)(.*)$/, (m, a, b, c: string) =>
          '<span class="p">' + a + "</span>" + b + c.replace(/([\w-]+)(\s*:)/g, '<span class="k">$1</span>$2').replace(/(#[0-9a-fA-F]{3,8}\b)/g, '<span class="n">$1</span>'));
      }
      return e.replace(/(\/\*.*?\*\/)|("[^"]*")|(--[\w-]+|^\s*[\w-]+(?=\s*:))|(#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|fr)?\b)/g, (m, c, s, k, n) =>
        c ? '<span class="c">' + c + "</span>" : s ? '<span class="s">' + s + "</span>" : k ? '<span class="k">' + k + "</span>" : '<span class="n">' + n + "</span>");
    }
    return e.replace(/(\/\/.*$)|("[^"]*"|'[^']*')|\b(var|let|const|function|return|if|else|for|new|true|false|null|this)\b|\b(\d+(?:\.\d+)?)\b/g, (m, c, s, k, n) =>
      c ? '<span class="c">' + c + "</span>" : s ? '<span class="s">' + s + "</span>" : k ? '<span class="k">' + k + "</span>" : '<span class="n">' + n + "</span>");
  }).join("\n");
}
