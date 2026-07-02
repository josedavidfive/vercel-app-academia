import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import AlumnoNavbar from "../../components/layout/AlumnoNavbar.jsx";
import { getLecciones } from "../../services/lecciones.service";
import { getModuloById } from "../../services/modulos.service";

export default function VerLecciones() {
  const { moduloId } = useParams();
  const navigate = useNavigate();

  const [modulo, setModulo] = useState(null);
  const [lecciones, setLecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoading(true);
        setError("");
        const mod = await getModuloById(moduloId);
        const todasLecciones = await getLecciones();
        // Filtrar lecciones de este módulo que estén disponibles
        const lecs = todasLecciones.filter((l) => {
          const refId = l.modulo_id?.id || l.modulo_id?.path?.split("/").pop() || l.modulo_id;
          return refId === moduloId;
        });
        setModulo(mod);
        setLecciones(lecs);
      } catch (e) {
        console.error("Error cargando lecciones:", e);
        setError("No se pudieron cargar las lecciones.");
      } finally {
        setLoading(false);
      }
    }
    if (moduloId) cargarDatos();
  }, [moduloId]);

  if (loading) return <AlumnoState message="Cargando lecciones..." />;

  return (
    <div className="min-h-screen bg-[#0e182b] text-[#f6f7fa]">
      <AlumnoNavbar />
      <main className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 lg:py-14">

        <button
          onClick={() => navigate("/alumno")}
          className="mb-8 flex items-center gap-2 text-sm text-[#9ba5b6] transition hover:text-white"
        >
          ← Volver al dashboard
        </button>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {modulo?.nombre || "Módulo"}
        </h1>
        <p className="mt-2 text-sm text-[#9ba5b6]">
          {modulo?.horas || 0}h · {lecciones.length} lecciones disponibles
        </p>

        {error && (
          <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <section className="mt-10 flex flex-col gap-3">
          {lecciones.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#324057] px-5 py-8 text-sm text-[#9ba5b6]">
              No hay lecciones disponibles en este módulo todavía.
            </p>
          ) : (
            lecciones.map((leccion, index) => (
              <div
                key={leccion.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-[#324057] bg-[#111b2c] px-6 py-5 transition hover:border-[#06b6d4] hover:bg-[#132038]"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className="shrink-0 font-mono text-sm text-[#06b6d4]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">{leccion.titulo}</h3>
                    {leccion.descripcion && (
                      <p className="mt-0.5 truncate text-xs text-[#9ba5b6]">{leccion.descripcion}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/alumno/${moduloId}/${leccion.id}`)}
                  className="shrink-0 rounded-lg bg-[#ee2d31] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#ff3a3e]"
                >
                  Abrir
                </button>
              </div>
            ))
          )}
        </section>

      </main>
    </div>
  );
}

function AlumnoState({ message }) {
  return (
    <div className="min-h-screen bg-[#0e182b] text-white">
      <AlumnoNavbar />
      <main className="mx-auto flex min-h-[60vh] max-w-[1440px] items-center justify-center px-5">
        <p className="text-sm text-[#9ba5b6]">{message}</p>
      </main>
    </div>
  );
}