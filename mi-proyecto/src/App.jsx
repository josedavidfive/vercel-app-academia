import { Navigate, Route, Routes } from "react-router";
import { useAuth } from "./hooks/useAuth";
import PrivateRoute from "./routes/PrivateRoute";

import Home from "./pages/Home";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AlumnoDashboard from "./pages/alumno/AlumnoDashboard";
import VerLeccion from "./pages/alumno/VerLeccion";
import VerLecciones from "./pages/alumno/VerLecciones";

import GestionAlumnos from "./pages/admin/GestionAlumnos";
import GestionCampus from "./pages/admin/GestionCampus";
import GestionInscripciones from "./pages/admin/GestionInscripciones";
import GestionModulos from "./pages/admin/GestionModulos";
import GestionProfesores from "./pages/admin/GestionProfesores";
import GestionPromociones from "./pages/admin/GestionPromociones";
import { AdminLayout } from "./pages/layouts/AdminLayout";
import GestionLecciones from "./pages/profesor/GestionLecciones";
import ProfesorDashboard from "./pages/profesor/ProfesorDashboard";
import SeguimientoProfesor from "./pages/profesor/SeguimientoProfesor";


function App() {
  const { cargando } = useAuth();

  if (cargando) return <p>Cargando...</p>;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />

      {/* ALUMNO */}
      <Route path="/alumno" element={
        <PrivateRoute allowedRoles={["alumno"]}>
          <AlumnoDashboard />
        </PrivateRoute>
      } />
      <Route path="/alumno/:moduloId" element={
        <PrivateRoute allowedRoles={["alumno"]}>
          <VerLecciones />
        </PrivateRoute>
      } />
      <Route path="/alumno/:moduloId/:leccionId" element={
        <PrivateRoute allowedRoles={["alumno"]}>
          <VerLeccion />
        </PrivateRoute>
      } />

      {/* PROFESOR */}
      <Route path="/profesor" element={
        <PrivateRoute allowedRoles={["profesor", "admin"]}>
          <ProfesorDashboard />
        </PrivateRoute>
      } />
      <Route path="/profesor/lecciones" element={
        <PrivateRoute allowedRoles={["profesor", "admin"]}>
          <GestionLecciones />
        </PrivateRoute>
      } />
      <Route path="/profesor/seguimiento" element={
        <PrivateRoute allowedRoles={["profesor", "admin"]}>
          <SeguimientoProfesor />
        </PrivateRoute>
      } />

      {/* ADMIN */}
      <Route path="admin" element={
        <PrivateRoute allowedRoles={["admin"]}>
          <AdminLayout />
        </PrivateRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="alumnos" element={<GestionAlumnos />} />
        <Route path="inscripciones" element={<GestionInscripciones />} />
        <Route path="profesores" element={<GestionProfesores />} />
        <Route path="promociones" element={<GestionPromociones />} />
        <Route path="modulos" element={<GestionModulos />} />
        <Route path="campus" element={<GestionCampus />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;