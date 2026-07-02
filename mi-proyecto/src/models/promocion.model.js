import { Timestamp } from 'firebase/firestore'

export const PromocionModel = {
  alumnos_id: [],          // array de references a /alumnos
  campus_id: null,         // reference a /campus
  fechaFin: null,          // null o timestamp
  fechaInicio: Timestamp.now(), // timestamp
  nombre: "",              // string
  profesores_id: [],       // array de references a /profesores
}