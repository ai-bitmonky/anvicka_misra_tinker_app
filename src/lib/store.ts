"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  DEFAULT_PAL, blankFiles, buildProject, clean, download, esc, extract, fileSlug, interpret, renderPreview,
  type FileKey, type Files, type Palette, type RefImage,
} from "./engine";

export type Phase = "start" | "work";
export type MobileTab = "chat" | "code" | "out";
export type BootMode = "go" | "blank" | null;

export type Msg =
  | { id: number; r: "u"; text: string; img?: string }
  | { id: number; r: "a"; k: "html"; html: string; recap?: boolean }
  | { id: number; r: "a"; k: "think" }
  | { id: number; r: "a"; k: "boot" }
  | { id: number; r: "a"; k: "change"; msg: string; plain: string | null; before: string; undone: boolean };

interface Persisted {
  files: Files; active: FileKey; pal: Palette; images: RefImage[]; beginner: boolean; projectName: string;
  messages: Msg[]; phase: Phase; showCode: boolean; previewDevice: "desktop" | "phone"; tipHidden: boolean;
}
interface Ui {
  hydrated: boolean; idea: string; preview: string; busy: boolean; mobileTab: MobileTab; outDot: boolean;
  toast: { text: string; n: number }; bootMode: BootMode; bootTok: number; t0: number; writingTok: number;
  isPhone: boolean;
}
interface Actions {
  setIdea(v: string): void; setBeginner(v: boolean): void; addImages(list: FileList | File[]): void; removeImage(i: number): void;
  start(text: string): Promise<void>; blank(): void; home(): void; setPhaseWork(): void;
  setActive(k: FileKey): void; setFileText(k: FileKey, text: string): void; refreshPreview(): void;
  reply(q: string): void; undo(id: number): void; download(): void;
  setProjectName(v: string): void; setShowCode(v: boolean): void; setTipHidden(v: boolean): void;
  setPreviewDevice(v: "desktop" | "phone"): void; setMobileTab(t: MobileTab): void; setOutDot(v: boolean): void;
  showToast(text: string): void; setBusy(v: boolean): void; setIsPhone(v: boolean): void; patchMsg(id: number, m: { recap?: boolean } | null, replace?: Msg): void;
}
export type State = Persisted & Ui & Actions;

let nextId = Date.now();
const nid = () => ++nextId;
let previewTimer: ReturnType<typeof setTimeout> | undefined;
const clone = <X,>(x: X): X => JSON.parse(JSON.stringify(x)) as X;
const snap = (files: Files, pal: Palette) =>
  JSON.stringify({ f: { html: files.html.text, css: files.css.text, js: files.js.text }, p: pal });

const initialFiles = blankFiles(DEFAULT_PAL);

export const useTinker = create<State>()(
  persist(
    (set, get) => ({
      files: initialFiles, active: "html", pal: { ...DEFAULT_PAL }, images: [], beginner: true, projectName: "My project",
      messages: [], phase: "start", showCode: true, previewDevice: "desktop", tipHidden: false,
      hydrated: false, idea: "", preview: "", busy: false, mobileTab: "chat", outDot: false, toast: { text: "", n: 0 },
      bootMode: null, bootTok: 0, t0: 0, writingTok: 0, isPhone: false,

      setIdea: (v) => set({ idea: v }),
      setBeginner: (v) => set({ beginner: v }),
      addImages: (list) => {
        const room = 3 - get().images.length;
        [...list].filter((f) => f.type.startsWith("image/")).slice(0, Math.max(0, room)).forEach((f) => {
          const r = new FileReader();
          r.onload = () => set((s) => (s.images.length >= 3 ? s : { images: [...s.images, { url: String(r.result), name: f.name }] }));
          r.readAsDataURL(f);
        });
      },
      removeImage: (i) => set((s) => ({ images: s.images.filter((_, j) => j !== i) })),

      start: async (raw) => {
        const s = get();
        const text = raw.trim() || "A page inspired by my picture";
        const pal: Palette = { ...DEFAULT_PAL, mode: /\blight\b|white|pastel|bright/i.test(text) ? "light" : "dark" };
        let sw: string[] | null = null;
        if (s.images[0]) {
          const r = await extract(s.images[0].url);
          if (r) { pal.accent = r.accent; pal.tint = r.tint; pal.useImg = true; sw = r.swatches; }
        }
        const files = buildProject(text, s.images.length > 0, pal);
        let h = "<p>Here's your first version. It's on the right.</p>";
        if (sw) h += '<p>I took the colours from your picture:</p><div class="swatches">' + sw.map((c) => '<i style="background:' + c + '" title="' + c + '"></i>').join("") + "</div>";
        else h += "<p>Tip: next time, add a reference image and I'll match its colours and mood.</p>";
        h += "<p>Tell me what to change, like <b>make it dark</b> or <b>change the title to Riya's 10th</b>. You can also edit the code in the middle.</p>";
        set({
          pal, files, active: "html", projectName: clean(text).slice(0, 28), phase: "work", tipHidden: !s.beginner,
          messages: [{ id: nid(), r: "u", text, img: s.images[0]?.url }, { id: nid(), r: "a", k: "html", html: h }],
          preview: renderPreview(files, s.images), mobileTab: "chat", outDot: false, busy: false,
          bootMode: "go", bootTok: s.bootTok + 1,
        });
      },
      blank: () => {
        const pal = { ...DEFAULT_PAL };
        const files = blankFiles(pal);
        set((s) => ({
          pal, images: [], files, active: "html", projectName: "Untitled", phase: "work", tipHidden: !s.beginner,
          messages: [{ id: nid(), r: "a", k: "html", html: "<p>Empty project ready. Type in the editor and the output updates. Not sure what to write? Ask me, for example <b>make it dark</b>.</p>" }],
          preview: renderPreview(files, []), mobileTab: "chat", outDot: false, busy: false,
          bootMode: "blank", bootTok: s.bootTok + 1, t0: performance.now(),
        }));
      },
      home: () => set({ phase: "start", bootMode: null }),
      setPhaseWork: () => { set({ phase: "work" }); get().refreshPreview(); },
      setActive: (k) => set({ active: k }),
      setFileText: (k, text) => {
        set((s) => ({ files: { ...s.files, [k]: { ...s.files[k], text } } }));
        clearTimeout(previewTimer);
        previewTimer = setTimeout(() => get().refreshPreview(), 350);
      },
      refreshPreview: () => {
        const s = get();
        const html = renderPreview(s.files, s.images);
        if (html === s.preview) return;
        set({ preview: html, outDot: s.isPhone && s.mobileTab !== "out" && s.phase === "work" ? true : s.outDot });
      },

      reply: (q) => {
        const thinkId = nid();
        set((s) => ({ messages: [...s.messages, { id: nid(), r: "u", text: q }, { id: thinkId, r: "a", k: "think" }], busy: true }));
        setTimeout(() => {
          const s = get();
          const act = interpret(q, s.files);
          if (!act) {
            s.patchMsg(thinkId, null, { id: thinkId, r: "a", k: "html", html: "<p>I can change colours, the title, text size, corners, and dark or light. I can also add a box, for example “add a section about pricing”. Or edit the code yourself.</p>" });
            set({ busy: false });
            return;
          }
          const before = snap(s.files, s.pal);
          const ctx = { files: clone(s.files), pal: clone(s.pal) };
          const msg = act.apply(ctx);
          set({ files: ctx.files, pal: ctx.pal, active: act.file, busy: false, writingTok: s.writingTok + 1 });
          s.patchMsg(thinkId, null, { id: thinkId, r: "a", k: "change", msg, plain: s.beginner ? act.plain : null, before, undone: false });
          get().refreshPreview();
        }, 650);
      },
      undo: (id) => {
        const s = get();
        const m = s.messages.find((x) => x.id === id);
        if (!m || m.r !== "a" || m.k !== "change" || m.undone) return;
        const o = JSON.parse(m.before) as { f: Record<FileKey, string>; p: Palette };
        const files = clone(s.files);
        (Object.keys(o.f) as FileKey[]).forEach((k) => { files[k].text = o.f[k]; });
        set({ files, pal: o.p, messages: s.messages.map((x) => (x.id === id ? { ...m, undone: true } : x)) });
        get().refreshPreview();
      },
      download: () => {
        const s = get();
        const html = renderPreview(s.files, s.images);
        set({ preview: html });
        download(html, s.projectName);
        set((st) => ({ messages: [...st.messages, { id: nid(), r: "a", k: "html", html: "<p>Downloaded. It is one file you can open in any browser or send to a friend.</p>" }] }));
        s.showToast("Downloaded " + fileSlug(s.projectName) + ".html");
      },

      setProjectName: (v) => set({ projectName: v }),
      setShowCode: (v) => set({ showCode: v }),
      setTipHidden: (v) => set({ tipHidden: v }),
      setPreviewDevice: (v) => set({ previewDevice: v }),
      setMobileTab: (t) => {
        set({ mobileTab: t });
        if (t === "out") { get().refreshPreview(); set({ outDot: false }); }
      },
      setOutDot: (v) => set({ outDot: v }),
      showToast: (text) => set((s) => ({ toast: { text, n: s.toast.n + 1 } })),
      setBusy: (v) => set({ busy: v }),
      setIsPhone: (v) => set({ isPhone: v }),
      patchMsg: (id, m, replace) => set((s) => ({
        messages: s.messages.map((x) => (x.id === id ? (replace ?? ({ ...x, ...m } as Msg)) : x)),
      })),
    }),
    {
      name: "tinker:v1",
      version: 1,
      skipHydration: true,
      storage: createJSONStorage(() => ({
        getItem: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
        setItem: (k, v) => {
          try { localStorage.setItem(k, v); } catch {
            // quota: drop pictures (they can be large) and try once more
            try {
              const o = JSON.parse(v) as { state: Persisted };
              o.state.images = [];
              o.state.messages = o.state.messages.map((m) => (m.r === "u" ? { ...m, img: undefined } : m));
              localStorage.setItem(k, JSON.stringify(o));
            } catch { /* storage unavailable: app still works for this visit */ }
          }
        },
        removeItem: (k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } },
      })),
      partialize: (s): Persisted => ({
        files: s.files, active: s.active, pal: s.pal, images: s.images, beginner: s.beginner, projectName: s.projectName,
        messages: s.messages.filter((m) => !(m.r === "a" && (m.k === "think" || m.k === "boot"))),
        phase: s.phase, showCode: s.showCode, previewDevice: s.previewDevice, tipHidden: s.tipHidden,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) useTinker.setState({ hydrated: true, preview: renderPreview(state.files, state.images) });
        else useTinker.setState({ hydrated: true });
      },
    },
  ),
);

/** Phone wording: no "right" / "middle" panes on a phone. */
export function phoneWording(h: string): string {
  return h.replace("It's on the right.", "Tap <b>Output</b> to see it.")
    .replace("edit the code in the middle", "edit the code in the <b>Code</b> tab")
    .replace("Type in the editor and the output updates.", "Type in the <b>Code</b> tab and the <b>Output</b> tab updates.");
}
export { esc };
