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
const PROMOCIONES_COLLECTION = "promociones";
export async function getPromociones() {
  const snapshot = await getDocs(collection(db, PROMOCIONES_COLLECTION));
  return snapshot.docs.map((promocionDoc) => ({
    id: promocionDoc.id,
    ...promocionDoc.data(),
  }));
}
export async function getPromocionById(id) {
  if (!id) return null;
  const snapshot = await getDoc(doc(db, PROMOCIONES_COLLECTION, id));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}
export async function getPromocionesByCampus(campusId) {
  if (!campusId) return [];
  const campusRef = doc(db, "campus", campusId);
  const promotionsQuery = query(
    collection(db, PROMOCIONES_COLLECTION),
    where("campus_id", "==", campusRef),
  );
  const snapshot = await getDocs(promotionsQuery);
  return snapshot.docs.map((promocionDoc) => ({
    id: promocionDoc.id,
    ...promocionDoc.data(),
  }));
}
export async function createPromocion(data) {
  const nombre = data.nombre?.trim();
  if (!nombre) throw new Error("El nombre de la promoción es obligatorio.");
  if (!data.campusId) throw new Error("El campus es obligatorio.");
  const reference = await addDoc(collection(db, PROMOCIONES_COLLECTION), {
    nombre,
    campus_id: doc(db, "campus", data.campusId),
    fecha_inicio: data.fecha_inicio ?? null,
    fecha_fin: data.fecha_fin ?? null,
    alumnos_id: Array.isArray(data.alumnos_id) ? data.alumnos_id : [],
    profesores_id: Array.isArray(data.profesores_id) ? data.profesores_id : [],
  });
  return reference.id;
}
export async function updatePromocion(id, data) {
  if (!id) throw new Error("Falta el ID de la promoción.");
  const changes = {};
  if (data.nombre !== undefined) {
    const nombre = data.nombre.trim();
    if (!nombre) throw new Error("El nombre de la promoción es obligatorio.");
    changes.nombre = nombre;
  }
  if (data.campusId !== undefined) {
    changes.campus_id = doc(db, "campus", data.campusId);
  }
  if (data.fecha_inicio !== undefined) changes.fecha_inicio = data.fecha_inicio;
  if (data.fecha_fin !== undefined) changes.fecha_fin = data.fecha_fin;
  if (data.alumnos_id !== undefined) changes.alumnos_id = data.alumnos_id;
  if (data.profesores_id !== undefined)
    changes.profesores_id = data.profesores_id;
  await updateDoc(doc(db, PROMOCIONES_COLLECTION, id), changes);
}
export async function deletePromocion(id) {
  if (!id) throw new Error("Falta el ID de la promoción.");
  await deleteDoc(doc(db, PROMOCIONES_COLLECTION, id));
}
