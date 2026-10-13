"use client";
import { create } from "zustand";
import type { FileKey } from "./engine";

/** Short-lived animation state (never saved). Shared by both shells. */
interface Fx {
  igniting: boolean;
  rings: { id: number; x: number; y: number }[];
  chatBoot: number | null; chatSteps: number;
  typing: number | null; writingTab: FileKey | null; tabsEnter: number;
  skel: boolean; pvBlur: boolean; built: { text: string; on: boolean };
  set(p: Partial<Fx>): void;
}
export const useFx = create<Fx>()((set) => ({
  igniting: false, rings: [], chatBoot: null, chatSteps: 0, typing: null, writingTab: null, tabsEnter: 0,
  skel: false, pvBlur: false, built: { text: "Built in 1.2s", on: false },
  set: (p) => set(p),
}));
export const STEPS: [string, string][] = [["Think", "#DFA88F"], ["Read", "#9FBBE0"], ["Write", "#C0A8DD"], ["Run", "#9FC9A2"]];
export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
