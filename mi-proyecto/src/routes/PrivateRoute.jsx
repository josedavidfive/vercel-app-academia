import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function PrivateRoute({ children, allowedRoles = [] }) {
  const { usuario, rol, cargando } = useAuth();

  if (cargando) {
    return (
      <main className="min-h-screen bg-[#0f172a] px-4 py-8 text-[#f8fafc]">
        <section
          aria-busy="true"
          aria-live="polite"
          className="mx-auto flex min-h-64 max-w-4xl items-center justify-center rounded-2xl border border-[#1f2937] bg-[#111827]"
        >
          <p className="text-sm text-[#94a3b8]">Comprobando sesion...</p>
        </section>
      </main>
    );
  }

  if (!usuario) {
    return <Navigate to="/#login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(rol)) {
    return <Navigate to={rol ? `/${rol}` : "/#login"} replace />;
  }

  return children;
}
