"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTinker } from "@/lib/store";
import { useFx, reducedMotion, wait } from "@/lib/fx";
import { runBoot, cancelBoot } from "@/lib/boot";
import { useDevice } from "@/lib/device";
import { Brand, Switch } from "./Bits";
import { ArrowRight, IdeaIcons, Plus } from "./Icons";

const BASE_PH = "A birthday invitation for my sister Riya, with balloons and a bright pink look";
const EX = [BASE_PH, "A to-do list for my weekend chores", "A portfolio page for my wedding photography", "A simple calculator with big, friendly buttons"];
const IDEAS: { s: string; text: string; Ic: () => React.ReactElement }[] = [
  { s: "Portfolio", text: "A portfolio page for a photographer", Ic: IdeaIcons.Portfolio },
  { s: "To-do list", text: "A to-do list", Ic: IdeaIcons.Todo },
  { s: "Calculator", text: "A simple calculator", Ic: IdeaIcons.Calc },
  { s: "Invitation", text: "A birthday invitation", Ic: IdeaIcons.Invite },
];

export default function StartScreen() {
  const device = useDevice();
  const idea = useTinker((s) => s.idea);
  const setIdea = useTinker((s) => s.setIdea);
  const images = useTinker((s) => s.images);
  const beginner = useTinker((s) => s.beginner);
  const hasProject = useTinker((s) => s.messages.length > 0);
  const projectName = useTinker((s) => s.projectName);
  const igniting = useFx((s) => s.igniting);
  const ta = useRef<HTMLTextAreaElement>(null);
  const goRef = useRef<HTMLButtonElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [ph, setPh] = useState(BASE_PH);
  const phOn = useRef(true);
  const chipTok = useRef(0);
  const chipFull = useRef<string | null>(null);
  const [drag, setDrag] = useState(false);
  const disabled = !idea.trim() && !images.length;

  /* typing placeholder */
  useEffect(() => {
    if (reducedMotion()) return;
    let timer: ReturnType<typeof setTimeout>;
    const cycle = (i: number, c: number, dir: number) => {
      if (!phOn.current) return;
      if (useTinker.getState().phase !== "start" || ta.current?.value) { timer = setTimeout(() => cycle(i, c, dir), 600); return; }
      const s = EX[i];
      if (dir > 0) {
        c++; setPh(s.slice(0, c) + (c < s.length ? "▍" : ""));
        if (c >= s.length) { timer = setTimeout(() => cycle(i, c, -1), 2000); return; }
        timer = setTimeout(() => cycle(i, c, 1), 45);
      } else {
        c--; setPh(s.slice(0, Math.max(0, c)) + "▍");
        if (c <= 0) { timer = setTimeout(() => cycle((i + 1) % EX.length, 0, 1), 280); return; }
        timer = setTimeout(() => cycle(i, c, -1), 20);
      }
    };
    cycle(0, 0, 1);
    return () => clearTimeout(timer);
  }, []);
  const stopPh = () => { phOn.current = false; setPh(BASE_PH); };

  /* phone composer grows with its text */
  const grow = useCallback(() => {
    const el = ta.current; if (!el) return;
    if (device !== "mobile") { el.style.height = ""; return; }
    el.style.height = "0px";
    el.style.height = Math.max(44, Math.min(132, el.scrollHeight)) + "px";
  }, [device]);
  useEffect(() => { requestAnimationFrame(grow); }, [idea, grow]);

  const pickIdea = (full: string) => {
    if (reducedMotion()) { setIdea(full); ta.current?.focus(); return; }
    const tok = ++chipTok.current; chipFull.current = full; setIdea("");
    ta.current?.focus();
    let c = 0;
    const step = () => {
      if (tok !== chipTok.current) return;
      c += 2; setIdea(full.slice(0, c));
      if (c < full.length) setTimeout(step, 14); else chipFull.current = null;
    };
    step();
  };

  const go = async () => {
    let text = useTinker.getState().idea;
    if (chipFull.current) { chipTok.current++; text = chipFull.current; setIdea(text); chipFull.current = null; }
    if (!text.trim() && !useTinker.getState().images.length) return;
    stopPh();
    const t0 = performance.now();
    const rm = reducedMotion();
    const fx = useFx.getState();
    fx.set({ igniting: true });
    if (!rm && goRef.current) {
      const b = goRef.current.getBoundingClientRect();
      const id = Date.now();
      fx.set({ rings: [{ id, x: b.left + b.width - 24, y: b.top + b.height / 2 }] });
      setTimeout(() => useFx.setState((f) => ({ rings: f.rings.filter((r) => r.id !== id) })), 900);
    }
    await wait(rm ? 0 : 340);
    await useTinker.getState().start(text);
    useFx.getState().set({ igniting: false });
    runBoot("go", t0);
  };
  const blank = () => { stopPh(); cancelBoot(); useTinker.getState().blank(); runBoot("blank", performance.now()); };

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (useTinker.getState().phase === "start" && e.clipboardData?.files.length) useTinker.getState().addImages(e.clipboardData.files);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []);

  const dragOn = (e: React.DragEvent) => { e.preventDefault(); setDrag(true); };
  const dragOff = (e: React.DragEvent) => { e.preventDefault(); setDrag(false); };

  return (
    <main id="start" className={igniting ? "igniting" : undefined}>
      <div className="stop rise" style={{ ["--i" as string]: 0 }}>
        <Brand />
        <div className="alts">
          {hasProject && device === "desktop" && (
            <button type="button" className="alt cont" onClick={() => useTinker.getState().setPhaseWork()}>
              <span className="alt-a">Back to {projectName || "my project"}</span>
            </button>
          )}
          <button type="button" className="alt" id="blank" onClick={blank}>
            <span className="alt-q">Already have code?</span>
            <span className="alt-a">Open an empty project<ArrowRight /></span>
          </button>
        </div>
      </div>
      <section className="hero">
        <div className="rise" style={{ ["--i" as string]: 1 }}><span className="eyebrow"><i />No coding needed</span></div>
        <h1 className="rise" style={{ ["--i" as string]: 2 }}>What do you want to <em>build</em><span className="td"> today</span>?</h1>
        <p className="sub rise" style={{ ["--i" as string]: 3 }}>Describe it in your own words. Tinker writes the code, shows your page straight away, and lets you change anything by asking.</p>

        <div className="boxwrap rise" style={{ ["--i" as string]: 4 }}>
          <div className="halo" aria-hidden="true" />
          <div className={"box" + (drag ? " drag" : "")} id="box" data-glow
            onDragEnter={dragOn} onDragOver={dragOn} onDragLeave={dragOff}
            onDrop={(e) => { dragOff(e); useTinker.getState().addImages(e.dataTransfer.files); }}>
            <label htmlFor="idea" className="sr">Describe what you want to build</label>
            <textarea id="idea" ref={ta} placeholder={ph} rows={3} value={idea}
              onChange={(e) => { stopPh(); chipTok.current++; chipFull.current = null; setIdea(e.target.value); }}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void go(); } }} />
            <div className="thumbs" hidden={!images.length}>
              {images.map((im, i) => (
                <div className="thumb" key={im.url.slice(-24) + i}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={"Reference image " + (i + 1)} src={im.url} />
                  <button type="button" aria-label="Remove image" onClick={() => useTinker.getState().removeImage(i)}>×</button>
                </div>
              ))}
            </div>
            <div className="boxbar">
              <button type="button" className="ghost" id="addImg" onClick={() => fileRef.current?.click()}>
                <Plus /><span className="gl">Add a reference image</span><span className="gs">Image</span>
              </button>
              <span className="hint">Drop or paste a picture</span>
              <input type="file" ref={fileRef} accept="image/*" multiple hidden
                onChange={(e) => { if (e.target.files) useTinker.getState().addImages(e.target.files); e.target.value = ""; }} />
              <button type="button" className="go" id="goBtn" ref={goRef} disabled={disabled} onClick={() => void go()}>
                <span className="lbl">Start building</span>
                <span className="arr"><ArrowRight size={16} strokeWidth={2.2} /></span>
              </button>
            </div>
          </div>
        </div>

        <p className="sect rise" style={{ ["--i" as string]: 5 }}>Start from an idea</p>
        <div className="chips rise" id="examples" aria-label="Ideas to start from" style={{ ["--i" as string]: 5 }}>
          {IDEAS.map(({ s, text, Ic }) => (
            <button type="button" data-glow data-s={s} key={s} onClick={() => pickIdea(text)}><Ic />{text}</button>
          ))}
        </div>

        <div className="rise lvw" style={{ ["--i" as string]: 6 }}>
          <div className="level">
            <Switch id="newSw" checked={beginner} onChange={(v) => useTinker.getState().setBeginner(v)} labelledBy="newL" />
            <label id="newL" htmlFor="newSw">I&apos;m new to coding. Explain things in plain words.</label>
          </div>
        </div>
      </section>
      <p className="sect sect2 rise" style={{ ["--i" as string]: 7 }}>How it works</p>
      <div className="how rise" style={{ ["--i" as string]: 7 }}>
        <div><span className="n">01</span><b>Say it</b><span>Type what you want, or add a picture.</span></div>
        <div><span className="n">02</span><b>See it</b><span>Your page appears {device === "mobile" ? "in the Output tab" : "on the right"} straight away.</span></div>
        <div><span className="n">03</span><b>Change it</b><span>Ask in plain words, or edit the code yourself.</span></div>
      </div>
    </main>
  );
}
