export const LeccionModel = {
  contenido_url: '',  // string — ruta al temario/md
  archivos_url: [],   // array de URLs de materiales en Firebase Storage
  descripcion: '',    // string
  modulo_id: null,    // reference a /modulos
  titulo: '',         // string
  video_url: [],      // array de strings — rutas o URLs de vídeos/imágenes
}
