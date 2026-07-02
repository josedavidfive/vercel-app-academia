import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { createCampus, getCampus } from "../../services/campus.service";

const MODULOS_FULLSTACK = [
  "modulo_02_javascript",
  "modulo_04_css_ui",
  "modulo_06_nodejs",
  "modulo_08_react",
];

const MODULOS_CIBERSEGURIDAD = [
  "modulo_01_ciberseguridad",
  "modulo_03_autenticacion",
  "modulo_05_ingenieria_social",
  "modulo_07_redes",
];

const PAGE_SIZE = 10;

function GestionCampus() {
  const { usuario } = useAuth();
  const [campus, setCampus] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [nombre, setNombre] = useState("");
  const [sede, setSede] = useState("");
  const [tipo, setTipo] = useState("fullstack");

  const cargarCampus = async () => {
    try {
      setLoading(true);
      const datos = await getCampus();
      setCampus(datos);
    } catch {
      setError("No se pudieron cargar los campus.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargarCampus(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim() || !sede.trim()) {
      setError("Nombre y sede son obligatorios.");
      return;
    }
    try {
      setGuardando(true);
      setError("");
      const modulosAsignados = tipo === "fullstack" ? MODULOS_FULLSTACK : MODULOS_CIBERSEGURIDAD;
      await createCampus({ nombre: nombre.trim(), sede: sede.trim(), modulos: modulosAsignados, adminUid: usuario?.uid });
      setExito(`Campus "${nombre}" creado correctamente.`);
      setNombre(""); setSede(""); setTipo("fullstack");
      setModalAbierto(false);
      await cargarCampus();
    } catch (e) {
      setError(e.message || "Error al crear el campus.");
    } finally {
      setGuardando(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return campus;
    return campus.filter(c => c.nombre?.toLowerCase().includes(q));
  }, [campus, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const inputClass = "w-full rounded-lg border border-[#324057] bg-[#101a2c] px-4 py-3 text-sm outline-none placeholder:text-[#9ba5b6] focus:border-[#59677e]";

  return (
    <div className="space-y-6 px-4 pt-8 sm:px-6 lg:px-8">

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold sm:text-3xl">Gestión de Campus</h2>
        <button
          onClick={() => { setModalAbierto(true); setError(""); setExito(""); }}
          className="rounded-lg bg-[#e82b2f] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#ff3a3e]"
        >
          + Nuevo campus
        </button>
      </div>

      {exito && <p className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">{exito}</p>}

      <form onSubmit={e => { e.preventDefault(); setQuery(search); setPage(1); }} className="flex w-full gap-3">
        <input type="search" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre"
          className="min-h-10 flex-1 rounded-lg border border-[#324057] bg-[#101a2c] px-4 text-sm outline-none placeholder:text-[#9ba5b6] focus:border-[#59677e]" />
        <button type="submit" className="rounded-lg bg-[#e82b2f] px-5 text-sm font-bold text-white transition hover:bg-[#ff3a3e]">
          Buscar
        </button>
      </form>

      {/* TABLA desktop */}
      <section className="hidden overflow-hidden rounded-2xl border border-[#1e2d42] bg-[#0d1726] sm:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#1e2d42]">
              {["Nombre", "Sede", "Módulos", "Promociones"].map(h => (
                <th key={h} className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#4a5a72]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-[#9ba5b6]">Cargando...</td></tr>
            ) : visible.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-[#9ba5b6]">No se encontraron campus.</td></tr>
            ) : visible.map((c, i) => (
              <tr key={c.id} className={`border-b border-[#1e2d42] transition hover:bg-[#111e2f] ${i % 2 === 0 ? "bg-[#0d1726]" : "bg-[#0a1420]"}`}>
                <td className="px-6 py-4 font-semibold text-white">{c.nombre || "—"}</td>
                <td className="px-6 py-4 text-[#9ba5b6]">{c.sede || "—"}</td>
                <td className="px-6 py-4 text-[#9ba5b6]">{c.modulos?.length || 0} módulos</td>
                <td className="px-6 py-4 text-[#9ba5b6]">{c.promocion?.length || 0} promociones</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* CARDS móvil */}
      <section className="flex flex-col gap-3 sm:hidden">
        {loading ? (
          <p className="text-center text-sm text-[#9ba5b6]">Cargando...</p>
        ) : visible.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#324057] px-5 py-8 text-center text-sm text-[#9ba5b6]">No se encontraron campus.</p>
        ) : visible.map(c => (
          <div key={c.id} className="rounded-xl border border-[#1e2d42] bg-[#0d1726] px-4 py-4">
            <p className="font-semibold text-white">{c.nombre}</p>
            <p className="mt-1 text-sm text-[#9ba5b6]">{c.sede || "—"}</p>
            <div className="mt-2 flex gap-4 text-xs text-[#9ba5b6]">
              <span>{c.modulos?.length || 0} módulos</span>
              <span>{c.promocion?.length || 0} promociones</span>
            </div>
          </div>
        ))}
      </section>

      {/* PAGINACIÓN */}
      <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[#9ba5b6]">
          {filtered.length === 0 ? "0 campus" : `${(safePage - 1) * PAGE_SIZE + 1}-${Math.min(safePage * PAGE_SIZE, filtered.length)} de ${filtered.length} campus`}
        </p>
        <div className="flex gap-2">
          <button disabled={safePage === 1} onClick={() => setPage(c => c - 1)}
            className="rounded-lg border border-[#324057] px-4 py-2 font-semibold transition hover:bg-[#172238] disabled:opacity-40">Anterior</button>
          <button disabled={safePage === totalPages} onClick={() => setPage(c => c + 1)}
            className="rounded-lg border border-[#324057] px-4 py-2 font-semibold transition hover:bg-[#172238] disabled:opacity-40">Siguiente</button>
        </div>
      </div>

      {/* MODAL */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#324057] bg-[#0e182b] p-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">Nuevo campus</h3>
              <button onClick={() => setModalAbierto(false)} className="text-[#9ba5b6] hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="mb-1.5 block text-sm text-[#9ba5b6]">Nombre *</label>
                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: FullStack Web Sevilla" className={inputClass} /></div>
              <div><label className="mb-1.5 block text-sm text-[#9ba5b6]">Sede *</label>
                <input type="text" value={sede} onChange={e => setSede(e.target.value)} placeholder="Ej: Calle Desengaño 21" className={inputClass} /></div>
              <div><label className="mb-1.5 block text-sm text-[#9ba5b6]">Tipo</label>
                <select value={tipo} onChange={e => setTipo(e.target.value)} className={inputClass}>
                  <option value="fullstack">FullStack Web</option>
                  <option value="ciberseguridad">Ciberseguridad</option>
                </select></div>
              <p className="text-xs text-[#9ba5b6]">
                Se asignarán {tipo === "fullstack" ? MODULOS_FULLSTACK.length : MODULOS_CIBERSEGURIDAD.length} módulos automáticamente
              </p>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalAbierto(false)}
                  className="flex-1 rounded-lg border border-[#324057] py-3 text-sm font-semibold transition hover:bg-[#172238]">Cancelar</button>
                <button type="submit" disabled={guardando}
                  className="flex-1 rounded-lg bg-[#e82b2f] py-3 text-sm font-bold text-white transition hover:bg-[#ff3a3e] disabled:opacity-50">
                  {guardando ? "Creando..." : "Crear campus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionCampus;