import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { logout } from "../../services/auth.service";
import AprenticLogo from "./AprenticLogo.jsx";

const links = [
  { to: "/profesor", label: "Espacio docente", end: true },
  { to: "/profesor/lecciones", label: "Contenidos" },
  { to: "/profesor/seguimiento", label: "Seguimiento" },
];

export default function ProfesorNavbar() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [lightMode, setLightMode] = useState(() => window.localStorage.getItem("aprentic-theme") === "light");
  const initial = usuario?.displayName?.trim()?.charAt(0) || usuario?.email?.charAt(0) || "P";

  useEffect(() => {
    window.localStorage.setItem("aprentic-theme", lightMode ? "light" : "dark");
    document.documentElement.dataset.aprenticTheme = lightMode ? "light" : "dark";
    document.documentElement.style.colorScheme = lightMode ? "light" : "dark";
  }, [lightMode]);

  async function handleLogout() {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  return (
    <header className="profesor-navbar border-b border-[#2b374d] bg-[#10192a]">
      <nav className="mx-auto flex min-h-[96px] max-w-[1440px] items-center gap-8 px-5 sm:px-8 lg:px-12" aria-label="Navegación docente">
        <AprenticLogo to="/profesor" />

        <div className="flex min-w-0 flex-1 items-center gap-5 overflow-x-auto sm:gap-8">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `profesor-nav-link shrink-0 py-6 text-sm font-medium transition ${
                  isActive ? "text-white" : "text-[#9ba5b6] hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-5">
          <button
            type="button"
            onClick={() => setLightMode((current) => !current)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#2b374d] text-[#9ba5b6] transition hover:bg-[#202b3d] hover:text-white"
            aria-label={lightMode ? "Activar modo oscuro" : "Activar modo claro"}
            title={lightMode ? "Modo oscuro" : "Modo claro"}
          >
            {lightMode ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            )}
          </button>
          <div className="relative flex items-center gap-1.5">
            <span className="profesor-avatar flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[#2b374d] bg-[#202b3d] text-sm font-bold uppercase text-white" aria-label="Perfil docente">
              {usuario?.photoURL ? (
                <img src={usuario.photoURL} alt="Perfil docente" className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </span>
            <button
              type="button"
              onClick={() => setProfileOpen((current) => !current)}
              className="profesor-profile-toggle flex h-8 w-8 items-center justify-center rounded-lg text-[#9ba5b6] transition hover:bg-[#202b3d] hover:text-white"
              aria-label="Abrir menú de perfil"
              aria-expanded={profileOpen}
            >
              <svg className={`transition ${profileOpen ? "rotate-180" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {profileOpen && (
              <div className="profesor-profile-menu absolute right-0 top-12 z-50 w-44 rounded-xl border border-[#2b374d] bg-[#111b2c] p-2 shadow-2xl shadow-black/30">
                <p className="truncate px-3 py-2 text-xs text-[#9ba5b6]">{usuario?.email}</p>
                <button type="button" onClick={handleLogout} className="profesor-logout flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-[#f6f7fa] transition hover:bg-[#202b3d] hover:text-[#ff5558]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /></svg>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
