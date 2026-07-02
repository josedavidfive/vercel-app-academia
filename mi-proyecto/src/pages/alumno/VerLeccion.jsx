import { doc, getDoc } from "firebase/firestore";
import { marked } from "marked";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import AlumnoNavbar from "../../components/layout/AlumnoNavbar.jsx";
import { db } from "../../config/firebase";

export default function VerLeccion() {
  const { moduloId, leccionId } = useParams();
  const navigate = useNavigate();

  const [leccion, setLeccion] = useState(null);
  const [contenido, setContenido] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarLeccion() {
      try {
        setLoading(true);
        setError("");
        const snap = await getDoc(doc(db, "lecciones", leccionId));
        if (!snap.exists()) { setError("Lección no encontrada."); return; }
        const data = { id: snap.id, ...snap.data() };
        setLeccion(data);

        try {
          const url = "/contenidos/demo.md";
          const res = await fetch(url);
          const texto = await res.text();
          setContenido(texto);
        } catch {
          setContenido("No se pudo cargar el contenido de la lección.");
        }

      } catch (e) {
        console.error("Error cargando lección:", e);
        setError("No se pudo cargar la lección.");
      } finally {
        setLoading(false);
      }
    }
    if (leccionId) cargarLeccion();
  }, [leccionId]);

  if (loading) return <AlumnoState message="Cargando lección..." />;

  return (
    <div className="min-h-screen bg-[#0e182b] text-[#f6f7fa]">
      <AlumnoNavbar />
      <main className="mx-auto max-w-[900px] px-5 py-12 sm:px-8 lg:py-14">

        <button
          onClick={() => navigate(`/alumno/${moduloId}`)}
          className="mb-8 flex items-center gap-2 text-sm text-[#9ba5b6] transition hover:text-white"
        >
          ← Volver a lecciones
        </button>

        {error && (
          <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </p>
        )}

        {leccion && (
          <>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {leccion.titulo}
            </h1>
            {leccion.descripcion && (
              <p className="mt-3 text-sm text-[#9ba5b6]">{leccion.descripcion}</p>
            )}

            {/* VÍDEOS */}
            {leccion.video_url?.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-3 text-lg font-semibold">Vídeos</h2>
                <div className="flex flex-col gap-3">
                  {leccion.video_url.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-[#324057] bg-[#111b2c] px-4 py-3 text-sm text-[#06b6d4] transition hover:border-[#06b6d4]"
                    >
                      🎬 Vídeo {i + 1}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* ARCHIVOS */}
            {leccion.archivos_url?.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-3 text-lg font-semibold">Archivos</h2>
                <div className="flex flex-col gap-3">
                  {leccion.archivos_url.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-[#324057] bg-[#111b2c] px-4 py-3 text-sm text-[#06b6d4] transition hover:border-[#06b6d4]"
                    >
                      📄 Archivo {i + 1}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* CONTENIDO .MD */}
            {contenido && (
              <section className="mt-10 rounded-xl border border-[#324057] bg-[#111b2c] px-8 py-8">
                <div
                  className="markdown-content"
                  dangerouslySetInnerHTML={{ __html: marked(contenido) }}
                />
              </section>
            )}

            {!contenido && !leccion.video_url?.length && !leccion.archivos_url?.length && (
              <p className="mt-10 text-sm text-[#9ba5b6]">
                Esta lección no tiene contenido disponible todavía.
              </p>
            )}
          </>
        )
        }

      </main >
    </div >
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