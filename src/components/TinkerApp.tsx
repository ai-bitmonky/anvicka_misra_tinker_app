"use client";
import { useEffect } from "react";
import { useTinker } from "@/lib/store";
import { useFx } from "@/lib/fx";
import { DeviceProvider, useDevice, type Device } from "@/lib/device";
import StartScreen from "./StartScreen";
import DesktopShell from "./DesktopShell";
import MobileShell from "./MobileShell";
import { CursorGlow, Toast } from "./Bits";

function Shell() {
  const device = useDevice();
  const phase = useTinker((s) => s.phase);
  const hydrated = useTinker((s) => s.hydrated);
  const rings = useFx((s) => s.rings);
  // Restore the saved project first, so nothing writes over it before it is read.
  useEffect(() => { void useTinker.persist.rehydrate(); }, []);
  useEffect(() => { useTinker.getState().setIsPhone(device === "mobile"); }, [device]);
  useEffect(() => { if (hydrated) document.documentElement.classList.remove("restoring"); }, [hydrated]);
  const work = hydrated && phase === "work";
  return (
    <>
      {work ? (device === "mobile" ? <MobileShell /> : <DesktopShell />) : <StartScreen />}
      {rings.map((r) => (
        <span key={r.id} style={{ display: "contents" }}>
          <div className="ring" style={{ left: r.x, top: r.y }} />
          <div className="ring fill" style={{ left: r.x, top: r.y }} />
        </span>
      ))}
      <Toast />
      <CursorGlow />
    </>
  );
}

export default function TinkerApp({ initialDevice }: { initialDevice: Device }) {
  return <DeviceProvider initialDevice={initialDevice}><Shell /></DeviceProvider>;
}
