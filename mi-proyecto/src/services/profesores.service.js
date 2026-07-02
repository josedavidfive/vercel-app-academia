import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { db } from "../config/firebase";

const obtenerIdReferencia = (referencia) => {
  if (typeof referencia === "string") {
    return referencia;
  }

  return referencia?.id || referencia?.path?.split("/").pop() || null;
};

export const getProfesorById = async (uid, email = "") => {
  if (!uid) {
    throw new Error("El UID del profesor es obligatorio.");
  }

  const profesorRef = doc(db, "profesores", uid);
  const profesorSnap = await getDoc(profesorRef);

  if (profesorSnap.exists()) {
    return {
      id: profesorSnap.id,
      ...profesorSnap.data(),
    };
  }

  const consultas = [
    query(collection(db, "profesores"), where("uid", "==", uid), limit(1)),
  ];

  if (email) {
    consultas.push(
      query(
        collection(db, "profesores"),
        where("email", "==", email.trim().toLowerCase()),
        limit(1),
      ),
    );
  }

  for (const consulta of consultas) {
    const resultado = await getDocs(consulta);
    if (!resultado.empty) {
      const documento = resultado.docs[0];
      return { id: documento.id, ...documento.data() };
    }
  }

  return null;
};

export const getProfesoresByCampus = async (campus) => {
  const campusId = obtenerIdReferencia(campus);

  if (!campusId) {
    throw new Error("El campus es obligatorio.");
  }

  const campusRef = doc(db, "campus", campusId);

  const consulta = query(
    collection(db, "profesores"),
    where("campus_id", "==", campusRef),
  );

  const profesoresSnap = await getDocs(consulta);

  return profesoresSnap.docs.map((documento) => ({
    id: documento.id,
    ...documento.data(),
  }));
};