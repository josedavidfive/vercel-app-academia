import { Timestamp } from "firebase/firestore";

export const InscripcionModel = {
  aceptada: false, // boolean
  actualizadoEn: Timestamp.now(), // timestamp
  apellido: "", // string
  campus_id: null, // reference a /campus
  creadoEn: Timestamp.now(), // timestamp
  email: "", // string
  nombre: "", // string
  observaciones: "", // string
};
