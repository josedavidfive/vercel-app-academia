import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import ProfesorNavbar from "../../components/layout/ProfesorNavbar.jsx";
import { useAuth } from "../../hooks/useAuth";
import { getModulos } from "../../services/modulos.service";
import {
  getLeccionesByModulo,
  deleteLeccion,
} from "../../services/lecciones.service";

export default function ContenidosProfesor() {
  const { usuario, cargando: authLoading } = useAuth();
  const profesorId = usuario?.uid;
  const profesorEmail = usuario?.email;
  const [modulos, setModulos] = useState([]);
  const [leccionesMap, setLeccionesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargarContenidos = useCallback(async () => {
    if (!profesorId) {
      setLoading(false);
      return;
    }

    try {
      const modulosData = await getModulos(profesorId, profesorEmail);
      setModulos(modulosData);

      const entries = await Promise.all(
        modulosData.map(async (modulo) => {
          const lecciones = await getLeccionesByModulo(modulo.id);
          return [modulo.id, lecciones];
        }),
      );

      setLeccionesMap(Object.fromEntries(entries));
    } catch (error) {
      console.error("Error al cargar contenidos:", error);
      setError("No se pudieron cargar los contenidos.");
    } finally {
      setLoading(false);
    }
  }, [profesorEmail, profesorId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(cargarContenidos, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [cargarContenidos]);

  const handleDeleteLeccion = async (leccionId) => {
    const confirmar = window.confirm(
      "¿Seguro que quieres eliminar esta lección?",
    );

    if (!confirmar) return;

    try {
      await deleteLeccion(leccionId);
      await cargarContenidos();
    } catch (error) {
      console.error("Error al eliminar lección:", error);
      setError("No se pudo eliminar la lección.");
    }
  };

  if (authLoading || loading) return <p>Cargando contenidos...</p>;

  return (
    <div>
      <ProfesorNavbar />

      <main>
        <h1>Contenidos del curso</h1>

        {error && <p>{error}</p>}

        {modulos.length === 0 ? (
          <section>
            <p>No hay módulos creados todavía.</p>
            <Link to="/profesor/modulos">Ver módulos</Link>
          </section>
        ) : (
          <section>
            {modulos.map((modulo, indice) => {
              const lecciones = leccionesMap[modulo.id] || [];

              return (
                <article key={modulo.id}>
                  <h2>
                    {String(indice + 1).padStart(2, "0")} — {modulo.nombre}
                  </h2>

                  <p>
                    {modulo.horas || 0} horas · {lecciones.length}{" "}
                    {lecciones.length === 1 ? "lección" : "lecciones"}
                  </p>

                  <Link to={`/profesor/lecciones?moduloId=${modulo.id}`}>
                    Añadir lección
                  </Link>

                  {lecciones.length === 0 ? (
                    <p>Este módulo todavía no tiene lecciones.</p>
                  ) : (
                    <ul>
                      {lecciones.map((leccion) => (
                        <li key={leccion.id}>
                          <h3>{leccion.titulo}</h3>
                          {leccion.descripcion && <p>{leccion.descripcion}</p>}
                          {leccion.contenido_url && (
                            <p>Contenido: {leccion.contenido_url}</p>
                          )}
                          {Array.isArray(leccion.video_url) &&
                            leccion.video_url.length > 0 && (
                              <p>Vídeos: {leccion.video_url.length}</p>
                            )}
                          <Link
                            to="/profesor/lecciones"
                            state={{ editId: leccion.id }}
                          >
                            Modificar
                          </Link>{" "}
                          <button
                            type="button"
                            onClick={() => handleDeleteLeccion(leccion.id)}
                          >
                            Eliminar
                          </button>
                        </li>
                      ))}
                    </ul>
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
