import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { getProfesorById } from "../../services/profesores.service";
import { getModulos } from "../../services/modulos.service";
import { getLecciones } from "../../services/lecciones.service";
import Navbar from "../../components/layout/Navbar.jsx";

export default function ProfesorDashboard() {
  const { usuario, cargando: authLoading } = useAuth();

  const [profesor, setProfesor] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [lecciones, setLecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!usuario?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [profesorData, modulosData, leccionesData] = await Promise.all([
          getProfesorById(usuario.uid),
          getModulos(),
          getLecciones(),
        ]);

        setProfesor(profesorData);
        setModulos(modulosData);
        setLecciones(leccionesData);
      } catch (loadError) {
        console.error("Error al cargar el panel docente:", loadError);
        setError("No se pudo cargar la información del profesor.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [usuario?.uid]);

  if (authLoading) {
    return <LoadingPage message="Comprobando sesión..." />;
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-[#f8fafc]">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <section className="rounded-2xl border border-[#1f2937] bg-[#111827] p-8 text-center">
            <h1 className="text-2xl font-bold">Acceso docente</h1>
            <p className="mt-2 text-sm text-[#94a3b8]">
              Debes iniciar sesión para acceder al panel docente.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex rounded-lg bg-[#e53935] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c62828]"
            >
              Iniciar sesión
            </Link>
          </section>
        </main>
      </div>
    );
  }

  if (loading) {
    return <LoadingPage message="Cargando panel docente..." role="profesor" />;
  }

  const totalHoras = modulos.reduce(
    (total, modulo) => total + Number(modulo.horas || 0),
    0,
  );
  const modulosConLecciones = modulos.filter(
    (modulo) =>
      Array.isArray(modulo.lecciones_id) && modulo.lecciones_id.length > 0,
  ).length;
  const ultimosModulos = modulos.slice(0, 4);

  const nombreProfesor = profesor?.nombre || usuario?.email || "Profesor";

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc]">
      <Navbar role="profesor" />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7c3aed]">
                Espacio docente
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Dashboard Docente
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94a3b8]">
                Bienvenido de nuevo,{" "}
                <span className="font-semibold text-[#f8fafc]">
                  {nombreProfesor}
                </span>
                . Revisa el estado del contenido y continúa gestionando las
                lecciones del curso.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/profesor/lecciones"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#e53935] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c62828] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444]"
              >
                Crear lección
              </Link>
              <Link
                to="/profesor/modulos"
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#1f2937] bg-[#0f172a] px-5 py-2.5 text-sm font-semibold transition hover:border-[#06b6d4] hover:text-[#06b6d4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06b6d4]"
              >
                Ver módulos
              </Link>
            </div>
          </div>

          {error && (
            <p className="mt-6 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]">
              {error}
            </p>
          )}
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Módulos" value={modulos.length} tone="purple" />
          <MetricCard label="Lecciones" value={lecciones.length} tone="cyan" />
          <MetricCard label="Horas" value={totalHoras} tone="amber" />
          <MetricCard
            label="Módulos con contenido"
            value={modulosConLecciones}
            tone="green"
          />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-2xl border border-[#1f2937] bg-[#111827] p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">Módulos del curso</h2>
                <p className="mt-1 text-sm text-[#94a3b8]">
                  Acceso rápido a los primeros módulos disponibles.
                </p>
              </div>
              <Link
                to="/profesor/modulos"
                className="text-sm font-semibold text-[#06b6d4] transition hover:text-[#67e8f9]"
              >
                Ver todos
              </Link>
            </div>

            {ultimosModulos.length === 0 ? (
              <p className="mt-6 rounded-xl border border-dashed border-[#334155] p-6 text-sm text-[#94a3b8]">
                Todavía no hay módulos creados.
              </p>
            ) : (
              <div className="mt-5 grid gap-3">
                {ultimosModulos.map((modulo, index) => (
                  <Link
                    key={modulo.id}
                    to={`/profesor/lecciones?moduloId=${modulo.id}`}
                    className="group flex flex-col gap-3 rounded-xl border border-[#1f2937] bg-[#0f172a] p-4 transition hover:border-[#06b6d4]/60 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <span className="font-mono text-sm text-[#94a3b8]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="font-semibold group-hover:text-[#06b6d4]">
                          {modulo.nombre || modulo.titulo || "Módulo"}
                        </h3>
                        <p className="mt-1 text-sm text-[#94a3b8]">
                          {Number(modulo.horas || 0)} h ·{" "}
                          {Array.isArray(modulo.lecciones_id)
                            ? modulo.lecciones_id.length
                            : 0}{" "}
                          lecciones
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-[#06b6d4]">
                      Gestionar
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <aside className="rounded-2xl border border-[#1f2937] bg-[#111827] p-5 sm:p-6">
            <h2 className="text-xl font-bold">Acciones docentes</h2>
            <div className="mt-5 grid gap-3">
              <QuickAction
                to="/profesor/lecciones"
                title="Gestionar lecciones"
                detail="Crear, editar, mover o eliminar contenido."
              />
              <QuickAction
                to="/profesor/modulos"
                title="Revisar módulos"
                detail="Consultar estructura y lecciones por módulo."
              />
              <QuickAction
                to="/profesor/seguimiento"
                title="Seguimiento"
                detail="Consultar el avance de estudiantes."
              />
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}

function LoadingPage({ message, role }) {
  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc]">
      {role && <Navbar role={role} />}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex min-h-64 items-center justify-center rounded-2xl border border-[#1f2937] bg-[#111827]">
          <p className="text-sm text-[#94a3b8]">{message}</p>
        </section>
      </main>
    </div>
  );
}

function MetricCard({ label, value, tone }) {
  const tones = {
    purple: "text-[#a78bfa] bg-[#7c3aed]/10",
    cyan: "text-[#67e8f9] bg-[#06b6d4]/10",
    amber: "text-[#fbbf24] bg-[#f59e0b]/10",
    green: "text-[#86efac] bg-[#22c55e]/10",
  };

  return (
    <article className="rounded-2xl border border-[#1f2937] bg-[#111827] p-5">
      <p className="text-xs uppercase tracking-wide text-[#94a3b8]">{label}</p>
      <strong
        className={`mt-4 inline-flex min-w-16 justify-center rounded-xl px-4 py-2 text-3xl ${tones[tone]}`}
      >
        {value}
      </strong>
    </article>
  );
}

function QuickAction({ to, title, detail }) {
  return (
    <Link
      to={to}
      className="block rounded-xl border border-[#1f2937] bg-[#0f172a] p-4 transition hover:border-[#06b6d4]/60"
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-5 text-[#94a3b8]">{detail}</p>
    </Link>
  );
}
