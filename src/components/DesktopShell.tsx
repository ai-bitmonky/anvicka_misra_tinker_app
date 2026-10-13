"use client";
import { useTinker } from "@/lib/store";
import TopBar from "./TopBar";
import ChatPane from "./ChatPane";
import CodePane from "./CodePane";
import OutputPane from "./OutputPane";

export default function DesktopShell() {
  const showCode = useTinker((s) => s.showCode);
  return (
    <div id="work">
      <TopBar />
      <div className={"panes" + (showCode ? "" : " nocode")} id="panes">
        <ChatPane />
        <CodePane />
        <OutputPane />
      </div>
    </div>
  );
}
