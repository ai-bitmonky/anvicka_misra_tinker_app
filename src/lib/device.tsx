"use client";
import { createContext, useContext, useLayoutEffect, useState } from "react";

export type Device = "mobile" | "desktop";
export const PHONE_QUERY = "(max-width: 999.98px)";
const DeviceCtx = createContext<Device>("desktop");
export const useDevice = () => useContext(DeviceCtx);

/** Server guess (from the user agent) renders first; matchMedia wins after hydration and on every resize. */
export function DeviceProvider({ initialDevice, children }: { initialDevice: Device; children: React.ReactNode }) {
  const [device, setDevice] = useState<Device>(initialDevice);
  useLayoutEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY);
    const apply = () => setDevice(mq.matches ? "mobile" : "desktop");
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  useLayoutEffect(() => {
    const c = document.documentElement.classList;
    c.toggle("mob", device === "mobile");
    c.toggle("desk", device === "desktop");
    document.documentElement.dataset.device = device;
  }, [device]);
  return <DeviceCtx.Provider value={device}>{children}</DeviceCtx.Provider>;
}
