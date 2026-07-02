import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const COLECCIONES = [
  { coleccion: "admins", rol: "admin" },
  { coleccion: "profesores", rol: "profesor" },
  { coleccion: "alumnos", rol: "alumno" },
];

export async function buscarRolPorUid(uid) {
  if (!uid) {
    return null;
  }

  for (const { coleccion, rol } of COLECCIONES) {
    const referencia = doc(db, coleccion, uid);
    const snap = await getDoc(referencia);

    if (snap.exists()) {
      return rol;
    }
  }

  return null;
}
