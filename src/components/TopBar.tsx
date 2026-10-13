"use client";
import { useTinker } from "@/lib/store";
import { cancelBoot } from "@/lib/boot";
import { useFx } from "@/lib/fx";
import { useDevice } from "@/lib/device";
import { Logo, Switch } from "./Bits";
import { Chevron, DownloadIc } from "./Icons";

export default function TopBar() {
  const device = useDevice();
  const name = useTinker((s) => s.projectName);
  const showCode = useTinker((s) => s.showCode);
  const goHome = () => { cancelBoot(); useFx.getState().set({ igniting: false }); useTinker.getState().home(); };
  return (
    <header className="top">
      <button className="brand" id="home" type="button" aria-label="Back to start" onClick={goHome}>
        <Chevron className="chev" /><Logo /><span className="bt">Tinker</span>
      </button>
      <span className="slash" aria-hidden="true">/</span>
      <input className="pname" value={name} aria-label="Project name" spellCheck={false}
        onChange={(e) => useTinker.getState().setProjectName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }} />
      {device === "desktop" && <span className="saved" title="Saved in this browser"><i />Saved</span>}
      <div className="spacer" />
      <div className="tog hide-m">
        <label htmlFor="codeSw" id="codeL">Show code</label>
        <Switch id="codeSw" checked={showCode} onChange={(v) => useTinker.getState().setShowCode(v)} labelledBy="codeL" />
      </div>
      <span className="vsep" aria-hidden="true" />
      <button className="dl" type="button" aria-label="Download" onClick={() => useTinker.getState().download()}>
        <DownloadIc /><span>Download</span>
      </button>
    </header>
  );
}
