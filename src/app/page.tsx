import { headers } from "next/headers";
import TinkerApp from "@/components/TinkerApp";

export default async function Page() {
  const h = await headers();
  const initialDevice = h.get("x-device") === "mobile" ? "mobile" : "desktop";
  return <TinkerApp initialDevice={initialDevice} />;
}
