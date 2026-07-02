import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase.js";

function getModuloIdFromRef(value) {
  if (!value) return "";
  if (typeof value === "string") return value.includes("/") ? value.split("/").pop() : value;
  return value.id || value.path?.split("/").pop() || "";
}

function getModuloRef(value) {
  const moduloId = getModuloIdFromRef(value);
  return moduloId ? doc(db, "modulos", moduloId) : null;
}

function normalizeVideos(value) {
  if (Array.isArray(value)) {
    return value.map((url) => String(url).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\n|,/)
      .map((url) => url.trim())
      .filter(Boolean);
  }
  return [];
}
export async function getLecciones() {
  const snapshot = await getDocs(collection(db, "lecciones"));
  return snapshot.docs.map((lessonDoc) => ({
    id: lessonDoc.id,
    ...lessonDoc.data(),
  }));
}
export async function getLeccionById(id) {
  if (!id) return null;
  const snapshot = await getDoc(doc(db, "lecciones", id));
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}
export async function getLeccionesByModulo(moduloId) {
  if (!moduloId) return [];
  const moduleRef = doc(db, "modulos", moduloId);
  const leccionesRef = collection(db, "lecciones");
  const [referenceSnapshot, stringSnapshot] = await Promise.all([
    getDocs(query(leccionesRef, where("modulo_id", "==", moduleRef))),
    getDocs(query(leccionesRef, where("modulo_id", "==", moduloId))),
  ]);

  const lecciones = new Map();

  [...referenceSnapshot.docs, ...stringSnapshot.docs].forEach((lessonDoc) => {
    lecciones.set(lessonDoc.id, {
      id: lessonDoc.id,
      ...lessonDoc.data(),
    });
  });

  return [...lecciones.values()].filter(
    (leccion) => getModuloIdFromRef(leccion.modulo_id) === moduloId,
  );
}
export async function createLeccion(data) {
  const titulo = data.titulo?.trim();
  if (!titulo) throw new Error("El título de la lección es obligatorio.");
  if (!data.moduloId) throw new Error("El módulo es obligatorio.");
  const lessonRef = doc(collection(db, "lecciones"));
  const moduleRef = doc(db, "modulos", data.moduloId);
  const batch = writeBatch(db);
  batch.set(lessonRef, {
    titulo,
    descripcion: data.descripcion?.trim() ?? "",
    contenido_url: data.contenido_url?.trim() ?? "",
    video_url: normalizeVideos(data.video_url),
    modulo_id: moduleRef,
  });
  batch.update(moduleRef, {
    lecciones_id: arrayUnion(lessonRef),
  });
  await batch.commit();
  return lessonRef.id;
}
export async function updateLeccion(id, data) {
  if (!id) throw new Error("Falta el ID de la lección.");
  const lessonRef = doc(db, "lecciones", id);
  const snapshot = await getDoc(lessonRef);
  if (!snapshot.exists()) throw new Error("La lección no existe.");
  const previous = snapshot.data();
  const oldModuleRef = getModuloRef(previous.modulo_id);
  const newModuleRef = data.moduloId
    ? doc(db, "modulos", data.moduloId)
    : oldModuleRef;
  const changes = {};
  if (data.titulo !== undefined) {
    const titulo = data.titulo.trim();
    if (!titulo) throw new Error("El título de la lección es obligatorio.");
    changes.titulo = titulo;
  }
  if (data.descripcion !== undefined)
    changes.descripcion = data.descripcion.trim();
  if (data.contenido_url !== undefined)
    changes.contenido_url = data.contenido_url.trim();
  if (data.video_url !== undefined)
    changes.video_url = normalizeVideos(data.video_url);
  if (newModuleRef) changes.modulo_id = newModuleRef;
  const batch = writeBatch(db);
  batch.update(lessonRef, changes);
  if (oldModuleRef?.path !== newModuleRef?.path) {
    if (oldModuleRef) {
      batch.update(oldModuleRef, { lecciones_id: arrayRemove(lessonRef) });
    }
    if (newModuleRef) {
      batch.update(newModuleRef, { lecciones_id: arrayUnion(lessonRef) });
    }
  }
  await batch.commit();
}
export async function deleteLeccion(id) {
  if (!id) throw new Error("Falta el ID de la lección.");
  const lessonRef = doc(db, "lecciones", id);
  const snapshot = await getDoc(lessonRef);
  if (!snapshot.exists()) return;
  const moduleRef = getModuloRef(snapshot.data().modulo_id);
  const batch = writeBatch(db);
  batch.delete(lessonRef);
  if (moduleRef) {
    batch.update(moduleRef, {
      lecciones_id: arrayRemove(lessonRef),
    });
  }
  await batch.commit();
}
