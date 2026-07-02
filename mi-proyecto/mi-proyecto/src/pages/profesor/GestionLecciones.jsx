import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router";
import Navbar from "../../components/layout/Navbar.jsx";
import Modal from "../../components/ui/Modal.jsx";
import {
  getLecciones,
  createLeccion,
  updateLeccion,
  deleteLeccion,
} from "../../services/lecciones.service";
import { getModulos } from "../../services/modulos.service";

const EMPTY_FORM = {
  titulo: "",
  descripcion: "",
  contenido_url: "",
  video_url: "",
  moduloId: "",
};

const getModuloIdFromRef = (referencia) => {
  if (!referencia) {
    return "";
  }

  if (typeof referencia === "string") {
    return referencia;
  }

  return referencia?.id || referencia?.path?.split("/").pop() || "";
};

const getNumeroVideos = (videoUrl) => {
  if (Array.isArray(videoUrl)) {
    return videoUrl.filter(Boolean).length;
  }

  if (typeof videoUrl === "string" && videoUrl.trim()) {
    return 1;
  }

  return 0;
};

export default function GestionLecciones() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const moduloIdParam = searchParams.get("moduloId") || "";
  const editIdParam = location.state?.editId || "";

  const [lecciones, setLecciones] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    moduloId: moduloIdParam,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pageError, setPageError] = useState("");

  const [filtroModulo, setFiltroModulo] = useState(moduloIdParam);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setPageError("");

      const [leccionesData, modulosData] = await Promise.all([
        getLecciones(),
        getModulos(),
      ]);

      setLecciones(leccionesData);
      setModulos(modulosData);

      return leccionesData;
    } catch (loadError) {
      console.error("Error al cargar lecciones:", loadError);
      setPageError("No se pudieron cargar las lecciones.");

      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const openEdit = useCallback((leccion) => {
    setEditTarget(leccion);

    setForm({
      titulo: leccion.titulo || "",
      descripcion: leccion.descripcion || "",
      contenido_url: leccion.contenido_url || "",
      video_url: Array.isArray(leccion.video_url)
        ? leccion.video_url.join("\n")
        : leccion.video_url || "",
      moduloId: getModuloIdFromRef(leccion.modulo_id),
    });

    setError("");
    setShowModal(true);
  }, []);

  useEffect(() => {
    const cargarDatos = async () => {
      const leccionesData = await load();

      if (editIdParam) {
        const leccionParaEditar = leccionesData.find(
          (leccion) => leccion.id === editIdParam,
        );

        if (leccionParaEditar) {
          openEdit(leccionParaEditar);
        }
      }
    };

    cargarDatos();
  }, [editIdParam, load, openEdit]);

  const getNombreModulo = (leccion) => {
    const moduloId = getModuloIdFromRef(leccion.modulo_id);

    return (
      modulos.find((modulo) => modulo.id === moduloId)?.nombre || "Sin módulo"
    );
  };

  const textoBusqueda = search.trim().toLowerCase();

  const leccionesFiltradas = lecciones.filter((leccion) => {
    const moduloId = getModuloIdFromRef(leccion.modulo_id);

    const coincideModulo = !filtroModulo || moduloId === filtroModulo;

    const coincideBusqueda =
      !textoBusqueda ||
      leccion.titulo?.toLowerCase().includes(textoBusqueda) ||
      leccion.descripcion?.toLowerCase().includes(textoBusqueda);

    return coincideModulo && coincideBusqueda;
  });

  const nombreModuloFiltrado = filtroModulo
    ? modulos.find((modulo) => modulo.id === filtroModulo)?.nombre || "módulo"
    : "";

  const openCreate = () => {
    setEditTarget(null);

    setForm({
      ...EMPTY_FORM,
      moduloId: filtroModulo || moduloIdParam,
    });

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditTarget(null);
    setError("");

    setForm({
      ...EMPTY_FORM,
      moduloId: filtroModulo || moduloIdParam,
    });
  };

  const handleSubmit = async () => {
    setError("");

    if (!form.titulo.trim()) {
      setError("El título es obligatorio.");
      return;
    }

    if (!form.moduloId) {
      setError("Selecciona un módulo.");
      return;
    }

    const videos = form.video_url
      .split("\n")
      .map((video) => video.trim())
      .filter(Boolean);

    const datosLeccion = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion.trim(),
      contenido_url: form.contenido_url.trim(),
      video_url: videos,
      moduloId: form.moduloId,
    };

    try {
      setSaving(true);

      if (editTarget) {
        await updateLeccion(editTarget.id, datosLeccion);
      } else {
        await createLeccion(datosLeccion, form.moduloId);
      }

      setShowModal(false);
      setEditTarget(null);
      setError("");

      setForm({
        ...EMPTY_FORM,
        moduloId: filtroModulo || moduloIdParam,
      });

      await load();
    } catch (saveError) {
      console.error("Error al guardar la lección:", saveError);
      setError(`Error al guardar: ${saveError.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await deleteLeccion(deleteTarget.id);

      setDeleteTarget(null);
      await load();
    } catch (deleteError) {
      console.error("Error al eliminar la lección:", deleteError);
      setError(`Error al eliminar: ${deleteError.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] font-[Montserrat] text-[#f8fafc]">
      <Navbar role="profesor" />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <nav
          aria-label="Ruta de navegación"
          className="mb-8 flex flex-wrap items-center gap-2 text-sm text-[#64748b]"
        >
          <Link
            to="/profesor"
            className="transition hover:text-[#06b6d4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06b6d4]"
          >
            Dashboard
          </Link>

          <span aria-hidden="true">/</span>

          <Link
            to="/profesor/modulos"
            className="transition hover:text-[#06b6d4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06b6d4]"
          >
            Módulos
          </Link>

          <span aria-hidden="true">/</span>

          <span className="font-medium text-[#f8fafc]">Lecciones</span>
        </nav>

        <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7c3aed]">
              Contenidos
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Gestión de lecciones
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#94a3b8] sm:text-base">
              Añade, modifica o elimina contenido dentro de los módulos
              existentes.
            </p>

            <p className="mt-3 text-sm text-[#64748b]">
              <span className="font-semibold text-[#06b6d4]">
                {leccionesFiltradas.length}
              </span>{" "}
              {leccionesFiltradas.length === 1 ? "lección" : "lecciones"}
              {filtroModulo ? ` en ${nombreModuloFiltrado}` : " en total"}
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#e53935] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/10 transition hover:bg-[#c62828] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f172a]"
          >
            <span className="mr-2 text-lg leading-none" aria-hidden="true">
              +
            </span>
            Nueva lección
          </button>
        </header>

        <section
          aria-label="Filtros de lecciones"
          className="mb-6 grid gap-3 rounded-2xl border border-[#1f2937] bg-[#111827] p-4 shadow-xl shadow-black/5 sm:grid-cols-[minmax(0,1fr)_260px]"
        >
          <div>
            <label
              htmlFor="buscar-leccion"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#94a3b8]"
            >
              Buscar lección
            </label>

            <div className="relative">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#64748b]"
              >
                ⌕
              </span>

              <input
                id="buscar-leccion"
                type="search"
                placeholder="Buscar por título o descripción"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="min-h-11 w-full rounded-lg border border-[#334155] bg-[#0f172a] py-2.5 pl-11 pr-4 text-sm text-[#f8fafc] outline-none transition placeholder:text-[#64748b] hover:border-[#475569] focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="filtrar-modulo"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#94a3b8]"
            >
              Filtrar por módulo
            </label>

            <select
              id="filtrar-modulo"
              value={filtroModulo}
              onChange={(event) => setFiltroModulo(event.target.value)}
              className="min-h-11 w-full rounded-lg border border-[#334155] bg-[#0f172a] px-4 py-2.5 text-sm text-[#f8fafc] outline-none transition hover:border-[#475569] focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
            >
              <option value="">Todos los módulos</option>

              {modulos.map((modulo) => (
                <option key={modulo.id} value={modulo.id}>
                  {modulo.nombre}
                </option>
              ))}
            </select>
          </div>
        </section>

        {loading ? (
          <LoadingState />
        ) : pageError ? (
          <PageError message={pageError} onRetry={load} />
        ) : leccionesFiltradas.length === 0 ? (
          <EmptyState
            onAdd={openCreate}
            hasFilters={Boolean(search || filtroModulo)}
            onClearFilters={() => {
              setSearch("");
              setFiltroModulo("");
            }}
          />
        ) : (
          <section aria-label="Listado de lecciones">
            <div className="overflow-x-auto rounded-2xl border border-[#1f2937] bg-[#111827] shadow-xl shadow-black/10">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="border-b border-[#1f2937] bg-[#0b1220] text-xs uppercase tracking-wider text-[#94a3b8]">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-semibold">
                      Título
                    </th>

                    <th scope="col" className="px-5 py-4 font-semibold">
                      Descripción
                    </th>

                    <th scope="col" className="px-5 py-4 font-semibold">
                      Módulo
                    </th>

                    <th scope="col" className="px-5 py-4 font-semibold">
                      Contenido
                    </th>

                    <th
                      scope="col"
                      className="px-5 py-4 text-center font-semibold"
                    >
                      Vídeos
                    </th>

                    <th
                      scope="col"
                      className="px-5 py-4 text-right font-semibold"
                    >
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#1f2937]">
                  {leccionesFiltradas.map((leccion, index) => {
                    const numeroVideos = getNumeroVideos(leccion.video_url);

                    return (
                      <tr
                        key={leccion.id}
                        className={`transition hover:bg-[#172033] ${
                          index % 2 === 0 ? "bg-[#111827]" : "bg-[#0f172a]/45"
                        }`}
                      >
                        <td className="px-5 py-4 align-top">
                          <p className="max-w-[220px] font-semibold text-[#f8fafc]">
                            {leccion.titulo}
                          </p>
                        </td>

                        <td className="px-5 py-4 align-top">
                          <p className="max-w-xs overflow-hidden text-ellipsis text-[#94a3b8] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                            {leccion.descripcion || "Sin descripción"}
                          </p>
                        </td>

                        <td className="px-5 py-4 align-top">
                          <span className="inline-flex rounded-full border border-[#7c3aed]/30 bg-[#7c3aed]/15 px-3 py-1 text-xs font-semibold text-[#c4b5fd]">
                            {getNombreModulo(leccion)}
                          </span>
                        </td>

                        <td className="px-5 py-4 align-top">
                          {leccion.contenido_url ? (
                            <span className="inline-flex items-center gap-2 text-xs font-medium text-[#22c55e]">
                              <span
                                className="h-2 w-2 rounded-full bg-[#22c55e]"
                                aria-hidden="true"
                              />
                              Disponible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 text-xs font-medium text-[#64748b]">
                              <span
                                className="h-2 w-2 rounded-full bg-[#475569]"
                                aria-hidden="true"
                              />
                              Sin contenido
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-center align-top">
                          <span className="inline-flex min-w-8 justify-center rounded-md bg-[#06b6d4]/10 px-2.5 py-1 text-xs font-bold text-[#67e8f9]">
                            {numeroVideos}
                          </span>
                        </td>

                        <td className="px-5 py-4 align-top">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(leccion)}
                              className="rounded-lg border border-[#06b6d4]/30 bg-[#06b6d4]/10 px-3 py-2 text-xs font-semibold text-[#67e8f9] transition hover:border-[#06b6d4] hover:bg-[#06b6d4]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06b6d4]"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setError("");
                                setDeleteTarget(leccion);
                              }}
                              className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-3 py-2 text-xs font-semibold text-[#fca5a5] transition hover:border-[#ef4444] hover:bg-[#ef4444]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444]"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs text-[#64748b] sm:hidden">
              Desliza horizontalmente para ver toda la tabla.
            </p>
          </section>
        )}
      </main>

      {showModal && (
        <Modal onClose={closeModal} showCloseButton={false}>
          <div className="mx-auto w-full max-w-2xl rounded-2xl border border-[#1f2937] bg-[#111827] p-5 text-[#f8fafc] shadow-2xl shadow-black/40 sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-[#1f2937] pb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7c3aed]">
                  {editTarget ? "Modificar contenido" : "Crear contenido"}
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {editTarget ? "Editar lección" : "Nueva lección"}
                </h2>

                <p className="mt-2 text-sm text-[#94a3b8]">
                  Completa los datos y asigna la lección a uno de los módulos
                  disponibles.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Cerrar formulario"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#334155] text-lg text-[#94a3b8] transition hover:border-[#ef4444] hover:text-[#fca5a5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06b6d4] disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="titulo"
                  className="mb-2 block text-sm font-semibold text-[#e2e8f0]"
                >
                  Título <span className="text-[#ef4444]">*</span>
                </label>

                <input
                  id="titulo"
                  type="text"
                  placeholder="Introducción a los componentes"
                  value={form.titulo}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      titulo: event.target.value,
                    })
                  }
                  className="min-h-11 w-full rounded-lg border border-[#334155] bg-[#0f172a] px-4 py-2.5 text-sm outline-none transition placeholder:text-[#64748b] hover:border-[#475569] focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="modulo"
                  className="mb-2 block text-sm font-semibold text-[#e2e8f0]"
                >
                  Módulo <span className="text-[#ef4444]">*</span>
                </label>

                <select
                  id="modulo"
                  value={form.moduloId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      moduloId: event.target.value,
                    })
                  }
                  className="min-h-11 w-full rounded-lg border border-[#334155] bg-[#0f172a] px-4 py-2.5 text-sm outline-none transition hover:border-[#475569] focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
                >
                  <option value="">Selecciona un módulo</option>

                  {modulos.map((modulo) => (
                    <option key={modulo.id} value={modulo.id}>
                      {modulo.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="descripcion"
                  className="mb-2 block text-sm font-semibold text-[#e2e8f0]"
                >
                  Descripción
                </label>

                <textarea
                  id="descripcion"
                  rows="3"
                  placeholder="Descripción breve de la lección"
                  value={form.descripcion}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      descripcion: event.target.value,
                    })
                  }
                  className="w-full resize-y rounded-lg border border-[#334155] bg-[#0f172a] px-4 py-3 text-sm outline-none transition placeholder:text-[#64748b] hover:border-[#475569] focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="contenido-url"
                  className="mb-2 block text-sm font-semibold text-[#e2e8f0]"
                >
                  Ruta del contenido
                </label>

                <input
                  id="contenido-url"
                  type="text"
                  placeholder="/assets/lecciones/temario/introduccion.md"
                  value={form.contenido_url}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      contenido_url: event.target.value,
                    })
                  }
                  className="min-h-11 w-full rounded-lg border border-[#334155] bg-[#0f172a] px-4 py-2.5 font-mono text-sm outline-none transition placeholder:text-[#64748b] hover:border-[#475569] focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
                />

                <p className="mt-2 text-xs leading-5 text-[#64748b]">
                  Usa la ruta del archivo de contenido que verá el alumno dentro
                  de la plataforma.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="videos"
                  className="mb-2 block text-sm font-semibold text-[#e2e8f0]"
                >
                  URLs de vídeo
                </label>

                <textarea
                  id="videos"
                  rows="4"
                  placeholder={"/assets/video1.mp4\n/assets/video2.mp4"}
                  value={form.video_url}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      video_url: event.target.value,
                    })
                  }
                  className="w-full resize-y rounded-lg border border-[#334155] bg-[#0f172a] px-4 py-3 font-mono text-sm outline-none transition placeholder:text-[#64748b] hover:border-[#475569] focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
                />

                <p className="mt-2 text-xs text-[#64748b]">
                  Introduce una ruta o URL por línea.
                </p>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]"
              >
                {error}
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[#1f2937] pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="min-h-11 rounded-lg border border-[#334155] px-5 py-2.5 text-sm font-semibold text-[#e2e8f0] transition hover:border-[#64748b] hover:bg-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64748b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="min-h-11 rounded-lg bg-[#e53935] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c62828] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Guardando..."
                  : editTarget
                    ? "Guardar cambios"
                    : "Crear lección"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          showCloseButton={false}
          onClose={() => {
            if (!saving) {
              setDeleteTarget(null);
              setError("");
            }
          }}
        >
          <div className="mx-auto w-full max-w-md rounded-2xl border border-[#ef4444]/30 bg-[#111827] p-6 text-[#f8fafc] shadow-2xl shadow-black/40">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#ef4444]/10 text-2xl text-[#f87171]">
              !
            </div>

            <h2 className="text-2xl font-bold">Eliminar lección</h2>

            <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
              Vas a eliminar{" "}
              <strong className="font-semibold text-[#f8fafc]">
                {deleteTarget.titulo}
              </strong>
              . Esta acción no se puede deshacer.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]"
              >
                {error}
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setError("");
                }}
                disabled={saving}
                className="min-h-11 rounded-lg border border-[#334155] px-5 py-2.5 text-sm font-semibold text-[#e2e8f0] transition hover:border-[#64748b] hover:bg-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#64748b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="min-h-11 rounded-lg bg-[#ef4444] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#dc2626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Eliminando..." : "Eliminar lección"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <section
      aria-live="polite"
      aria-busy="true"
      className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-[#1f2937] bg-[#111827] px-6 py-12 text-center"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#334155] border-t-[#06b6d4]" />

      <p className="mt-4 text-sm font-medium text-[#cbd5e1]">
        Cargando lecciones...
      </p>
    </section>
  );
}

function PageError({ message, onRetry }) {
  return (
    <section
      role="alert"
      className="rounded-2xl border border-[#ef4444]/30 bg-[#ef4444]/10 px-6 py-8 text-center"
    >
      <h2 className="text-lg font-bold text-[#fca5a5]">
        No se pudo cargar el contenido
      </h2>

      <p className="mt-2 text-sm text-[#fecaca]">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-lg border border-[#ef4444]/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ef4444]/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444]"
      >
        Volver a intentar
      </button>
    </section>
  );
}

function EmptyState({ onAdd, hasFilters, onClearFilters }) {
  return (
    <section className="rounded-2xl border border-dashed border-[#334155] bg-[#111827] px-6 py-14 text-center shadow-xl shadow-black/5">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7c3aed]/15 text-2xl text-[#c4b5fd]">
        {hasFilters ? "⌕" : "+"}
      </div>

      <h2 className="mt-5 text-xl font-bold">
        {hasFilters ? "No hay resultados" : "Sin lecciones todavía"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#94a3b8]">
        {hasFilters
          ? "No encontramos ninguna lección que coincida con los filtros seleccionados."
          : "Crea tu primera lección y asígnala a uno de los módulos existentes."}
      </p>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        {hasFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="rounded-lg border border-[#334155] px-5 py-2.5 text-sm font-semibold transition hover:border-[#06b6d4] hover:text-[#67e8f9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06b6d4]"
          >
            Limpiar filtros
          </button>
        )}

        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg bg-[#e53935] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c62828] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444]"
        >
          + Crear lección
        </button>
      </div>
    </section>
  );
}
