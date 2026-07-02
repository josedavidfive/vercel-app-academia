import { getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import ProfesorNavbar from "../../components/layout/ProfesorNavbar.jsx";
import { useAuth } from "../../hooks/useAuth";
import { getModulosByPromocionTodos } from "../../services/modulos.service";
import { getProfesorById } from "../../services/profesores.service";
import { moduleName, sortModules } from "../../utils/modulos.js";

export default function ProfesorDashboard() {
  const { usuario, cargando: authLoading } = useAuth();
  const [modulos, setModulos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [profesor, setProfesor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      if (!usuario?.uid) { setLoading(false); return; }
      try {
        setLoading(true);
        setError("");

        const profesorData = await getProfesorById(usuario.uid);
        setProfesor(profesorData);

        const promocionRefs = profesorData?.promociones || profesorData?.promocion_id || [];

        // Módulos de todas sus promociones sin duplicados
        const todosModulos = [];
        for (const ref of promocionRefs) {
          const mods = await getModulosByPromocionTodos(ref);
          todosModulos.push(...mods);
        }
        const sinDuplicados = [...new Map(todosModulos.map(m => [m.id, m])).values()];
        setModulos(sortModules(sinDuplicados));

        // Alumnos de todas sus promociones sin duplicados
        const alumnosMap = new Map();
        for (const ref of promocionRefs) {
          const snap = await getDoc(ref);
          const alumnosRefs = snap.data()?.alumnos_id || [];
          for (const alumnoRef of alumnosRefs) {
            if (typeof alumnoRef === "string") continue; // saltar strings malformados
            const alumnoSnap = await getDoc(alumnoRef);
            if (alumnoSnap.exists()) {
              alumnosMap.set(alumnoSnap.id, { id: alumnoSnap.id, ...alumnoSnap.data() });
            }
          }
        }
        setAlumnos([...alumnosMap.values()]);

      } catch (loadError) {
        console.error("Error al cargar el panel docente:", loadError);
        setError("No se pudo cargar la información del espacio docente.");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [usuario?.uid]);

  if (authLoading || loading) return <ProfessorState message="Cargando espacio docente..." />;

  const modulosActivos = modulos.filter(m => m.estado === "activo").length;
  const nombreProfesor = profesor?.nombre || usuario?.displayName || usuario?.email?.split("@")[0] || "Profesor";

  return (
    <div className="profesor-theme min-h-screen bg-[#0e182b] text-[#f6f7fa]">
      <ProfesorNavbar />
      <main className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 lg:py-14">

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Bienvenido de nuevo, <span className="text-[#ee2d31]">{nombreProfesor}</span>
        </h1>

        {error && (
          <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
        )}

        {/* MÉTRICAS */}
        <section className="mt-10 grid gap-6 sm:grid-cols-2">
          <Metric label="Módulos activos" value={modulosActivos} />
          <Metric label="Alumnos" value={alumnos.length} />
        </section>

        {/* MÓDULOS — cards sin link */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">Mis módulos</h2>
          {modulos.length === 0 ? (
            <p className="mt-8 rounded-xl border border-dashed border-[#324057] px-5 py-8 text-sm text-[#9ba5b6]">
              No tienes módulos asignados todavía.
            </p>
          ) : (
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {modulos.map((modulo, index) => {
                const activo = modulo.estado === "activo";
                return (
                  <div
                    key={modulo.id}
                    className="flex min-h-[90px] items-center justify-between gap-4 rounded-xl border border-[#324057] bg-[#111b2c] px-6 py-5"
                  >
                    <div>
                      <h3 className="text-base font-semibold">
                        Módulo {index + 1}: {moduleName(modulo)}
                      </h3>
                      <p className="mt-1 text-xs text-[#9ba5b6]">
                        {modulo.horas || 0}h · {modulo.lecciones_id?.length || 0} lecciones
                      </p>
                    </div>
                    <span className={`shrink-0 rounded px-2.5 py-1 text-[10px] font-bold uppercase ${activo ? "bg-[#063b39] text-[#00d2a1]" : "bg-[#3a4659] text-[#aeb7c5]"}`}>
                      {activo ? "Activo" : "Desactivado"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ALUMNOS */}
        <section className="mt-10">
          <h2 className="text-xl font-bold">Mis alumnos</h2>
          {alumnos.length === 0 ? (
            <p className="mt-8 rounded-xl border border-dashed border-[#324057] px-5 py-8 text-sm text-[#9ba5b6]">
              No tienes alumnos asignados todavía.
            </p>
          ) : (
            <div className="mt-7 overflow-hidden rounded-xl border border-[#324057] bg-[#111b2c]">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#324057]">
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#4a5a72]">Avatar</th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#4a5a72]">Nombre</th>
                    <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#4a5a72]">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnos.map((alumno, i) => (
                    <tr key={alumno.id} className={`border-b border-[#202d42] transition hover:bg-[#152137] ${i % 2 === 0 ? "" : "bg-[#0e1a2c]"}`}>
                      <td className="px-6 py-4">
                        <img src={alumno.avatar || "/assets/avatar/avatar3.webp"} alt={alumno.nombre} className="h-8 w-8 rounded-full object-cover" />
                      </td>
                      <td className="px-6 py-4 font-semibold">{alumno.nombre || "—"}</td>
                      <td className="px-6 py-4 text-[#9ba5b6]">{alumno.email || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <article className="min-h-[116px] rounded-xl border border-[#324057] bg-[#111b2c] px-6 py-6">
      <p className="text-sm text-[#9ba5b6]">{label}</p>
      <strong className="mt-3 block text-3xl font-bold text-[#ee2d31]">{value}</strong>
    </article>
  );
}

function ProfessorState({ message }) {
  return (
    <div className="profesor-theme min-h-screen bg-[#0e182b] text-white">
      <ProfesorNavbar />
      <main className="mx-auto flex min-h-[60vh] max-w-[1440px] items-center justify-center px-5">
        <p className="text-sm text-[#9ba5b6]">{message}</p>
      </main>
    </div>
  );
}