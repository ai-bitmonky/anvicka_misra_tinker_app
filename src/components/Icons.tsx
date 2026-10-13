import type { SVGProps } from "react";
type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size: number, sw: number, rest: SVGProps<SVGSVGElement>) => ({
  width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: sw,
  strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, ...rest,
});
export const ArrowRight = ({ size = 14, strokeWidth = 2, ...r }: P) => <svg {...base(size, Number(strokeWidth), r)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const Plus = ({ size = 16, ...r }: P) => <svg {...base(size, 1.8, r)}><path d="M12 5v14M5 12h14" /></svg>;
export const Chevron = ({ size = 22, ...r }: P) => <svg {...base(size, 2.4, r)}><path d="M15 5l-7 7 7 7" /></svg>;
export const DownloadIc = ({ size = 15, ...r }: P) => <svg {...base(size, 2, r)}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></svg>;
export const Mic = ({ size = 18, ...r }: P) => <svg {...base(size, 1.9, r)}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" /></svg>;
export const SendUp = ({ size = 16, ...r }: P) => <svg {...base(size, 2.2, r)}><path d="M12 19V5M6 11l6-6 6 6" /></svg>;
export const Info = ({ size = 15, ...r }: P) => <svg {...base(size, 1.8, r)}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>;
export const Monitor = ({ size = 14, ...r }: P) => <svg {...base(size, 1.8, r)}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>;
export const Phone = ({ size = 14, ...r }: P) => <svg {...base(size, 1.8, r)}><rect x="7" y="3" width="10" height="18" rx="2.5" /><path d="M11 18h2" /></svg>;
export const Refresh = ({ size = 15, ...r }: P) => <svg {...base(size, 1.9, r)}><path d="M20 11a8 8 0 1 0-2.3 5.7M20 5v6h-6" /></svg>;
export const Check = ({ size = 13, ...r }: P) => <svg {...base(size, 2.6, r)}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
export const ChatIc = ({ size = 17, ...r }: P) => <svg {...base(size, 1.8, r)}><path d="M5 18l-1 3 4-1.6A9 8 0 1 0 5 18z" /></svg>;
export const CodeIc = ({ size = 17, ...r }: P) => <svg {...base(size, 1.8, r)}><path d="M9 7l-5 5 5 5M15 7l5 5-5 5" /></svg>;
export const EyeIc = ({ size = 17, ...r }: P) => <svg {...base(size, 1.8, r)}><path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" /><circle cx="12" cy="12" r="2.8" /></svg>;
export const IdeaIcons = {
  Portfolio: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>,
  Todo: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 6l1.5 1.5L8 5M4 12l1.5 1.5L8 11M4 18l1.5 1.5L8 17M11 6h9M11 12h9M11 18h9" /></svg>,
  Calc: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="5" y="3" width="14" height="18" rx="2.5" /><path d="M8 7h8M8.5 12h.01M12 12h.01M15.5 12h.01M8.5 16h.01M12 16h.01M15.5 16h.01" /></svg>,
  Invite: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3c3.3 0 6 2.6 6 6 0 3.9-3.4 7-6 7s-6-3.1-6-7c0-3.4 2.7-6 6-6z" /><path d="M11 16l-.7 1.6h3.4L13 16M12 17.6c0 1.5-1.5 2-1.5 3.4" /></svg>,
};
