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

  if (data.estado !== undefined) changes.estado = data.estado;


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

export async function getModulosByPromocionActivos(promocionRef) {
  const promocionSnap = await getDoc(promocionRef);
  if (!promocionSnap.exists()) return [];

  const data = promocionSnap.data();
  let modulosRefs = [];

  // Estructura antigua: promocion.modulo = [{modulo_id, isActive}]
  if (data.modulo && Array.isArray(data.modulo) && data.modulo.length > 0) {
    modulosRefs = data.modulo
      .filter(m => m.modulo_id || m.modulos_id)
      .map(m => m.modulo_id || m.modulos_id);

    // Estructura nueva: va por campus_id
  } else if (data.campus_id) {
    const campusRef = Array.isArray(data.campus_id)
      ? data.campus_id[0]
      : data.campus_id;
    if (!campusRef) return [];

    const campusSnap = await getDoc(campusRef);
    if (!campusSnap.exists()) return [];

    modulosRefs = campusSnap.data().modulos || [];
  }

  if (modulosRefs.length === 0) return [];

  const modulos = await Promise.all(modulosRefs.map(ref => getDoc(ref)));

  return modulos
    .filter(s => s.exists() && s.data().estado === "activo")
    .map(s => ({ id: s.id, ...s.data() }));
}

export async function getModulosByPromocionTodos(promocionRef) {
  const promocionSnap = await getDoc(promocionRef);
  if (!promocionSnap.exists()) return [];

  const data = promocionSnap.data();
  let modulosRefs = [];

  if (data.modulo && Array.isArray(data.modulo) && data.modulo.length > 0) {
    modulosRefs = data.modulo
      .filter(m => m.modulo_id || m.modulos_id)
      .map(m => m.modulo_id || m.modulos_id);
  } else if (data.campus_id) {
    const campusRef = Array.isArray(data.campus_id) ? data.campus_id[0] : data.campus_id;
    if (!campusRef) return [];
    const campusSnap = await getDoc(campusRef);
    if (!campusSnap.exists()) return [];
    modulosRefs = campusSnap.data().modulos || [];
  }

  if (modulosRefs.length === 0) return [];

  const modulos = await Promise.all(modulosRefs.map(ref => getDoc(ref)));
  return modulos
    .filter(s => s.exists())
    .map(s => ({ id: s.id, ...s.data() }));
}

// Deprecated
export async function getModulosByPromocion(promocionRef) {
  const promocionSnap = await getDoc(promocionRef);
  if (!promocionSnap.exists()) return [];

  const data = promocionSnap.data();
  console.log("Promocion data completa:", data);
  console.log("Campo modulo:", data.modulo);

  const moduloMaps = data.modulo || [];
  console.log("moduloMaps length:", moduloMaps.length);
  console.log("primer map:", moduloMaps[0]);

  const modulos = await Promise.all(
    moduloMaps
      .filter(m => m.modulo_id)
      .map(m => getDoc(m.modulo_id))
  );

  console.log("modulos resueltos:", modulos.map(s => ({ exists: s.exists(), id: s.id })));

  return modulos
    .filter(s => s.exists())
    .map(s => ({ id: s.id, ...s.data() }));
}