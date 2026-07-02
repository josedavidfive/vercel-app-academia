import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";

import ProfesorNavbar from "../../components/layout/ProfesorNavbar.jsx";
import LeccionRow from "../../components/lecciones/LeccionRow.jsx";

import {
  createLeccion,
  deleteLeccion,
  getLecciones,
  updateLeccion,
} from "../../services/lecciones.service";

import { getModulos } from "../../services/modulos.service";
import { uploadLessonFiles } from "../../services/archivos.service";
import { useAuth } from "../../hooks/useAuth";

import {
  isActiveModule,
  moduleName,
  sortModules,
} from "../../utils/modulos.js";

function moduleIdFromReference(value) {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value.includes("/") ? value.split("/").pop() : value;
  }

  return value.id || value.path?.split("/").pop() || "";
}

export default function GestionLecciones() {
  const { usuario } = useAuth();
  const profesorId = usuario?.uid;
  const profesorEmail = usuario?.email;
  const [searchParams] = useSearchParams();

  const requestedModule = searchParams.get("moduloId") || "";

  const [lecciones, setLecciones] = useState([]);
  const [modulos, setModulos] = useState([]);

  const [selectedModule, setSelectedModule] = useState(requestedModule);

  const [pendingStatus, setPendingStatus] = useState({});

  const [form, setForm] = useState({
    titulo: "",
  });

  const [editingLesson, setEditingLesson] = useState(null);

  const [materialFiles, setMaterialFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!profesorId) {
      setLecciones([]);
      setModulos([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [lessonsData, modulesData] = await Promise.all([
        getLecciones(),
        getModulos(profesorId, profesorEmail),
      ]);

      const orderedModules = sortModules(modulesData);
      const allowedModuleIds = new Set(orderedModules.map((modulo) => modulo.id));
      const ownLessons = lessonsData.filter((lesson) => {
        const lessonModuleId = moduleIdFromReference(lesson.modulo_id);
        return allowedModuleIds.has(lessonModuleId) || lesson.profesor_id === profesorId;
      });

      setLecciones(ownLessons);
      setModulos(orderedModules);

      setSelectedModule(
        (currentModule) => currentModule || orderedModules[0]?.id || "",
      );
    } catch (loadError) {
      console.error("Error al cargar lecciones:", loadError);

      setError("No se pudieron cargar las lecciones.");
    } finally {
      setLoading(false);
    }
  }, [profesorEmail, profesorId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      load();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [load]);

  /*
   * ÚNICO useMemo
   *
   * Evita volver a filtrar todas las lecciones cuando cambia
   * un estado que no está relacionado con la lista visible.
   */
  const visibleLessons = useMemo(() => {
    return lecciones.filter((lesson) => {
      if (!selectedModule) {
        return true;
      }

      const lessonModuleId = moduleIdFromReference(lesson.modulo_id);

      return lessonModuleId === selectedModule;
    });
  }, [lecciones, selectedModule]);

  const selectedModuleIndex = modulos.findIndex(
    (modulo) => modulo.id === selectedModule,
  );

  const selectedModuleData =
    selectedModuleIndex >= 0 ? modulos[selectedModuleIndex] : null;

  const selectedModuleActive = selectedModuleData
    ? isActiveModule(selectedModuleData, selectedModuleIndex)
    : false;

  function lessonIsAvailable(lesson, index) {
    if (!selectedModuleActive) {
      return false;
    }

    if (Object.hasOwn(pendingStatus, lesson.id)) {
      return pendingStatus[lesson.id];
    }

    if (typeof lesson.disponible === "boolean") {
      return lesson.disponible;
    }

    return index < 3;
  }

  function toggleStatus(lesson, index) {
    if (!selectedModuleActive) {
      return;
    }

    const currentStatus = lessonIsAvailable(lesson, index);

    setPendingStatus((current) => ({
      ...current,
      [lesson.id]: !currentStatus,
    }));
  }

  async function saveStatusChanges() {
    const changes = Object.entries(pendingStatus);

    if (changes.length === 0) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await Promise.all(
        changes.map(([lessonId, disponible]) =>
          updateLeccion(lessonId, {
            disponible,
          }),
        ),
      );

      setPendingStatus({});

      await load();
    } catch (saveError) {
      console.error("Error al guardar estados:", saveError);

      setError("No se pudieron guardar los cambios.");
    } finally {
      setSaving(false);
    }
  }

  async function saveLesson(event) {
    event.preventDefault();

    const intent = event.nativeEvent.submitter?.value || "draft";

    const shouldPublish = intent === "publish" && selectedModuleActive;

    if (!form.titulo.trim()) {
      setError("El título de la lección es obligatorio.");

      return;
    }

    if (!selectedModule) {
      setError("Selecciona un módulo antes de crear la lección.");

      return;
    }

    try {
      setSaving(true);
      setError("");

      const [materialUrls, videoUrls] = await Promise.all([
        uploadLessonFiles(materialFiles, {
          moduloId: selectedModule,
          type: "materiales",
        }),

        uploadLessonFiles(videoFiles, {
          moduloId: selectedModule,
          type: "videos",
        }),
      ]);

      const previousMaterials = Array.isArray(editingLesson?.archivos_url)
        ? editingLesson.archivos_url
        : editingLesson?.contenido_url
          ? [editingLesson.contenido_url]
          : [];

      const previousVideos = Array.isArray(editingLesson?.video_url)
        ? editingLesson.video_url
        : editingLesson?.video_url
          ? [editingLesson.video_url]
          : [];

      const allMaterials = [...previousMaterials, ...materialUrls];

      const allVideos = [...previousVideos, ...videoUrls];

      const lessonData = {
        titulo: form.titulo.trim(),
        profesorId,
        disponible: shouldPublish,
        descripcion: editingLesson?.descripcion || "",
        contenido_url: allMaterials[0] || "",
        archivos_url: allMaterials,
        video_url: allVideos,
        moduloId: selectedModule,
      };

      if (editingLesson) {
        await updateLeccion(editingLesson.id, lessonData);
      } else {
        await createLeccion(lessonData);
      }

      resetForm();

      await load();
    } catch (saveError) {
      console.error("Error al guardar la lección:", saveError);

      setError(
        `No se pudo guardar la lección: ${
          saveError.message || "error desconocido"
        }`,
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ÚNICO useCallback
   *
   * Se usa porque startEditing se pasa como prop a LeccionRow,
   * que estará optimizado con React.memo.
   */
  const startEditing = useCallback((lesson) => {
    setEditingLesson(lesson);

    setForm({
      titulo: lesson.titulo || "",
    });

    setMaterialFiles([]);
    setVideoFiles([]);
    setError("");

    window.setTimeout(() => {
      document.getElementById("lesson-form")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }, []);

  async function removeLesson(lesson) {
    const confirmed = window.confirm(
      `¿Eliminar la lección “${lesson.titulo}”?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await deleteLeccion(lesson.id);

      await load();
    } catch (deleteError) {
      console.error("Error al eliminar la lección:", deleteError);

      setError("No se pudo eliminar la lección.");
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setForm({
      titulo: "",
    });

    setEditingLesson(null);
    setMaterialFiles([]);
    setVideoFiles([]);
    setError("");
  }

  function handleModuleChange(event) {
    setSelectedModule(event.target.value);
    setPendingStatus({});
    resetForm();
  }

  return (
    <div className="profesor-theme min-h-screen bg-[#0e182b] text-[#f6f7fa]">
      <ProfesorNavbar />

      <main className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12">
        <section>
          <h1 className="text-3xl font-bold sm:text-4xl">Lecciones</h1>

          <select
            aria-label="Seleccionar módulo"
            value={selectedModule}
            onChange={handleModuleChange}
            className="mt-4 min-h-10 w-full min-w-72 rounded-lg border border-[#324057] bg-[#101a2c] px-4 text-sm outline-none focus:border-[#59677e] sm:w-80"
          >
            {modulos.length === 0 && <option value="">Sin módulos</option>}

            {modulos.map((modulo, index) => (
              <option key={modulo.id} value={modulo.id}>
                Módulo {index + 1}: {moduleName(modulo)} —{" "}
                {isActiveModule(modulo, index) ? "Activo" : "Bloqueado"}
              </option>
            ))}
          </select>

          {selectedModuleData && !selectedModuleActive && (
            <div className="profesor-module-alert mt-4 w-full rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
              <p className="font-semibold">Este módulo está bloqueado.</p>

              <p className="mt-1 text-xs leading-5 text-amber-100/70 xl:whitespace-nowrap">
                Puedes guardar y editar borradores, pero no publicarlos hasta
                que se active el módulo.
              </p>
            </div>
          )}
        </section>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        <section className="mt-12" aria-label="Lecciones del módulo">
          {loading ? (
            <p className="py-14 text-center text-sm text-[#9ba5b6]">
              Cargando lecciones...
            </p>
          ) : visibleLessons.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#324057] px-5 py-12 text-center text-sm text-[#9ba5b6]">
              Este módulo todavía no tiene lecciones.
            </p>
          ) : (
            visibleLessons.map((lesson, index) => (
              <LeccionRow
                key={lesson.id}
                lesson={lesson}
                index={index}
                available={lessonIsAvailable(lesson, index)}
                moduleActive={selectedModuleActive}
                onToggle={toggleStatus}
                onEdit={startEditing}
                onDelete={removeLesson}
              />
            ))
          )}
        </section>

        <form
          id="lesson-form"
          onSubmit={saveLesson}
          className="mt-10 rounded-xl border border-[#324057] bg-[#111b2c] p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold">
              {editingLesson ? "Editar lección" : "Nueva lección"}
            </h2>

            <span
              className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase ${
                selectedModuleActive
                  ? "bg-[#063b39] text-[#00d2a1]"
                  : "bg-[#3a4659] text-[#c2cad6]"
              }`}
            >
              {selectedModuleActive ? "Módulo activo" : "Solo borradores"}
            </span>
          </div>

          <label className="mt-5 block text-xs font-semibold text-[#aab3c1]">
            Título de la lección
            <input
              value={form.titulo}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  titulo: event.target.value,
                }))
              }
              placeholder="Introducción a los Hooks"
              className="mt-2 min-h-11 w-full rounded-lg border border-[#324057] bg-[#101a2c] px-3 text-sm outline-none placeholder:text-[#8c96a7] focus:border-[#59677e]"
            />
          </label>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <label className="group flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#43516a] bg-[#101a2c] p-5 text-center transition hover:border-[#06b6d4] hover:bg-[#132038]">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="text-[#06b6d4]"
                aria-hidden="true"
              >
                <path d="M12 16V4m0 0L7 9m5-5 5 5M5 14v5h14v-5" />
              </svg>

              <span className="mt-3 text-sm font-semibold">Subir archivos</span>

              <span className="mt-1 text-[10px] text-[#8c96a7]">
                PDF, documentos, imágenes o ZIP · máximo 100 MB
              </span>

              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.zip,image/*"
                onChange={(event) =>
                  setMaterialFiles(Array.from(event.target.files || []))
                }
                className="sr-only"
              />
            </label>

            <label className="group flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#43516a] bg-[#101a2c] p-5 text-center transition hover:border-[#7c3aed] hover:bg-[#132038]">
              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="text-[#a78bfa]"
                aria-hidden="true"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />

                <path d="m10 9 5 3-5 3Z" />
              </svg>

              <span className="mt-3 text-sm font-semibold">Subir vídeos</span>

              <span className="mt-1 text-[10px] text-[#8c96a7]">
                MP4, WebM u otros formatos de vídeo · máximo 100 MB
              </span>

              <input
                type="file"
                multiple
                accept="video/*"
                onChange={(event) =>
                  setVideoFiles(Array.from(event.target.files || []))
                }
                className="sr-only"
              />
            </label>
          </div>

          {(materialFiles.length > 0 || videoFiles.length > 0) && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <SelectedFiles
                title="Archivos seleccionados"
                files={materialFiles}
              />

              <SelectedFiles title="Vídeos seleccionados" files={videoFiles} />
            </div>
          )}

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="min-h-11 rounded-lg border border-[#324057] font-semibold transition hover:bg-[#172238] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Limpiar
            </button>

            <button
              type="submit"
              value="draft"
              disabled={saving}
              className="min-h-11 rounded-lg border border-[#59677e] bg-[#202c40] font-semibold text-white transition hover:bg-[#29374f] disabled:opacity-60"
            >
              {saving
                ? "Guardando..."
                : editingLesson
                  ? "Guardar cambios"
                  : "Guardar borrador"}
            </button>

            <button
              type="submit"
              value="publish"
              disabled={saving || !selectedModuleActive}
              className="min-h-11 rounded-lg bg-[#ea292d] font-semibold text-white transition hover:bg-[#ff383b] disabled:cursor-not-allowed disabled:bg-[#465165] disabled:text-[#9ca6b5] disabled:opacity-100"
            >
              {saving ? "Subiendo recursos..." : "Publicar lección"}
            </button>
          </div>
        </form>

        <div className="mt-10 flex justify-end">
          <button
            type="button"
            onClick={saveStatusChanges}
            disabled={saving || Object.keys(pendingStatus).length === 0}
            className="min-h-10 rounded-lg bg-[#ea292d] px-5 text-sm font-bold transition hover:bg-[#ff383b] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Guardar cambios
          </button>
        </div>
      </main>
    </div>
  );
}

function SelectedFiles({ title, files }) {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-[#324057] bg-[#101a2c] p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#9ba5b6]">
        {title}
      </p>

      <ul className="mt-2 space-y-1.5">
        {files.map((file) => (
          <li
            key={`${file.name}-${file.lastModified}`}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <span className="truncate">{file.name}</span>

            <span className="shrink-0 text-[#7f8a9c]">
              {formatFileSize(file.size)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
