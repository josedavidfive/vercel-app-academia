import { useEffect, useState } from "react";
import { Link } from "react-router";
import ProfesorNavbar from "../../components/layout/ProfesorNavbar.jsx";
import { useAuth } from "../../hooks/useAuth";
import { getModulos } from "../../services/modulos.service";
import { getLecciones } from "../../services/lecciones.service";

const getModuloIdFromRef = (referencia) => {
  if (!referencia) return "";
  if (typeof referencia === "string") {
    return referencia.includes("/") ? referencia.split("/").pop() : referencia;
  }
  return referencia.id || referencia.path?.split("/").pop() || "";
};

const groupLeccionesByModulo = (lecciones) =>
  lecciones.reduce((acc, leccion) => {
    const moduloId = getModuloIdFromRef(leccion.modulo_id);
    if (!moduloId) return acc;

    acc[moduloId] = [...(acc[moduloId] || []), leccion];
    return acc;
  }, {});

export default function GestionModulos() {
  const { usuario, cargando: authLoading } = useAuth();
  const [modulos, setModulos] = useState([]);
  const [leccionesMap, setLeccionesMap] = useState({});
  const [leccionesVisibles, setLeccionesVisibles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      if (!usuario?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [modulosData, leccionesData] = await Promise.all([
          getModulos(usuario.uid, usuario.email),
          getLecciones(),
        ]);
        const moduleIds = new Set(modulosData.map((modulo) => modulo.id));
        const ownLessons = leccionesData.filter((leccion) =>
          moduleIds.has(getModuloIdFromRef(leccion.modulo_id)),
        );

        setModulos(modulosData);
        setLeccionesMap(groupLeccionesByModulo(ownLessons));
      } catch (loadError) {
        console.error("Error al cargar módulos:", loadError);
        setError("No se pudieron cargar los módulos.");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [usuario?.email, usuario?.uid]);

  const toggleLecciones = (moduloId) => {
    setLeccionesVisibles((prev) => ({
      ...prev,
      [moduloId]: !prev[moduloId],
    }));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-[#f8fafc]">
        <ProfesorNavbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <LoadingPanel />
        </main>
      </div>
    );
  }

  const totalLecciones = Object.values(leccionesMap).reduce(
    (total, lecciones) => total + lecciones.length,
    0,
  );
  const totalHoras = modulos.reduce(
    (total, modulo) => total + Number(modulo.horas || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc]">
      <ProfesorNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="rounded-2xl border border-[#1f2937] bg-[#111827] p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7c3aed]">
                Estructura del curso
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Módulos del curso
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#94a3b8]">
                Consulta los módulos existentes, revisa sus lecciones y crea
                contenido dentro de cada módulo sin alterar la estructura del
                curso.
              </p>
            </div>

            <Link
              to="/profesor/lecciones"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#1f2937] bg-[#0f172a] px-5 py-2.5 text-sm font-semibold transition hover:border-[#06b6d4] hover:text-[#06b6d4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06b6d4]"
            >
              Ver todas las lecciones
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <SummaryItem label="Módulos" value={modulos.length} />
            <SummaryItem label="Lecciones" value={totalLecciones} />
            <SummaryItem label="Horas" value={totalHoras} />
          </div>
        </section>

        {error && (
          <p className="mt-6 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]">
            {error}
          </p>
        )}

        {modulos.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-[#334155] bg-[#111827] p-8 text-center text-[#94a3b8]">
            No hay módulos creados todavía.
          </p>
        ) : (
          <section className="mt-6 grid gap-4">
            {modulos.map((modulo, index) => {
              const leccionesModulo = leccionesMap[modulo.id] ?? [];
              const abierto = Boolean(leccionesVisibles[modulo.id]);
              const nombreModulo = modulo.nombre || modulo.titulo || "Módulo";

              return (
                <article
                  key={modulo.id}
                  className="overflow-hidden rounded-2xl border border-[#1f2937] bg-[#111827] shadow-xl shadow-black/10 transition hover:border-[#06b6d4]/50"
                >
                  <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-lg bg-[#0f172a] px-3 py-1 font-mono text-sm text-[#94a3b8]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h2 className="text-xl font-bold">{nombreModulo}</h2>
                        {modulo.horas !== undefined && (
                          <span className="rounded-full bg-[#7c3aed]/20 px-3 py-1 text-xs font-semibold text-[#c4b5fd]">
                            {Number(modulo.horas || 0)} h
                          </span>
                        )}
                        {modulo.estado && (
                          <span className="rounded-full bg-[#06b6d4]/10 px-3 py-1 text-xs font-semibold text-[#67e8f9]">
                            {modulo.estado}
                          </span>
                        )}
                      </div>

                      {modulo.descripcion && (
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-[#94a3b8]">
                          {modulo.descripcion}
                        </p>
                      )}

                      <p className="mt-3 text-sm text-[#94a3b8]">
                        {leccionesModulo.length}{" "}
                        {leccionesModulo.length === 1 ? "lección" : "lecciones"}
                        {" "}disponibles
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                      <Link
                        to={`/profesor/lecciones?moduloId=${modulo.id}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#e53935] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#c62828] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444]"
                      >
                        Añadir lección
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleLecciones(modulo.id)}
                        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#334155] px-4 py-2 text-sm font-semibold transition hover:border-[#06b6d4] hover:text-[#06b6d4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06b6d4]"
                      >
                        {abierto ? "Ocultar lecciones" : "Ver lecciones"}
                      </button>
                    </div>
                  </div>

                  {abierto && (
                    <div className="border-t border-[#1f2937] bg-[#0b1220] p-5 sm:p-6">
                      {leccionesModulo.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-[#334155] p-4 text-sm text-[#94a3b8]">
                          Este módulo todavía no tiene lecciones.
                        </p>
                      ) : (
                        <ul className="grid gap-2">
                          {leccionesModulo.map((leccion) => (
                            <li
                              key={leccion.id}
                              className="rounded-xl border border-[#1f2937] bg-[#0f172a] px-4 py-3 text-sm"
                            >
                              <p className="font-semibold">
                                {leccion.titulo || "Lección sin título"}
                              </p>
                              {leccion.descripcion && (
                                <p className="mt-1 text-xs leading-5 text-[#94a3b8]">
                                  {leccion.descripcion}
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
}

function LoadingPanel() {
  return (
    <section className="flex min-h-64 items-center justify-center rounded-2xl border border-[#1f2937] bg-[#111827]">
      <p className="text-sm text-[#94a3b8]">Cargando módulos...</p>
    </section>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-xl border border-[#1f2937] bg-[#0f172a] p-4">
      <p className="text-xs uppercase tracking-wide text-[#94a3b8]">{label}</p>
      <strong className="mt-2 block text-2xl text-[#06b6d4]">{value}</strong>
    </div>
  );
}
