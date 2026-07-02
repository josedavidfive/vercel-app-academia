import { Timestamp } from 'firebase/firestore'

export const PromocionModel = {
  alumnos_id: [],        // array de references a /alumnos
  campus_id: null,       // reference a /campus
  fechaFin: null,        // null por defecto, timestamp cuando se asigne
  fechaInicio: Timestamp.now(), // timestamp
  nombre: '',            // string
  profesor_id: [],       // array de maps { isActive: boolean, profesor_id: reference }
}