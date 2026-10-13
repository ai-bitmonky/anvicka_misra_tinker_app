"use client";
import { hl } from "./engine";
import { useFx, wait, reducedMotion } from "./fx";
import { useTinker } from "./store";

let tok = 0;
export const cancelBoot = () => { tok++; useFx.getState().set({ typing: null, writingTab: null, chatBoot: null, skel: false, pvBlur: false }); };

function revealPreview(chip: boolean, t0: number) {
  const fx = useFx.getState();
  fx.set({ skel: false });
  requestAnimationFrame(() => useFx.getState().set({ pvBlur: false }));
  if (chip) {
    const s = Math.max(0.4, (performance.now() - t0) / 1000);
    fx.set({ built: { text: "Built in " + s.toFixed(1) + "s", on: false } });
    setTimeout(() => useFx.setState((f) => ({ built: { ...f.built, on: true } })), 350);
    setTimeout(() => useFx.setState((f) => ({ built: { ...f.built, on: false } })), 2350);
  }
}

async function bootCode(my: number, t0: number) {
  const fx = useFx.getState();
  const f = useTinker.getState().files.html;
  const n = hl(f.lang, f.text).split("\n").length;
  fx.set({ tabsEnter: fx.tabsEnter + 1, skel: true, pvBlur: true, built: { ...fx.built, on: false }, writingTab: "html", typing: 0 });
  await wait(260);
  for (let i = 1; i <= n; i++) {
    if (my !== tok || useTinker.getState().active !== "html") break;
    useFx.getState().set({ typing: i });
    await wait(18);
  }
  if (my !== tok) return;
  useFx.getState().set({ writingTab: null, typing: null });
  revealPreview(true, t0);
}

async function bootChat(my: number, t0: number) {
  const rm = reducedMotion();
  const st = useTinker.getState();
  st.setBusy(true);
  const firstA = [...st.messages].reverse().find((m) => m.r === "a");
  useFx.getState().set({ chatBoot: firstA ? firstA.id : -1, chatSteps: 0 });
  for (let i = 1; i <= 4; i++) { if (my !== tok) return; useFx.getState().set({ chatSteps: i }); await wait(rm ? 0 : 250); }
  await wait(120);
  if (my !== tok) return;
  const s = useTinker.getState();
  if (firstA) s.patchMsg(firstA.id, { recap: true });
  useFx.getState().set({ chatBoot: null });
  s.setBusy(false);
  if (s.isPhone) {
    await wait(380);
    const now = useTinker.getState();
    if (my !== tok || now.phase !== "work" || !now.isPhone) return;
    now.setMobileTab("out");
    const b = useFx.getState().built.text.startsWith("Built in ") && !useFx.getState().skel
      ? useFx.getState().built.text.replace("Built in ", "")
      : Math.max(0.4, (performance.now() - t0) / 1000).toFixed(1) + "s";
    now.showToast("Your page is ready · " + b);
  }
}

/** Plays the workspace entrance after Start or "Open an empty project". */
export function runBoot(mode: "go" | "blank", t0: number) {
  const my = ++tok;
  if (mode === "blank" || reducedMotion()) {
    useFx.getState().set({ typing: null, writingTab: null });
    revealPreview(false, t0);
    if (mode === "go") void bootChat(my, t0);
    return;
  }
  void bootCode(my, t0);
  void bootChat(my, t0);
}
