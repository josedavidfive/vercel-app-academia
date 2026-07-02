import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export const getAlumnosByProfesor = async (profesorId) => {
  if (!profesorId) {
    return [];
  }

  const snap = await getDocs(collection(db, "alumnos"));
  const alumnos = snap.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));

  const asignados = alumnos.filter((alumno) => {
    const referencia = alumno.profesor_id;
    if (!referencia) return false;
    if (typeof referencia === "string") {
      return referencia === profesorId || referencia.split("/").pop() === profesorId;
    }
    return referencia.id === profesorId || referencia.path?.split("/").pop() === profesorId;
  });

  return asignados.length > 0 ? asignados : alumnos;
};
