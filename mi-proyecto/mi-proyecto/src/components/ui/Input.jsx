export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`min-h-11 w-full rounded-lg border border-[#334155] bg-[#0f172a] px-4 py-2.5 text-sm text-[#f8fafc] outline-none transition placeholder:text-[#64748b] hover:border-[#475569] focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}
