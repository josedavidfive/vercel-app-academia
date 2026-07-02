import { NavLink } from "react-router";

export default function Navbar() {
  return (
    <header className="h-[73px] bg-[#0F172A] border-b border-slate-800">
      <nav className="max-w-7xl mx-auto h-full px-8 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EF4444] flex items-center justify-center text-white font-bold text-sm">
              &lt;&gt;
            </div>
            <span className="text-white font-bold text-lg">AprenTIC</span>
          </NavLink>

          <div className="flex items-center gap-8">
            <NavLink to="/cursos" className="text-slate-400 hover:text-white">
              Cursos
            </NavLink>
            <NavLink to="/cursos" className="text-slate-400 hover:text-white">
              Bootcamp
            </NavLink>
            <NavLink to="/nosotros" className="text-slate-400 hover:text-white">
              Nosotros
            </NavLink>
          </div>
        </div>

        <NavLink
          to="/login"
          className="text-white font-medium hover:text-red-400"
        >
          Iniciar sesión
        </NavLink>
      </nav>
    </header>
  );
}
