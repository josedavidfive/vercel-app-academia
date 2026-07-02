import {
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";

function conversationId(profesorId, alumnoId) {
  return `${profesorId}__${alumnoId}`.replaceAll("/", "_");
}

export function subscribeConversation(profesorId, alumnoId, onMessages, onError) {
  if (!profesorId || !alumnoId) return () => {};

  const conversationRef = doc(db, "conversaciones", conversationId(profesorId, alumnoId));
  const messagesQuery = query(
    collection(conversationRef, "mensajes"),
    orderBy("creado_en", "asc"),
  );

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      onMessages(snapshot.docs.map((messageDoc) => ({ id: messageDoc.id, ...messageDoc.data() })));
    },
    onError,
  );
}

export async function sendProfessorMessage({ profesorId, alumno, texto }) {
  const cleanText = texto.trim();
  if (!profesorId || !alumno?.id || !cleanText) return;

  const conversationRef = doc(db, "conversaciones", conversationId(profesorId, alumno.id));
  const messageRef = doc(collection(conversationRef, "mensajes"));
  const batch = writeBatch(db);

  batch.set(
    conversationRef,
    {
      profesor_id: profesorId,
      alumno_id: alumno.id,
      alumno_nombre: alumno.nombre || "Alumno",
      alumno_email: alumno.email || "",
      ultimo_mensaje: cleanText,
      ultimo_remitente: profesorId,
      actualizado_en: serverTimestamp(),
      no_leidos_alumno: increment(1),
    },
    { merge: true },
  );

  batch.set(messageRef, {
    texto: cleanText,
    remitente_id: profesorId,
    remitente_rol: "profesor",
    creado_en: serverTimestamp(),
  });

  await batch.commit();
}

export async function sendStudentMessage({ profesorId, alumno, texto }) {
  const cleanText = texto.trim();
  if (!profesorId || !alumno?.id || !cleanText) return;

  const conversationRef = doc(db, "conversaciones", conversationId(profesorId, alumno.id));
  const messageRef = doc(collection(conversationRef, "mensajes"));
  const batch = writeBatch(db);

  batch.set(
    conversationRef,
    {
      profesor_id: profesorId,
      alumno_id: alumno.id,
      alumno_nombre: alumno.nombre || "Alumno",
      alumno_email: alumno.email || "",
      ultimo_mensaje: cleanText,
      ultimo_remitente: alumno.id,
      actualizado_en: serverTimestamp(),
      no_leidos_profesor: increment(1),
    },
    { merge: true },
  );

  batch.set(messageRef, {
    texto: cleanText,
    remitente_id: alumno.id,
    remitente_rol: "alumno",
    creado_en: serverTimestamp(),
  });

  await batch.commit();
}

export async function markProfessorConversationRead(profesorId, alumnoId) {
  if (!profesorId || !alumnoId) return;
  await setDoc(
    doc(db, "conversaciones", conversationId(profesorId, alumnoId)),
    { no_leidos_profesor: 0 },
    { merge: true },
  );
}

export function subscribeProfessorNotifications(profesorId, onChange, onError) {
  if (!profesorId) return () => {};

  const conversationsQuery = query(
    collection(db, "conversaciones"),
    where("profesor_id", "==", profesorId),
  );

  return onSnapshot(
    conversationsQuery,
    (snapshot) => {
      const conversations = snapshot.docs
        .map((conversationDoc) => ({ id: conversationDoc.id, ...conversationDoc.data() }))
        .filter((conversation) => Number(conversation.no_leidos_profesor || 0) > 0)
        .sort((a, b) => (b.actualizado_en?.seconds || 0) - (a.actualizado_en?.seconds || 0));
      onChange(conversations);
    },
    onError,
  );
}
