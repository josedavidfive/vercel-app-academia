const variants = {
  primary: "bg-[#e53935] text-white hover:bg-[#c62828] focus-visible:ring-[#ef4444]",
  secondary:
    "border border-[#334155] bg-[#111827] text-[#f8fafc] hover:border-[#06b6d4] hover:text-[#06b6d4] focus-visible:ring-[#06b6d4]",
  ghost:
    "text-[#94a3b8] hover:bg-[#111827] hover:text-[#f8fafc] focus-visible:ring-[#06b6d4]",
};

export default function Button({
  className = "",
  type = "button",
  variant = "primary",
  ...props
}) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant] || variants.primary} ${className}`}
      {...props}
    />
  );
}
