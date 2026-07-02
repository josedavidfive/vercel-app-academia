import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase.js";

const CAMPUS_COLLECTION = "campus";
export async function getCampus() {
  const snapshot = await getDocs(collection(db, CAMPUS_COLLECTION));
  return snapshot.docs.map((campusDoc) => ({
    id: campusDoc.id,
    ...campusDoc.data(),
  }));
}
export async function getCampusById(id) {
  if (!id) return null;
  const snapshot = await getDoc(doc(db, CAMPUS_COLLECTION, id));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}
export async function createCampus(data) {
  const nombre = data.nombre?.trim();
  if (!nombre) throw new Error("El nombre del campus es obligatorio.");
  const reference = await addDoc(collection(db, CAMPUS_COLLECTION), {
    nombre,
    direccion: data.direccion?.trim() ?? "",
    ciudad: data.ciudad?.trim() ?? "",
  });
  return reference.id;
}
export async function updateCampus(id, data) {
  if (!id) throw new Error("Falta el ID del campus.");
  const changes = {};
  if (data.nombre !== undefined) {
    const nombre = data.nombre.trim();
    if (!nombre) throw new Error("El nombre del campus es obligatorio.");
    changes.nombre = nombre;
  }
  if (data.direccion !== undefined) changes.direccion = data.direccion.trim();
  if (data.ciudad !== undefined) changes.ciudad = data.ciudad.trim();
  await updateDoc(doc(db, CAMPUS_COLLECTION, id), changes);
}
export async function deleteCampus(id) {
  if (!id) throw new Error("Falta el ID del campus.");
  await deleteDoc(doc(db, CAMPUS_COLLECTION, id));
}
