import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
export async function getModulos() {
  const snapshot = await getDocs(collection(db, "modulos"));
  return snapshot.docs
    .map((moduloDoc) => ({
      id: moduloDoc.id,
      ...moduloDoc.data(),
    }))
    .sort((a, b) => {
      if (a.orden === undefined && b.orden === undefined) return 0;
      if (a.orden === undefined) return 1;
      if (b.orden === undefined) return -1;
      return Number(a.orden) - Number(b.orden);
    });
}
export async function getModuloById(id) {
  if (!id) return null;
  const snapshot = await getDoc(doc(db, "modulos", id));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}
export async function createModulo(data) {
  const nombre = data.nombre?.trim();
  const horas = Number(data.horas ?? 0);
  if (!nombre) throw new Error("El nombre del módulo es obligatorio.");
  if (Number.isNaN(horas) || horas < 0) {
    throw new Error("Las horas deben ser un número igual o mayor que cero.");
  }
  const reference = await addDoc(collection(db, "modulos"), {
    nombre,
    horas,
    lecciones_id: [],
  });
  return reference.id;
}
export async function updateModulo(id, data) {
  if (!id) throw new Error("Falta el ID del módulo.");
  const changes = {};
  if (data.nombre !== undefined) {
    const nombre = data.nombre.trim();
    if (!nombre) throw new Error("El nombre del módulo es obligatorio.");
    changes.nombre = nombre;
  }
  if (data.horas !== undefined) {
    const horas = Number(data.horas);
    if (Number.isNaN(horas) || horas < 0) {
      throw new Error("Las horas deben ser un número igual o mayor que cero.");
    }
    changes.horas = horas;
  }
  await updateDoc(doc(db, "modulos", id), changes);
}
export async function deleteModulo(id) {
  const moduleRef = doc(db, "modulos", id);
  const snapshot = await getDoc(moduleRef);
  if (!snapshot.exists()) return;
  const lessons = snapshot.data().lecciones_id;
  if (Array.isArray(lessons) && lessons.length > 0) {
    throw new Error("No se puede eliminar un módulo que contiene lecciones.");
  }
  await deleteDoc(moduleRef);
}
