"use client";
import { useEffect, useRef, useState } from "react";
import { useTinker } from "@/lib/store";
import { useFx, reducedMotion } from "@/lib/fx";
import { useDevice } from "@/lib/device";
import { BuiltChip } from "./Bits";
import { Monitor, Phone, Refresh } from "./Icons";

function DeviceToggle() {
  const dev = useTinker((s) => s.previewDevice);
  const set = useTinker((s) => s.setPreviewDevice);
  return (
    <div className="devs" data-on={dev}>
      <button type="button" id="dDesk" aria-pressed={dev === "desktop"} aria-label="Desktop view" onClick={() => set("desktop")}><Monitor /><span>Desktop</span></button>
      <button type="button" id="dPhone" aria-pressed={dev === "phone"} aria-label="Phone view" onClick={() => set("phone")}><Phone /><span>Phone</span></button>
    </div>
  );
}

export default function OutputPane() {
  const device = useDevice();
  const preview = useTinker((s) => s.preview);
  const busy = useTinker((s) => s.busy);
  const pdev = useTinker((s) => s.previewDevice);
  const skel = useFx((s) => s.skel);
  const pvBlur = useFx((s) => s.pvBlur);
  const built = useFx((s) => s.built);
  const iframe = useRef<HTMLIFrameElement>(null);
  const last = useRef<string | null>(null);
  const [fx, setFx] = useState<"" | "reblur" | "quick">("");
  const [spin, setSpin] = useState(0);

  useEffect(() => {
    const el = iframe.current; if (!el) return;
    const was = last.current;
    el.srcdoc = preview;
    last.current = preview;
    if (was === null || was === preview || pvBlur || reducedMotion()) return;
    setFx("reblur");
    const r = requestAnimationFrame(() => requestAnimationFrame(() => setFx("quick")));
    const t = setTimeout(() => setFx(""), 300);
    return () => { cancelAnimationFrame(r); clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preview]);

  const refresh = () => {
    setSpin((n) => n + 1);
    const el = iframe.current; if (!el) return;
    el.srcdoc = "";
    requestAnimationFrame(() => { el.srcdoc = useTinker.getState().preview; });
  };
  const spinCls = spin ? (spin % 2 ? " spin" : " spin2") : "";
  const cls = [pvBlur ? "blur" : "", fx].filter(Boolean).join(" ") || undefined;

  return (
    <section className={"pane" + (busy ? " working" : "")} id="outPane" aria-label="Output">
      <div className="ph">
        <span className="lab">Output</span>
        <span className={"status" + (busy ? " busy" : "")}><i /><span>{busy ? "Updating" : "Live"}</span></span>
        {device === "desktop" && <DeviceToggle />}
        <button type="button" className={"ib" + spinCls} aria-label="Refresh preview" onClick={refresh}><Refresh /></button>
      </div>
      <div className={"frame" + (pdev === "phone" ? " phone" : "")}>
        <iframe ref={iframe} title="Live output" sandbox="allow-scripts" className={cls} />
        <div className={"skel" + (skel ? "" : " out")} aria-hidden="true">
          <b style={{ height: 14, width: "22%" }} /><b style={{ height: 44, width: "68%", marginTop: 18 }} /><b style={{ height: 14, width: "52%" }} />
          <b style={{ height: 40, width: 150, borderRadius: 12, marginTop: 6 }} /><b style={{ height: 120, width: "100%", marginTop: 22 }} /><b style={{ height: 120, width: "100%" }} />
        </div>
        <BuiltChip text={built.text} on={built.on} />
        {device === "mobile" && (
          <>
            <div className="mdev"><DeviceToggle /></div>
            <button type="button" className={"mrf" + spinCls} aria-label="Refresh preview" onClick={refresh}><Refresh /></button>
          </>
        )}
      </div>
    </section>
  );
}
