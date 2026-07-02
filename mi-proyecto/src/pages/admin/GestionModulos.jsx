import { useEffect, useState } from "react";
import { getModulos, updateModulo } from "../../services/modulos.service";

function GestionModulos() {
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState(null);

  const cargarModulos = async () => {
    try {
      setLoading(true);
      const datos = await getModulos();
      setModulos(datos);
    } catch {
      setError("No se pudieron cargar los módulos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarModulos(); }, []);

  const toggleEstado = async (modulo) => {
    const nuevoEstado = modulo.estado === "activo" ? "desactivado" : "activo";
    try {
      setToggling(modulo.id);
      await updateModulo(modulo.id, { estado: nuevoEstado });
      setModulos(prev => prev.map(m =>
        m.id === modulo.id ? { ...m, estado: nuevoEstado } : m
      ));
    } catch {
      setError("No se pudo cambiar el estado del módulo.");
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-6 px-4 pt-8 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold sm:text-3xl">Gestión de Módulos</h2>

      {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

      {/* TABLA desktop */}
      <section className="hidden overflow-hidden rounded-2xl border border-[#1e2d42] bg-[#0d1726] sm:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#1e2d42]">
              {["Nombre", "Horas", "Lecciones", "Estado", "Acción"].map(h => (
                <th key={h} className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#4a5a72]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-12 text-center text-[#9ba5b6]">Cargando...</td></tr>
            ) : modulos.map((m, i) => {
              const activo = m.estado === "activo";
              return (
                <tr key={m.id} className={`border-b border-[#1e2d42] transition hover:bg-[#111e2f] ${i % 2 === 0 ? "bg-[#0d1726]" : "bg-[#0a1420]"}`}>
                  <td className="px-6 py-4 font-semibold text-white">{m.nombre || "—"}</td>
                  <td className="px-6 py-4 text-[#9ba5b6]">{m.horas || 0}h</td>
                  <td className="px-6 py-4 text-[#9ba5b6]">{m.lecciones_id?.length || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${activo ? "bg-[#2d5f5e] text-[#00d2a1]" : "bg-[#3d2d2d] text-[#ff5558]"}`}>
                      {activo ? "Activo" : "Desactivado"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleEstado(m)}
                      disabled={toggling === m.id}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${activo ? "border-[#3d2d2d] text-[#ff5558] hover:bg-[#3d2d2d]/30" : "border-[#2d5f5e] text-[#00d2a1] hover:bg-[#2d5f5e]/30"}`}
                    >
                      {toggling === m.id ? "..." : activo ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* CARDS móvil */}
      <section className="flex flex-col gap-3 sm:hidden">
        {loading ? (
          <p className="text-center text-sm text-[#9ba5b6]">Cargando...</p>
        ) : modulos.map(m => {
          const activo = m.estado === "activo";
          return (
            <div key={m.id} className="rounded-xl border border-[#1e2d42] bg-[#0d1726] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold truncate text-white">{m.nombre}</p>
                  <p className="text-xs text-[#9ba5b6]">{m.horas || 0}h · {m.lecciones_id?.length || 0} lecciones</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${activo ? "bg-[#2d5f5e] text-[#00d2a1]" : "bg-[#3d2d2d] text-[#ff5558]"}`}>
                    {activo ? "Activo" : "Desactivado"}
                  </span>
                  <button
                    onClick={() => toggleEstado(m)}
                    disabled={toggling === m.id}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${activo ? "border-[#3d2d2d] text-[#ff5558]" : "border-[#2d5f5e] text-[#00d2a1]"}`}
                  >
                    {toggling === m.id ? "..." : activo ? "Desactivar" : "Activar"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}

export default GestionModulos;