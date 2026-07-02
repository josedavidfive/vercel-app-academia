import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import {
  getModulos,
  setModuloActivo,
} from "../../services/modulos.service";
import { getAlumnosByProfesor } from "../../services/alumnos.service";
import { getProfesorById } from "../../services/profesores.service";
import ProfesorNavbar from "../../components/layout/ProfesorNavbar.jsx";
import {
  isActiveModule,
  moduleName,
  sortModules,
} from "../../utils/modulos.js";

export default function ProfesorDashboard() {
  const { usuario, cargando: authLoading } = useAuth();
  const [modulos, setModulos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [profesor, setProfesor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingModuleId, setSavingModuleId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      if (!usuario?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const [modulosData, alumnosData, profesorData] = await Promise.all([
          getModulos(usuario.uid, usuario.email),
          getAlumnosByProfesor(usuario.uid),
          getProfesorById(usuario.uid, usuario.email),
        ]);
        setModulos(sortModules(modulosData));
        setAlumnos(alumnosData);
        setProfesor(profesorData);
      } catch (loadError) {
        console.error("Error al cargar el panel docente:", loadError);
        setError("No se pudo cargar la información del espacio docente.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [usuario?.email, usuario?.uid]);

  if (authLoading || loading)
    return <ProfessorState message="Cargando espacio docente..." />;

  const activeModules = modulos.filter(isActiveModule).length;
  const nombreProfesor =
    profesor?.nombre ||
    profesor?.displayName ||
    usuario?.displayName ||
    usuario?.email?.split("@")[0] ||
    "Profesor";

  async function toggleModule(modulo, index) {
    const nextActive = !isActiveModule(modulo, index);

    try {
      setSavingModuleId(modulo.id);
      setError("");
      await setModuloActivo(modulo.id, nextActive);
      setModulos((current) =>
        current.map((item) =>
          item.id === modulo.id
            ? { ...item, estado: nextActive ? "activo" : "bloqueado" }
            : item,
        ),
      );
    } catch (saveError) {
      console.error("Error al cambiar el estado del módulo:", saveError);
      setError("No se pudo cambiar el estado del módulo.");
    } finally {
      setSavingModuleId("");
    }
  }

  return (
    <div className="profesor-theme min-h-screen bg-[#0e182b] text-[#f6f7fa]">
      <ProfesorNavbar />

      <main className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 lg:py-14">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Bienvenido de nuevo,{" "}
          <span className="text-[#ee2d31]">{nombreProfesor}</span>
        </h1>

        {error && (
          <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <section
          className="mt-10 grid gap-6 sm:grid-cols-2"
          aria-label="Resumen docente"
        >
          <Metric label="Módulos activos" value={activeModules} />
          <Metric label="Alumnos" value={alumnos.length} />
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-bold">Módulos</h2>
          {modulos.length === 0 ? (
            <p className="mt-8 rounded-xl border border-dashed border-[#324057] px-5 py-8 text-sm text-[#9aa5b6]">
              No hay módulos disponibles todavía.
            </p>
          ) : (
            <div className="mt-7">
              {modulos.slice(0, 8).map((modulo, index) => {
                const active = isActiveModule(modulo, index);
                return (
                  <article
                    key={modulo.id}
                    className="profesor-module-row flex min-h-[62px] items-center justify-between gap-5 border-b border-transparent px-5 transition hover:border-[#2b374d] hover:bg-[#111d31]"
                  >
                    <Link
                      to={`/profesor/lecciones?moduloId=${modulo.id}`}
                      className="min-w-0 flex-1 font-medium hover:text-[#ee2d31]"
                    >
                      Módulo {index + 1}: {moduleName(modulo).replace(/^Módulo\s+\d+\s*/i, "")}
                    </Link>
                    <div className="flex shrink-0 items-center gap-4">
                      <Status active={active} />
                      <button
                        type="button"
                        role="switch"
                        aria-checked={active}
                        aria-label={`${active ? "Bloquear" : "Desbloquear"} ${moduleName(modulo)}`}
                        title={active ? "Bloquear módulo" : "Desbloquear módulo"}
                        disabled={savingModuleId === modulo.id}
                        onClick={() => toggleModule(modulo, index)}
                        className={`relative h-6 w-11 rounded-full transition ${active ? "bg-[#12c7a0]" : "bg-[#3a465a]"} disabled:cursor-wait disabled:opacity-60`}
                      >
                        <span
                          className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition ${active ? "left-[23px]" : "left-[3px]"}`}
                        />
                      </button>
                    </div>
                  </article>
                );
              })}
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
      <strong className="mt-3 block text-3xl font-bold text-[#ee2d31]">
        {value}
      </strong>
    </article>
  );
}

function Status({ active }) {
  return (
    <span
      className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase ${active ? "bg-[#063b39] text-[#00d2a1]" : "bg-[#3a4659] text-[#aeb7c5]"}`}
    >
      {active ? "Activo" : "Bloqueado"}
    </span>
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
