import { Routes, Route } from "react-router";
import { useAuth } from "./hooks/useAuth";
import PrivateRoute from "./routes/PrivateRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Cursos from "./pages/Cursos";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AlumnoDashboard from "./pages/alumno/AlumnoDashboard";

import ProfesorDashboard from "./pages/profesor/ProfesorDashboard";
import GestionModulos from "./pages/profesor/GestionModulos";
import GestionLecciones from "./pages/profesor/GestionLecciones";
import ContenidosProfesor from "./pages/profesor/ContenidosProfesor";
import SeguimientoProfesor from "./pages/profesor/SeguimientoProfesor";

function App() {
  const { cargando } = useAuth();

  if (cargando) {
    return <p>Cargando...</p>;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/cursos" element={<Cursos />} />

      <Route path="/login" element={<Login />} />

      <Route path="/admin" element={<AdminDashboard />} />

      <Route path="/alumno" element={<AlumnoDashboard />} />

      <Route
        path="/profesor"
        element={
          <PrivateRoute allowedRoles={["profesor", "admin"]}>
            <ProfesorDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/profesor/contenidos"
        element={
          <PrivateRoute allowedRoles={["profesor", "admin"]}>
            <ContenidosProfesor />
          </PrivateRoute>
        }
      />
      <Route
        path="/profesor/modulos"
        element={
          <PrivateRoute allowedRoles={["profesor", "admin"]}>
            <GestionModulos />
          </PrivateRoute>
        }
      />
      <Route
        path="/profesor/lecciones"
        element={
          <PrivateRoute allowedRoles={["profesor", "admin"]}>
            <GestionLecciones />
          </PrivateRoute>
        }
      />
      <Route
        path="/profesor/seguimiento"
        element={
          <PrivateRoute allowedRoles={["profesor", "admin"]}>
            <SeguimientoProfesor />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<h1>Página no encontrada</h1>} />
    </Routes>
  );
}

export default App;
