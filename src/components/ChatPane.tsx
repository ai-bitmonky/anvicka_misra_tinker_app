"use client";
import { useState } from "react";
import { useTinker, phoneWording, type Msg } from "@/lib/store";
import { useFx } from "@/lib/fx";
import { useDevice } from "@/lib/device";
import { Recap, StepTimeline, useStickBottom } from "./Bits";
import { Mic, SendUp } from "./Icons";

const QUICK = ["make it dark", "change the colour to purple", "make the text bigger", "round the corners"];

function Think({ text, gap, lit }: { text: string; gap?: number; lit?: number }) {
  return (
    <>
      <div className="think"><span className="spin" /><span className="shim">{text}</span></div>
      {lit !== undefined ? <div className="flow"><StepTimeline lit={lit} /></div> : <StepTimeline gap={gap} />}
    </>
  );
}

function Message({ m }: { m: Msg }) {
  const device = useDevice();
  const bootId = useFx((s) => s.chatBoot);
  const steps = useFx((s) => s.chatSteps);
  const undo = useTinker((s) => s.undo);
  if (m.r === "u") {
    return (
      <div className="u">
        {m.text}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {m.img && <img src={m.img} alt="" />}
      </div>
    );
  }
  if (m.k === "html") {
    if (bootId === m.id) return <div className="a"><Think text="Building your first version…" lit={steps} /></div>;
    const html = device === "mobile" ? phoneWording(m.html) : m.html;
    return (
      <div className="a">
        {m.recap && <Recap />}
        <div dangerouslySetInnerHTML={{ __html: html }} style={{ display: "contents" }} />
      </div>
    );
  }
  if (m.k === "think") return <div className="a"><Think text="Thinking…" gap={150} /></div>;
  if (m.k === "boot") return null;
  return (
    <div className="a">
      <div className="changed">
        <span>{m.msg}</span>
        <button className="undo" type="button" disabled={m.undone} onClick={() => undo(m.id)}>{m.undone ? "Undone" : "Undo"}</button>
      </div>
      {m.plain && <div className="plain"><b>In plain words:</b> {m.plain}</div>}
    </div>
  );
}

export default function ChatPane() {
  const messages = useTinker((s) => s.messages);
  const busy = useTinker((s) => s.busy);
  const reply = useTinker((s) => s.reply);
  const steps = useFx((s) => s.chatSteps);
  const [q, setQ] = useState("");
  const [mic, setMic] = useState(false);
  const ref = useStickBottom<HTMLDivElement>(messages.length + ":" + steps + ":" + JSON.stringify(messages[messages.length - 1] ?? null).length);

  const listen = () => {
    type SR = { lang: string; interimResults: boolean; start(): void; onresult: (e: { results: { 0: { 0: { transcript: string } } } }) => void; onend: () => void; onerror: () => void };
    const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    const toast = useTinker.getState().showToast;
    if (!Ctor) { toast("Voice isn't available here. Type instead."); document.getElementById("q")?.focus(); return; }
    const r = new Ctor(); r.lang = "en-US"; r.interimResults = false; setMic(true);
    r.onresult = (e) => { setQ(e.results[0][0].transcript); document.getElementById("q")?.focus(); };
    r.onend = () => setMic(false);
    r.onerror = () => { setMic(false); toast("Couldn't hear that. Try again."); };
    try { r.start(); } catch { setMic(false); }
  };

  return (
    <section className="pane" id="chatPane" aria-label="Chat with Tinker">
      <div className="ph"><span className="lab">Chat</span><span className={"status" + (busy ? " busy" : "")}><i /><span>{busy ? "Working" : "Ready"}</span></span></div>
      <div className="msgs" ref={ref} aria-live="polite">
        {messages.map((m) => <Message key={m.id} m={m} />)}
      </div>
      <div className="qchips">
        {QUICK.map((t) => <button type="button" key={t} onClick={() => reply(t)}>{t}</button>)}
      </div>
      <form className="inp" onSubmit={(e) => { e.preventDefault(); const v = q.trim(); if (v) { setQ(""); reply(v); } }}>
        <button type="button" className={"mic" + (mic ? " on" : "")} aria-label="Speak your change" onClick={listen}><Mic /></button>
        <input id="q" autoComplete="off" placeholder="What should I change?" aria-label="Message Tinker" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="submit" aria-label="Send"><SendUp /></button>
      </form>
    </section>
  );
}
