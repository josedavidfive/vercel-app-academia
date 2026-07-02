import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import Navbar from "../../components/layout/Navbar.jsx";
import { getAlumnosByProfesor } from "../../services/alumnos.service";

export default function SeguimientoProfesor() {
  const { usuario, cargando } = useAuth();

  const [alumnos, setAlumnos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargandoAlumnos, setCargandoAlumnos] = useState(true);
  const [error, setError] = useState("");

  const profesorId = usuario?.uid;

  useEffect(() => {
    const cargarAlumnos = async () => {
      if (!profesorId) {
        setCargandoAlumnos(false);
        return;
      }

      try {
        setCargandoAlumnos(true);
        setError("");

        const datos = await getAlumnosByProfesor(profesorId);
        setAlumnos(datos);
      } catch (error) {
        console.error("Error al cargar alumnos:", error);
        setError("No se pudieron cargar los alumnos.");
      } finally {
        setCargandoAlumnos(false);
      }
    };

    cargarAlumnos();
  }, [profesorId]);

  const alumnosFiltrados = alumnos.filter((alumno) =>
    alumno.nombre?.toLowerCase().includes(busqueda.toLowerCase()),
  );

  if (cargando) return <p>Comprobando sesión...</p>;

  if (!usuario) {
    return (
      <div>
        <Navbar />
        <main>
          <p>Debes iniciar sesión para acceder al seguimiento.</p>
        </main>
      </div>
    );
  }

  if (cargandoAlumnos) return <p>Cargando alumnos...</p>;

  return (
    <div>
      <Navbar role="profesor" />

      <main>
        <section>
          <h1>Seguimiento de alumnos</h1>
          <p>Consulta el progreso y el estado de los alumnos.</p>

          <input
            type="search"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar alumno..."
          />
        </section>

        {error && <p>{error}</p>}

        <section>
          <h2>Lista de alumnos</h2>

          {alumnosFiltrados.length === 0 ? (
            <p>No se encontraron alumnos.</p>
          ) : (
            <ul>
              {alumnosFiltrados.map((alumno) => (
                <li key={alumno.id}>
                  <h3>{alumno.nombre}</h3>
                  <p>{alumno.email}</p>
                  <p>Progreso: {alumno.progreso ?? 0}%</p>
                  <p>Estado: {alumno.estado ?? "Sin estado"}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
