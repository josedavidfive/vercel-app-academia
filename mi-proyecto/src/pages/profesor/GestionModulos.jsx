import { useEffect, useState } from "react";
import { Link } from "react-router";
import ProfesorNavbar from "../../components/layout/ProfesorNavbar.jsx";
import { useAuth } from "../../hooks/useAuth";
import { getLecciones } from "../../services/lecciones.service";
import { getModulosByPromocionTodos, updateModulo } from "../../services/modulos.service";
import { getProfesorById } from "../../services/profesores.service";

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
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!usuario?.uid) { setLoading(false); return; }
      try {
        setLoading(true);
        setError("");

        // 1. Cargar profesor y sus promociones
        const profesorData = await getProfesorById(usuario.uid, usuario.email);

        const promocionRefs = profesorData?.promociones || profesorData?.promocion_id || [];
        // 2. Cargar todos los módulos de sus promociones (activos e inactivos)
        const todosModulos = [];
        for (const ref of promocionRefs) {
          const mods = await getModulosByPromocionTodos(ref);
          todosModulos.push(...mods);
        }
        const modulosData = [...new Map(todosModulos.map(m => [m.id, m])).values()];

        // 3. Cargar lecciones y filtrar por módulos del profesor
        const leccionesData = await getLecciones();
        const moduleIds = new Set(modulosData.map(m => m.id));
        const ownLessons = leccionesData.filter(l =>
          moduleIds.has(getModuloIdFromRef(l.modulo_id))
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
  }, [usuario?.uid, usuario?.email]);

  const toggleLecciones = (moduloId) => {
    setLeccionesVisibles(prev => ({ ...prev, [moduloId]: !prev[moduloId] }));
  };

  const toggleEstado = async (modulo) => {
    const nuevoEstado = modulo.estado === "activo" ? "desactivado" : "activo";
    try {
      setToggling(modulo.id);
      await updateModulo(modulo.id, { estado: nuevoEstado });
      setModulos(prev => prev.map(m =>
        m.id === modulo.id ? { ...m, estado: nuevoEstado } : m
      ));
    } catch {
      setError("No se pudo cambiar el estado del módulo.");
    } finally {
      setToggling(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0e182b] text-[#f6f7fa]">
        <ProfesorNavbar />
        <main className="mx-auto flex min-h-[60vh] max-w-[1440px] items-center justify-center px-5">
          <p className="text-sm text-[#9ba5b6]">Cargando módulos...</p>
        </main>
      </div>
    );
  }

  const totalLecciones = Object.values(leccionesMap).reduce((t, l) => t + l.length, 0);
  const totalHoras = modulos.reduce((t, m) => t + Number(m.horas || 0), 0);

  return (
    <div className="min-h-screen bg-[#0e182b] text-[#f6f7fa]">
      <ProfesorNavbar />
      <main className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 lg:py-14">

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7c3aed]">
              Estructura del curso
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Módulos del curso
            </h1>
            <p className="mt-2 text-sm text-[#9ba5b6]">
              Gestiona tus módulos y activa o desactiva su visibilidad para los alumnos.
            </p>
          </div>
          <Link to="/profesor/lecciones"
            className="shrink-0 rounded-lg border border-[#324057] px-4 py-2 text-sm font-semibold transition hover:border-[#06b6d4] hover:text-[#06b6d4]">
            Gestionar lecciones
          </Link>
        </div>

        {/* STATS */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Módulos", value: modulos.length },
            { label: "Lecciones", value: totalLecciones },
            { label: "Horas totales", value: `${totalHoras}h` },
          ].map(({ label, value }) => (
            <article key={label} className="rounded-xl border border-[#324057] bg-[#111b2c] px-6 py-5">
              <p className="text-xs uppercase tracking-wider text-[#9ba5b6]">{label}</p>
              <strong className="mt-2 block text-2xl font-bold text-[#ee2d31]">{value}</strong>
            </article>
          ))}
        </section>

        {error && (
          <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
        )}

        {/* MÓDULOS */}
        <section className="mt-8 grid gap-4">
          {modulos.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#324057] px-5 py-8 text-center text-sm text-[#9ba5b6]">
              No tienes módulos asignados todavía.
            </p>
          ) : modulos.map((modulo, index) => {
            const leccionesModulo = leccionesMap[modulo.id] ?? [];
            const abierto = Boolean(leccionesVisibles[modulo.id]);
            const activo = modulo.estado === "activo";

            return (
              <article key={modulo.id}
                className="overflow-hidden rounded-2xl border border-[#324057] bg-[#111b2c] transition hover:border-[#06b6d4]/50">
                <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-sm text-[#9ba5b6]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h2 className="text-lg font-bold">{modulo.nombre || "Módulo"}</h2>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${activo ? "bg-[#063b39] text-[#00d2a1]" : "bg-[#3a4659] text-[#aeb7c5]"}`}>
                        {activo ? "Activo" : "Desactivado"}
                      </span>
                      {modulo.horas && (
                        <span className="rounded-full bg-[#1e2d42] px-3 py-1 text-xs text-[#9ba5b6]">
                          {modulo.horas}h
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-[#9ba5b6]">
                      {leccionesModulo.length} {leccionesModulo.length === 1 ? "lección" : "lecciones"}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      onClick={() => toggleEstado(modulo)}
                      disabled={toggling === modulo.id}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${activo
                        ? "border-[#3d2d2d] text-[#ff5558] hover:bg-[#3d2d2d]/30"
                        : "border-[#2d5f5e] text-[#00d2a1] hover:bg-[#2d5f5e]/30"}`}
                    >
                      {toggling === modulo.id ? "..." : activo ? "Desactivar" : "Activar"}
                    </button>
                    <Link to={`/profesor/lecciones?moduloId=${modulo.id}`}
                      className="rounded-lg bg-[#e82b2f] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#ff3a3e]">
                      + Lección
                    </Link>
                    <button
                      onClick={() => toggleLecciones(modulo.id)}
                      className="rounded-lg border border-[#324057] px-3 py-2 text-xs font-semibold transition hover:border-[#06b6d4] hover:text-[#06b6d4]">
                      {abierto ? "Ocultar" : "Ver lecciones"}
                    </button>
                  </div>
                </div>

                {abierto && (
                  <div className="border-t border-[#324057] bg-[#0a1220] p-6">
                    {leccionesModulo.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-[#324057] p-4 text-sm text-[#9ba5b6]">
                        Este módulo no tiene lecciones todavía.
                      </p>
                    ) : (
                      <ul className="grid gap-2">
                        {leccionesModulo.map(leccion => (
                          <li key={leccion.id}
                            className="rounded-xl border border-[#1e2d42] bg-[#111b2c] px-4 py-3 text-sm">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-semibold">{leccion.titulo || "Lección sin título"}</p>
                              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${leccion.disponible ? "bg-[#063b39] text-[#00d2a1]" : "bg-[#3a4659] text-[#aeb7c5]"}`}>
                                {leccion.disponible ? "Publicada" : "Borrador"}
                              </span>
                            </div>
                            {leccion.descripcion && (
                              <p className="mt-1 text-xs text-[#9ba5b6]">{leccion.descripcion}</p>
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
      </main>
    </div>
  );
}