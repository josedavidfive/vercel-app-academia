import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../config/firebase";

const MAX_FILE_SIZE = 100 * 1024 * 1024;

function safeFileName(name) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function uploadLessonFiles(files, { moduloId, type }) {
  const fileList = Array.from(files || []);

  fileList.forEach((file) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`${file.name} supera el límite de 100 MB.`);
    }
  });

  return Promise.all(
    fileList.map(async (file) => {
      const path = `lecciones/${moduloId}/${type}/${Date.now()}-${crypto.randomUUID()}-${safeFileName(file.name)}`;
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, file, { contentType: file.type || undefined });
      return getDownloadURL(fileRef);
    }),
  );
}
