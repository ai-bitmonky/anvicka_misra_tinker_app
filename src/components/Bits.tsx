"use client";
import { useEffect, useRef, useState } from "react";
import { useTinker } from "@/lib/store";
import { STEPS, reducedMotion } from "@/lib/fx";
import { Check } from "./Icons";

export const Logo = ({ className }: { className?: string }) => <span className={"logo" + (className ? " " + className : "")}>T</span>;
export const Brand = () => <div className="brand"><Logo />Tinker</div>;

export function Switch({ id, checked, onChange, labelledBy }: { id: string; checked: boolean; onChange(v: boolean): void; labelledBy: string }) {
  return <button className="sw" id={id} type="button" role="switch" aria-checked={checked} aria-labelledby={labelledBy} onClick={() => onChange(!checked)} />;
}

/** Think → Read → Write → Run. `lit` = how many steps are on (or self-run with `gap`). */
export function StepTimeline({ lit, gap }: { lit?: number; gap?: number }) {
  const [self, setSelf] = useState(0);
  useEffect(() => {
    if (gap === undefined) return;
    const g = reducedMotion() ? 0 : gap;
    let i = 0;
    setSelf(1);
    const t = setInterval(() => { i++; setSelf(Math.min(4, i + 1)); if (i >= 3) clearInterval(t); }, g || 1);
    return () => clearInterval(t);
  }, [gap]);
  const on = lit ?? self;
  return (
    <div className="steps">
      {STEPS.map(([n, c], i) => (
        <span key={n} style={{ display: "contents" }}>
          {i > 0 && <span className={"ln" + (on > i ? " on" : "")} />}
          <span className={"st" + (on > i ? " on" : "")} style={{ ["--c" as string]: c }}><i />{n}</span>
        </span>
      ))}
    </div>
  );
}

export function Recap() {
  return (
    <div className="recap">
      {STEPS.map(([n, c]) => <i key={n} style={{ ["--c" as string]: c }} />)}
      <span>Thought · read · wrote · ran</span>
    </div>
  );
}

export function Toast() {
  const toast = useTinker((s) => s.toast);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!toast.n) return;
    setOn(true);
    const t = setTimeout(() => setOn(false), 2400);
    return () => clearTimeout(t);
  }, [toast.n]);
  return (
    <div className={"toast" + (on ? " on" : "")} role="status" aria-live="polite">
      <i><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></i>
      <span>{toast.text || "Your page is ready"}</span>
    </div>
  );
}

/** Soft light that follows the pointer on [data-glow] elements. */
export function CursorGlow() {
  useEffect(() => {
    const h = (e: PointerEvent) => {
      const g = (e.target as Element | null)?.closest?.("[data-glow]") as HTMLElement | null;
      if (!g) return;
      const r = g.getBoundingClientRect();
      g.style.setProperty("--mx", e.clientX - r.left + "px");
      g.style.setProperty("--my", e.clientY - r.top + "px");
    };
    document.addEventListener("pointermove", h, { passive: true });
    return () => document.removeEventListener("pointermove", h);
  }, []);
  return null;
}

export function BuiltChip({ text, on }: { text: string; on: boolean }) {
  return <div className={"built" + (on ? " on" : "")} aria-hidden="true"><Check /><span>{text}</span></div>;
}

/** Scrolls an element to the bottom whenever `dep` changes. */
export function useStickBottom<T extends HTMLElement>(dep: unknown) {
  const ref = useRef<T>(null);
  useEffect(() => { const el = ref.current; if (el) el.scrollTop = el.scrollHeight; }, [dep]);
  return ref;
}
