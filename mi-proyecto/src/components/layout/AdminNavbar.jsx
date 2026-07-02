
import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { logout } from "../../services/auth.service";
import AprenticLogo from "./AprenticLogo.jsx";

const LINKS = [
  { to: "/admin", label: "Inicio", end: true },
  { to: "/admin/alumnos", label: "Alumnos" },
  { to: "/admin/inscripciones", label: "Inscripciones" },
  { to: "/admin/profesores", label: "Profesores" },
  { to: "/admin/promociones", label: "Promociones" },
  // { to: "/admin/modulos", label: "Módulos" },
  { to: "/admin/campus", label: "Campus" },
];

export default function AdminNavbar() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const initial = usuario?.displayName?.charAt(0) || usuario?.email?.charAt(0) || "A";

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition ${isActive ? "text-white" : "text-[#9ba5b6] hover:text-white"}`;

  const mobileLinkClass = ({ isActive }) =>
    `block px-4 py-3 text-sm font-medium rounded-lg transition ${isActive ? "bg-[#172238] text-white" : "text-[#9ba5b6] hover:bg-[#172238] hover:text-white"}`;

  return (
    <header className="border-b border-[#2b374d] bg-[#10192a] text-white">
      <nav className="mx-auto flex h-16 max-w-[1440px] items-center px-4 sm:px-6 lg:px-12">

        {/* LOGO */}
        <AprenticLogo to="/admin" />

        {/* ENLACES DESKTOP */}
        <div className="ml-6 hidden items-center gap-5 lg:flex">
          {LINKS.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              {label}
            </NavLink>
          ))}
        </div>

        {/* DERECHA */}
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden rounded-full border border-[#3b465b] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#aeb7c5] sm:inline-flex">
            Admin
          </span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2b374d] bg-[#202b3d] text-xs font-bold uppercase">
            {initial}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9ba5b6] transition hover:bg-[#202b3d] hover:text-[#ff5558]"
            aria-label="Cerrar sesión"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            </svg>
          </button>

          {/* HAMBURGUESA */}
          <button
            type="button"
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9ba5b6] transition hover:bg-[#202b3d] hover:text-white lg:hidden"
            aria-label="Menú"
          >
            {menuAbierto ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* MENÚ MÓVIL */}
      {menuAbierto && (
        <div className="border-t border-[#2b374d] bg-[#10192a] px-4 py-2 lg:hidden">
          {LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={mobileLinkClass}
              onClick={() => setMenuAbierto(false)}
            >
              {label}
            </NavLink>
          ))}
          <div className="mt-2 border-t border-[#2b374d] pt-2">
            <button
              onClick={handleLogout}
              className="block w-full rounded-lg px-4 py-3 text-left text-sm font-medium text-[#ff5558] hover:bg-[#172238]"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </header>
  );
}