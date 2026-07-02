const tones = {
  cyan: "border-[#06b6d4]/30 bg-[#06b6d4]/10 text-[#67e8f9]",
  purple: "border-[#7c3aed]/30 bg-[#7c3aed]/15 text-[#c4b5fd]",
  success: "border-[#22c55e]/30 bg-[#22c55e]/10 text-[#86efac]",
  warning: "border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#fbbf24]",
  error: "border-[#ef4444]/30 bg-[#ef4444]/10 text-[#fca5a5]",
};

export default function Badge({ className = "", tone = "cyan", ...props }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone] || tones.cyan} ${className}`}
      {...props}
    />
  );
}
