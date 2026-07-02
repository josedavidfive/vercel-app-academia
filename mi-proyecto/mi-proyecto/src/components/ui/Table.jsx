export default function Table({ className = "", ...props }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#1f2937] bg-[#111827]">
      <table className={`w-full text-left text-sm ${className}`} {...props} />
    </div>
  );
}
