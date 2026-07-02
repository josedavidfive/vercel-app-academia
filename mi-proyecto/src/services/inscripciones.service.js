import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase.js";
const INSCRIPCIONES_COLLECTION = "inscripciones";
export async function getInscripciones() {
  const snapshot = await getDocs(collection(db, INSCRIPCIONES_COLLECTION));
  return snapshot.docs.map((inscripcionDoc) => ({
    id: inscripcionDoc.id,
    ...inscripcionDoc.data(),
  }));
}
export async function getInscripcionById(id) {
  if (!id) return null;
  const snapshot = await getDoc(doc(db, INSCRIPCIONES_COLLECTION, id));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}
export async function getInscripcionesByAlumno(alumnoId) {
  if (!alumnoId) return [];
  const alumnoRef = doc(db, "alumnos", alumnoId);
  const inscriptionsQuery = query(
    collection(db, INSCRIPCIONES_COLLECTION),
    where("alumno_id", "==", alumnoRef),
  );
  const snapshot = await getDocs(inscriptionsQuery);
  return snapshot.docs.map((inscripcionDoc) => ({
    id: inscripcionDoc.id,
    ...inscripcionDoc.data(),
  }));
}
export async function createInscripcion(data) {
  if (!data.alumnoId) throw new Error("El alumno es obligatorio.");
  if (!data.promocionId) throw new Error("La promoción es obligatoria.");
  const reference = await addDoc(collection(db, INSCRIPCIONES_COLLECTION), {
    alumno_id: doc(db, "alumnos", data.alumnoId),
    promocion_id: doc(db, "promociones", data.promocionId),
    fecha_inicio: data.fecha_inicio ?? null,
    fecha_fin: data.fecha_fin ?? null,
    estado: data.estado ?? "activa",
  });
  return reference.id;
}
export async function updateInscripcion(id, data) {
  if (!id) throw new Error("Falta el ID de la inscripción.");
  const changes = {};
  if (data.alumnoId !== undefined) {
    changes.alumno_id = doc(db, "alumnos", data.alumnoId);
  }
  if (data.promocionId !== undefined) {
    changes.promocion_id = doc(db, "promociones", data.promocionId);
  }
  if (data.fecha_inicio !== undefined) changes.fecha_inicio = data.fecha_inicio;
  if (data.fecha_fin !== undefined) changes.fecha_fin = data.fecha_fin;
  if (data.estado !== undefined) changes.estado = data.estado;
  await updateDoc(doc(db, INSCRIPCIONES_COLLECTION, id), changes);
}
export async function deleteInscripcion(id) {
  if (!id) throw new Error("Falta el ID de la inscripción.");
  await deleteDoc(doc(db, INSCRIPCIONES_COLLECTION, id));
}
