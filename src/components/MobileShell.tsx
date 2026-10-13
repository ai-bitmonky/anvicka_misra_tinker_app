"use client";
import { useRef } from "react";
import { useTinker, type MobileTab } from "@/lib/store";
import TopBar from "./TopBar";
import ChatPane from "./ChatPane";
import CodePane from "./CodePane";
import OutputPane from "./OutputPane";
import { ChatIc, CodeIc, EyeIc } from "./Icons";

const ORDER: MobileTab[] = ["chat", "code", "out"];
const TABS: { p: MobileTab; label: string; Ic: typeof ChatIc }[] = [
  { p: "chat", label: "Chat", Ic: ChatIc }, { p: "code", label: "Code", Ic: CodeIc }, { p: "out", label: "Output", Ic: EyeIc },
];

/** Native-app workspace: sliding panes, swipe between them, blurred tab bar. */
export default function MobileShell() {
  const tab = useTinker((s) => s.mobileTab);
  const dot = useTinker((s) => s.outDot);
  const setTab = useTinker((s) => s.setMobileTab);
  const sw = useRef({ x: 0, y: 0, ok: false });
  return (
    <div id="work">
      <TopBar />
      <div className="panes" id="panes" data-p={tab}
        onTouchStart={(e) => { const t = e.touches[0]; sw.current = { x: t.clientX, y: t.clientY, ok: !(e.target as Element).closest(".ed,.qchips,.tabs,input,textarea,.mdev") }; }}
        onTouchEnd={(e) => {
          if (!sw.current.ok) return;
          const t = e.changedTouches[0], dx = t.clientX - sw.current.x, dy = t.clientY - sw.current.y;
          if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
          const i = ORDER.indexOf(tab), j = Math.max(0, Math.min(2, i + (dx < 0 ? 1 : -1)));
          if (j !== i) setTab(ORDER[j]);
        }}>
        <ChatPane />
        <CodePane />
        <OutputPane />
      </div>
      <nav className="mtabs" aria-label="Sections" role="tablist">
        {TABS.map(({ p, label, Ic }) => (
          <button key={p} type="button" role="tab" data-p={p} aria-selected={tab === p} onClick={() => setTab(p)}>
            <span className="ic"><Ic /></span><span className="tl">{label}</span>
            {p === "out" && <span className={"dot" + (dot ? " on" : "")} />}
          </button>
        ))}
      </nav>
    </div>
  );
}
