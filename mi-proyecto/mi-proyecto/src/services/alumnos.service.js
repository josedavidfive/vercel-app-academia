import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";

export const getAlumnosByProfesor = async (profesorId) => {
  if (!profesorId) {
    return [];
  }

  const consulta = query(
    collection(db, "alumnos"),
    where("profesor_id", "==", profesorId),
  );

  const snap = await getDocs(consulta);

  return snap.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
};
