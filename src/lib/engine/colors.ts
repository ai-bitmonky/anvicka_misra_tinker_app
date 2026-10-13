import type { Extracted, Palette } from "./types";

export type RGB = [number, number, number];
export const h2r = (h: string): RGB => {
  h = h.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
export const r2h = ([r, g, b]: number[]): string =>
  "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
export const mix = (a: string, b: string, t: number): string => {
  const x = h2r(a), y = h2r(b);
  return r2h(x.map((v, i) => v * (1 - t) + y[i] * t));
};
export const lum = (h: string): number => {
  const [r, g, b] = h2r(h).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const ink = (h: string): string => (lum(h) > 0.45 ? "#111111" : "#ffffff");
export const NAMES: Record<string, string> = {
  red: "#e5484d", blue: "#2b8cff", green: "#30a46c", purple: "#8e4ec6", violet: "#6e56cf", orange: "#f76b15",
  pink: "#e93d82", teal: "#12a594", yellow: "#f5c518", black: "#111111", gold: "#d4a017", navy: "#1e3a8a",
};
export function theme(p: Palette): { bg: string; surface: string; text: string } {
  if (p.mode === "dark") return { bg: mix(p.tint, "#000000", 0.88), surface: mix(p.tint, "#000000", 0.76), text: "#f3f3f5" };
  return { bg: mix(p.tint, "#ffffff", 0.93), surface: "#ffffff", text: "#1c1c1f" };
}

/** Reads the main colours of a picture (browser only). */
export function extract(url: string): Promise<Extracted | null> {
  return new Promise((res) => {
    const im = new Image();
    im.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = 40;
      const x = c.getContext("2d");
      if (!x) return res(null);
      x.drawImage(im, 0, 0, 40, 40);
      const d = x.getImageData(0, 0, 40, 40).data;
      const B: Record<string, { c: number; r: number; g: number; b: number }> = {};
      let ar = 0, ag = 0, ab = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        ar += r; ag += g; ab += b; n++;
        const k = (r >> 5) + "," + (g >> 5) + "," + (b >> 5);
        const o = (B[k] = B[k] || { c: 0, r: 0, g: 0, b: 0 });
        o.c++; o.r += r; o.g += g; o.b += b;
      }
      const arr = Object.values(B).map((o) => {
        const col = r2h([o.r / o.c, o.g / o.c, o.b / o.c]);
        const mx = Math.max(o.r, o.g, o.b) / o.c, mn = Math.min(o.r, o.g, o.b) / o.c;
        const sat = (mx - mn) / (mx || 1);
        return { col, c: o.c, sat, l: lum(col) };
      });
      const ok = arr.filter((o) => o.l > 0.06 && o.l < 0.85);
      ok.sort((a, b) => b.c * (b.sat * b.sat + 0.02) - a.c * (a.sat * a.sat + 0.02));
      const accent = (ok[0] || arr[0]).col;
      const sw: string[] = [];
      for (const o of ok) {
        if (sw.every((s) => Math.abs(lum(s) - lum(o.col)) + Math.abs(h2r(s)[0] - h2r(o.col)[0]) / 255 > 0.25)) sw.push(o.col);
        if (sw.length >= 4) break;
      }
      res({ accent, tint: r2h([ar / n, ag / n, ab / n]), swatches: sw.length ? sw : [accent] });
    };
    im.onerror = () => res(null);
    im.src = url;
  });
}
