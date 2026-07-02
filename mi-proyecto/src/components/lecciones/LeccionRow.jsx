import { memo } from "react";

function LeccionRow({
  lesson,
  index,
  available,
  moduleActive,
  onToggle,
  onEdit,
  onDelete,
}) {
  if (!lesson) return null;

  const materialCount = Array.isArray(lesson.archivos_url)
    ? lesson.archivos_url.length
    : lesson.contenido_url
      ? 1
      : 0;
  const videoCount = Array.isArray(lesson.video_url)
    ? lesson.video_url.length
    : lesson.video_url
      ? 1
      : 0;

  return (
    <article className="grid min-h-[78px] grid-cols-[auto_1fr] items-center gap-4 border-b border-[#263247] px-4 py-3 transition hover:bg-[#111d31] sm:grid-cols-[auto_1fr_auto] sm:px-5">
      <span className="font-bold text-[#ef3034]">{index + 1}</span>

      <div className="min-w-0">
        <h2 className="truncate font-semibold">
          {lesson.titulo || "Lección sin título"}
        </h2>
        <p className="mt-1 flex gap-3 text-xs text-[#9ba5b6]">
          <span>{materialCount} archivos</span>
          <span>{videoCount} vídeos</span>
        </p>
      </div>

      <div className="col-span-2 flex items-center justify-end gap-4 sm:col-span-1">
        <span
          className={`min-w-[82px] rounded px-2.5 py-1 text-center text-[10px] font-bold uppercase ${
            available
              ? "bg-[#063b39] text-[#00d2a1]"
              : "bg-[#3a4659] text-[#aeb7c5]"
          }`}
        >
          {available ? "Disponible" : "Bloqueada"}
        </span>

        <button
          type="button"
          role="switch"
          aria-checked={available}
          aria-label={`${available ? "Bloquear" : "Desbloquear"} ${lesson.titulo || "lección"}`}
          disabled={!moduleActive}
          onClick={() => onToggle(lesson, index)}
          className={`relative h-6 w-11 rounded-full transition ${
            available ? "bg-[#12c7a0]" : "bg-[#3a465a]"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          <span
            className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition ${
              available ? "left-[23px]" : "left-[3px]"
            }`}
          />
        </button>

        <button
          type="button"
          onClick={() => onEdit(lesson)}
          className="text-sm font-semibold text-[#9ba5b6] transition hover:text-white"
        >
          Editar
        </button>

        <button
          type="button"
          onClick={() => onDelete(lesson)}
          className="text-sm font-semibold text-[#f33b40] transition hover:text-[#ff777a]"
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}

export default memo(LeccionRow);
