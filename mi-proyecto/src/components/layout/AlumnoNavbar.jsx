import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { logout } from "../../services/auth.service";
import AprenticLogo from "./AprenticLogo.jsx";

export default function AlumnoNavbar() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const initial = usuario?.displayName?.charAt(0) || usuario?.email?.charAt(0) || "A";

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
  }

  return (
    <header className="border-b border-[#2b374d] bg-[#10192a] text-white">
      <nav className="mx-auto flex min-h-[96px] max-w-[1440px] items-center gap-8 px-5 sm:px-8 lg:px-12" aria-label="Navegación del alumno">
        <AprenticLogo to="/alumno" />
        <NavLink to="/alumno" end className={({ isActive }) => `text-sm font-medium ${isActive ? "text-white" : "text-[#9ba5b6]"}`}>Mi aprendizaje</NavLink>
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden rounded-full border border-[#3b465b] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#aeb7c5] sm:inline-flex">Alumno</span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2b374d] bg-[#202b3d] text-sm font-bold uppercase">{initial}</span>
          <button type="button" onClick={handleLogout} className="flex h-9 w-9 items-center justify-center rounded-lg text-[#9ba5b6] transition hover:bg-[#202b3d] hover:text-[#ff5558]" aria-label="Cerrar sesión">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /></svg>
          </button>
        </div>
      </nav>
    </header>
  );
}
