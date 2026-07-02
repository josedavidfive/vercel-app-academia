import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

const COLLECTION_NAME = "admins";

const adminsRef = collection(db, COLLECTION_NAME);

export async function getAdmins() {
  const q = query(adminsRef, orderBy("nombre", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
}

export async function getAdminById(id) {
  if (!id) {
    throw new Error("El id del administrador es obligatorio.");
  }

  const adminRef = doc(db, COLLECTION_NAME, id);
  const snapshot = await getDoc(adminRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function createAdmin(id, data) {
  if (!id) {
    throw new Error("El id del administrador es obligatorio.");
  }

  if (!data?.nombre?.trim()) {
    throw new Error("El nombre del administrador es obligatorio.");
  }

  if (!data?.email?.trim()) {
    throw new Error("El email del administrador es obligatorio.");
  }

  const adminRef = doc(db, COLLECTION_NAME, id);

  const adminData = {
    nombre: data.nombre.trim(),
    apellidos: data.apellidos?.trim() || "",
    email: data.email.trim().toLowerCase(),
    rol: "admin",
    activo: data.activo ?? true,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  };

  await setDoc(adminRef, adminData);

  return {
    id,
    ...adminData,
  };
}

export async function updateAdmin(id, data) {
  if (!id) {
    throw new Error("El id del administrador es obligatorio.");
  }

  const adminRef = doc(db, COLLECTION_NAME, id);

  const adminData = {
    actualizadoEn: serverTimestamp(),
  };

  if (data.nombre !== undefined) {
    adminData.nombre = data.nombre.trim();
  }

  if (data.apellidos !== undefined) {
    adminData.apellidos = data.apellidos.trim();
  }

  if (data.email !== undefined) {
    adminData.email = data.email.trim().toLowerCase();
  }

  if (data.activo !== undefined) {
    adminData.activo = data.activo;
  }

  await updateDoc(adminRef, adminData);

  return {
    id,
    ...adminData,
  };
}

export async function deleteAdmin(id) {
  if (!id) {
    throw new Error("El id del administrador es obligatorio.");
  }

  const adminRef = doc(db, COLLECTION_NAME, id);

  await deleteDoc(adminRef);

  return id;
}
