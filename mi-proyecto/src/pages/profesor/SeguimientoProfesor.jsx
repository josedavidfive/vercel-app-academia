import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import ProfesorNavbar from "../../components/layout/ProfesorNavbar.jsx";
import { getAlumnosByProfesor } from "../../services/alumnos.service";

const PAGE_SIZE = 10;

function progressValue(alumno) {
  const value = Number(alumno.progreso ?? alumno.avance ?? 0);
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}

export default function SeguimientoProfesor() {
  const { usuario, cargando } = useAuth();
  const [alumnos, setAlumnos] = useState([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStudents() {
      if (!usuario?.uid) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        setAlumnos(await getAlumnosByProfesor(usuario.uid));
      } catch (loadError) {
        console.error("Error al cargar alumnos:", loadError);
        setError("No se pudieron cargar los alumnos de Firebase.");
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, [usuario?.uid]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return alumnos;
    return alumnos.filter((alumno) =>
      String(alumno.nombre || "").toLowerCase().includes(normalized),
    );
  }, [alumnos, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const visibleStudents = filtered.slice(start, start + PAGE_SIZE);

  function submitSearch(event) {
    event.preventDefault();
    setQuery(search);
    setPage(1);
  }

  if (cargando || loading) return <ProfessorState message="Cargando alumnos..." />;

  return (
    <div className="profesor-theme min-h-screen bg-[#0e182b] text-[#f6f7fa]">
      <ProfesorNavbar />
      <main className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Lista de alumnos</h1>
            <p className="mt-2 text-sm text-[#9ba5b6]">Consulta el progreso de tus alumnos.</p>
          </div>
          <form onSubmit={submitSearch} className="flex w-full max-w-sm gap-3">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Buscar alumno por nombre</span>
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ba5b6]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre"
                className="profesor-search-input min-h-10 w-full rounded-lg border border-[#324057] bg-[#101a2c] pl-11 pr-10 text-sm outline-none placeholder:text-[#9ba5b6] focus:border-[#59677e]"
              />
              {(search || query) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setQuery("");
                    setPage(1);
                  }}
                  className="profesor-search-clear absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[#9ba5b6] transition hover:bg-[#202d42] hover:text-white"
                  aria-label="Limpiar búsqueda y mostrar todos los alumnos"
                  title="Mostrar todos"
                >
                  ✕
                </button>
              )}
            </label>
            <button type="submit" className="min-h-10 rounded-lg bg-[#e82b2f] px-5 text-sm font-bold transition hover:bg-[#ff3a3e]">Buscar</button>
          </form>
        </div>

        {error && <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

        <section className="mt-8 overflow-x-auto rounded-xl border border-[#324057] bg-[#111b2c]" aria-label="Lista de alumnos">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-[11px] uppercase text-[#a6afbe]">
              <tr>
                <th className="px-6 py-4 font-bold">Nombre</th>
                <th className="px-6 py-4 font-bold">Email</th>
                <th className="px-6 py-4 font-bold">Progreso</th>
              </tr>
            </thead>
            <tbody>
              {visibleStudents.length === 0 ? (
                <tr><td colSpan="3" className="px-6 py-12 text-center text-[#9ba5b6]">No se encontraron alumnos.</td></tr>
              ) : (
                visibleStudents.map((alumno) => {
                  const progress = progressValue(alumno);
                  return (
                    <tr key={alumno.id} className="profesor-table-row border-t border-[#202d42] transition hover:bg-[#152137]">
                      <td className="px-6 py-5 font-semibold">{alumno.nombre || "Sin nombre"}</td>
                      <td className="px-6 py-5 text-[#9ba5b6]">{alumno.email || "—"}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className="h-1.5 w-40 overflow-hidden rounded-full bg-[#3c475b]"><span className="block h-full rounded-full bg-[#ea2d31]" style={{ width: `${progress}%` }} /></span>
                          <span className="min-w-9 text-xs text-[#9ba5b6]">{progress}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>

        <div className="mt-8 flex flex-col gap-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[#9ba5b6]">
            {filtered.length === 0 ? "Mostrando 0 alumnos" : `Mostrando ${start + 1}-${Math.min(start + PAGE_SIZE, filtered.length)} de ${filtered.length} alumnos`}
          </p>
          <div className="flex gap-2">
            <button type="button" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-[#324057] px-4 py-2 font-semibold transition hover:bg-[#172238] disabled:cursor-not-allowed disabled:opacity-40">Anterior</button>
            <button type="button" disabled={safePage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-lg border border-[#324057] px-4 py-2 font-semibold transition hover:bg-[#172238] disabled:cursor-not-allowed disabled:opacity-40">Siguiente</button>
          </div>
        </div>
      </main>

    </div>
  );
}

function ProfessorState({ message }) {
  return (
    <div className="profesor-theme min-h-screen bg-[#0e182b] text-white">
      <ProfesorNavbar />
      <main className="flex min-h-[60vh] items-center justify-center"><p className="text-sm text-[#9ba5b6]">{message}</p></main>
    </div>
  );
}
