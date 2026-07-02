import { useEffect } from "react";

export default function Modal({
  children,
  onClose,
  showCloseButton = true,
  ariaLabel = "Ventana modal",
}) {
  useEffect(() => {
    const handler = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-sm sm:px-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className="relative max-h-[calc(100vh-3rem)] w-full overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-3 top-3 z-10 rounded-lg border border-[#334155] bg-[#111827] px-3 py-1.5 text-sm text-[#f8fafc] transition hover:border-[#ef4444] hover:text-[#fca5a5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06b6d4]"
          >
            Cerrar
          </button>
        )}

        {children}
      </div>
    </div>
  );
}
