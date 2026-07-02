import { NavLink } from "react-router";

export default function AprenticLogo({ to }) {
  return (
    <NavLink to={to} className="group flex shrink-0 flex-col items-center gap-1.5" aria-label="AprenTIC, inicio">
      <span className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[15px] border border-white/10 bg-gradient-to-br from-[#ff4b4e] via-[#e72e32] to-[#c91f25] shadow-[0_10px_28px_rgba(232,43,47,0.3)] transition group-hover:-translate-y-0.5 group-hover:shadow-[0_14px_34px_rgba(232,43,47,0.4)]">
        <span className="absolute inset-x-1 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 7-5 5 5 5M15 7l5 5-5 5" />
        </svg>
      </span>
      <span className="profesor-brand-text text-sm font-black tracking-[-0.035em] text-white">AprenTIC</span>
    </NavLink>
  );
}
