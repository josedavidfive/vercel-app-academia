import { Link } from "react-router";

const footerLinks = [
  { to: "/", label: "Inicio" },
  { to: "/cursos", label: "Cursos" },
  { to: "/#bootcamp", label: "Bootcamp" },
  { to: "/login", label: "Campus" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#1f2937] bg-[#080d18] px-4 py-12 text-[#f8fafc] sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-3 transition hover:text-[#06b6d4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06b6d4]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e53935] text-sm font-black text-white">
              AT
            </span>
            <span className="text-xl font-black">AprenTIC Academy</span>
          </Link>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#94a3b8]">
            Rebranding EdTech inspirado en la experiencia intensiva de The
            Bridge Academy: contenidos, seguimiento y proyectos conectados a una
            ruta profesional.
          </p>
        </div>

        <nav
          aria-label="Enlaces de pie de página"
          className="flex flex-wrap gap-2 text-sm text-[#94a3b8]"
        >
          {footerLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-lg px-3 py-2 transition hover:bg-[#111827] hover:text-[#06b6d4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06b6d4]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-3 border-t border-[#1f2937] pt-6 text-xs text-[#64748b] sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} AprenTIC Academy.</p>
        <p>Learn. Build. Evolve.</p>
      </div>
    </footer>
  );
}
