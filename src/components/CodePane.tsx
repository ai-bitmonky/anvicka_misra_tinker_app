"use client";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useTinker } from "@/lib/store";
import { useFx } from "@/lib/fx";
import { FILE_ORDER, hl } from "@/lib/engine";
import { Info } from "./Icons";

const LH = 13 * 1.65;

export default function CodePane() {
  const files = useTinker((s) => s.files);
  const active = useTinker((s) => s.active);
  const setActive = useTinker((s) => s.setActive);
  const setFileText = useTinker((s) => s.setFileText);
  const tipHidden = useTinker((s) => s.tipHidden);
  const writingTok = useTinker((s) => s.writingTok);
  const typing = useFx((s) => s.typing);
  const writingTab = useFx((s) => s.writingTab);
  const tabsEnter = useFx((s) => s.tabsEnter);
  const [flash, setFlash] = useState(false);
  const [enter, setEnter] = useState(false);
  const [focus, setFocus] = useState(false);
  const [line, setLine] = useState(0);
  const ta = useRef<HTMLTextAreaElement>(null);
  const ed = useRef<HTMLDivElement>(null);
  const pendingSel = useRef<number | null>(null);
  const f = files[active];

  const lines = useMemo(() => hl(f.lang, f.text).split("\n"), [f.lang, f.text]);
  const typingNow = typing !== null && active === "html";
  const shown = typingNow ? Math.min(typing as number, lines.length) : lines.length;
  const preHtml = typingNow ? lines.slice(0, shown).join("\n") + '<span class="caret"></span>\n ' : lines.join("\n") + "\n ";
  const gutter = useMemo(() => { let g = ""; for (let i = 1; i <= shown; i++) g += i + "\n"; return g + (typingNow ? "" : " "); }, [shown, typingNow]);

  useEffect(() => { if (!writingTok) return; setFlash(true); const t = setTimeout(() => setFlash(false), 600); return () => clearTimeout(t); }, [writingTok]);
  useEffect(() => { if (!tabsEnter) return; setEnter(true); const t = setTimeout(() => setEnter(false), 700); return () => clearTimeout(t); }, [tabsEnter]);
  useLayoutEffect(() => {
    if (!ed.current) return;
    if (typingNow) ed.current.scrollTop = ed.current.scrollHeight;
  }, [shown, typingNow]);
  const wasTyping = useRef(false);
  useLayoutEffect(() => { if (wasTyping.current && !typingNow && ed.current) ed.current.scrollTop = 0; wasTyping.current = typingNow; }, [typingNow]);
  useLayoutEffect(() => {
    if (pendingSel.current !== null && ta.current) { ta.current.selectionStart = ta.current.selectionEnd = pendingSel.current; pendingSel.current = null; moveCl(); }
  });
  const moveCl = () => { const t = ta.current; if (!t) return; setLine(t.value.slice(0, t.selectionStart || 0).split("\n").length - 1); };

  return (
    <section className="pane" id="codePane" aria-label="Code editor">
      <div className="ph">
        <span className="lab">Code</span>
        <div className={"tabs" + (enter ? " enter" : "")} role="tablist">
          {FILE_ORDER.map((k) => (
            <button key={k} type="button" role="tab" aria-selected={k === active}
              className={writingTab === k || (flash && k === active) ? "writing" : undefined}
              onClick={() => setActive(k)}>{files[k].name}</button>
          ))}
        </div>
        <span className="meta">{f.lang.toUpperCase()} · {f.text.split("\n").length} lines</span>
      </div>
      {!tipHidden && (
        <div className="tip">
          <Info />
          <span>You don&apos;t have to read this. It&apos;s the recipe for your page. Change anything you like, and the output updates.</span>
          <button type="button" aria-label="Hide tip" onClick={() => useTinker.getState().setTipHidden(true)}>×</button>
        </div>
      )}
      <div className={"ed" + (focus ? " focus" : "")} ref={ed}>
        <div className="cl" aria-hidden="true" style={{ transform: `translateY(${line * LH}px)` }} />
        <div className="gut">{gutter}</div>
        <div className="stack">
          <pre aria-hidden="true" dangerouslySetInnerHTML={{ __html: preHtml }} />
          <textarea ref={ta} spellCheck={false} autoCapitalize="off" autoComplete="off" aria-label="Code" value={f.text}
            onChange={(e) => { setFileText(active, e.target.value); moveCl(); }}
            onKeyDown={(e) => {
              if (e.key !== "Tab") return;
              e.preventDefault();
              const t = e.currentTarget, s = t.selectionStart, en = t.selectionEnd;
              pendingSel.current = s + 2;
              setFileText(active, t.value.slice(0, s) + "  " + t.value.slice(en));
            }}
            onKeyUp={moveCl} onClick={moveCl} onSelect={moveCl}
            onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} />
        </div>
      </div>
    </section>
  );
}
