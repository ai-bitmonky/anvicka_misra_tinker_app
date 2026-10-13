export type FileKey = "html" | "css" | "js";
export interface CodeFile { name: string; lang: FileKey; text: string }
export type Files = Record<FileKey, CodeFile>;
export interface Palette { accent: string; tint: string; mode: "dark" | "light"; useImg: boolean }
export interface RefImage { url: string; name: string }
export interface Extracted { accent: string; tint: string; swatches: string[] }
export const FILE_ORDER: FileKey[] = ["html", "css", "js"];
export const DEFAULT_PAL: Palette = { accent: "#2b8cff", tint: "#2b8cff", mode: "dark", useImg: false };
