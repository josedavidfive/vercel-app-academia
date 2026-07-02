import { useEffect, useMemo, useState } from "react";
import {
    actualizarPromocion,
    crearPromocion,
    obtenerAlumnos,
    obtenerCampus,
    obtenerProfesores,
    obtenerPromociones,
} from "../../services/admin.service";

const PAGE_SIZE = 10;

function GestionPromociones() {
    const [promociones, setPromociones] = useState([]);
    const [alumnos, setAlumnos] = useState([]);
    const [profesores, setProfesores] = useState([]);
    const [campus, setCampus] = useState([]);
    const [modalCrear, setModalCrear] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);
    const [promocionEditando, setPromocionEditando] = useState(null);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);

    // Crear
    const [nombre, setNombre] = useState("");
    const [campusId, setCampusId] = useState("");

    // Editar
    const [editNombre, setEditNombre] = useState("");
    const [editFechaFin, setEditFechaFin] = useState("");
    const [editAlumnos, setEditAlumnos] = useState([]);
    const [editProfesores, setEditProfesores] = useState([]);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [datosPromociones, datosAlumnos, datosProfesores, datosCampus] = await Promise.all([
                obtenerPromociones(),
                obtenerAlumnos(),
                obtenerProfesores(),
                obtenerCampus(),
            ]);
            setPromociones(datosPromociones);
            setAlumnos(datosAlumnos);
            setProfesores(datosProfesores);
            setCampus(datosCampus);
        } catch {
            setError("No se pudieron cargar los datos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    const abrirEditar = (promo) => {
        setPromocionEditando(promo);
        setEditNombre(promo.nombre || "");
        setEditFechaFin(promo.fechaFin || "");
        const alumnosActuales = (promo.alumnos_id || []).map(r => r?.id || r);
        const profesoresActuales = (promo.profesores_id || []).map(r => r?.id || r);
        setEditAlumnos(alumnosActuales);
        setEditProfesores(profesoresActuales);
        setError("");
        setModalEditar(true);
    };

    const toggleAlumno = (id) => {
        setEditAlumnos(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
    };

    const toggleProfesor = (id) => {
        setEditProfesores(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, p]);
    };

    const handleCrear = async (e) => {
        e.preventDefault();
        if (!nombre.trim() || !campusId) {
            setError("Nombre y campus son obligatorios.");
            return;
        }
        try {
            setGuardando(true); setError("");
            await crearPromocion({ nombre: nombre.trim(), campusId });
            await cargarDatos();
            setNombre(""); setCampusId("");
            setModalCrear(false);
        } catch (e) {
            setError(e.message || "Error al crear la promoción.");
        } finally { setGuardando(false); }
    };

    const handleEditar = async (e) => {
        e.preventDefault();
        if (!editNombre.trim()) { setError("El nombre es obligatorio."); return; }
        try {
            setGuardando(true); setError("");
            await actualizarPromocion(promocionEditando.id, {
                nombre: editNombre.trim(),
                fechaFin: editFechaFin || null,
                alumnos_id: editAlumnos,
                profesores_id: editProfesores,
            });
            await cargarDatos();
            setModalEditar(false);
            setPromocionEditando(null);
        } catch (e) {
            setError(e.message || "Error al actualizar la promoción.");
        } finally { setGuardando(false); }
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return promociones;
        return promociones.filter(p => p.nombre?.toLowerCase().includes(q));
    }, [promociones, query]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const inputClass = "w-full rounded-lg border border-[#324057] bg-[#101a2c] px-4 py-3 text-sm outline-none placeholder:text-[#9ba5b6] focus:border-[#59677e]";

    const getNombreCampus = (promo) => {
        const ref = promo.campus_id;
        if (!ref) return "—";
        const id = ref?.id || ref;
        return campus.find(c => c.id === id)?.nombre || "—";
    };

    const formatFecha = (fecha) => {
        if (!fecha) return "—";
        try { return new Date(fecha).toLocaleDateString("es-ES"); } catch { return "—"; }
    };

    return (
        <div className="space-y-6 px-4 pt-8 sm:px-6 lg:px-8">

            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold sm:text-3xl">Gestión de Promociones</h2>
                <button onClick={() => { setModalCrear(true); setNombre(""); setCampusId(""); setError(""); }}
                    className="rounded-lg bg-[#e82b2f] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#ff3a3e]">
                    + Nueva promoción
                </button>
            </div>

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
                            {["Nombre", "Campus", "Fecha inicio", "Fecha fin", "Alumnos", "Acciones"].map(h => (
                                <th key={h} className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#4a5a72]">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="px-6 py-12 text-center text-[#9ba5b6]">Cargando...</td></tr>
                        ) : visible.length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-12 text-center text-[#9ba5b6]">No se encontraron promociones.</td></tr>
                        ) : visible.map((p, i) => (
                            <tr key={p.id} className={`border-b border-[#1e2d42] transition hover:bg-[#111e2f] ${i % 2 === 0 ? "bg-[#0d1726]" : "bg-[#0a1420]"}`}>
                                <td className="px-6 py-4 font-semibold text-white">{p.nombre || "—"}</td>
                                <td className="px-6 py-4 text-[#9ba5b6]">{getNombreCampus(p)}</td>
                                <td className="px-6 py-4 text-[#9ba5b6]">{formatFecha(p.fechaInicio)}</td>
                                <td className="px-6 py-4 text-[#9ba5b6]">{formatFecha(p.fechaFin)}</td>
                                <td className="px-6 py-4 text-[#9ba5b6]">{p.alumnos_id?.length || 0}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => abrirEditar(p)}
                                        className="rounded-lg border border-[#1e2d42] px-3 py-1.5 text-xs font-semibold text-[#9ba5b6] transition hover:border-[#06b6d4] hover:text-[#06b6d4]">
                                        Editar
                                    </button>
                                </td>
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
                    <p className="rounded-xl border border-dashed border-[#324057] px-5 py-8 text-center text-sm text-[#9ba5b6]">No se encontraron promociones.</p>
                ) : visible.map(p => (
                    <div key={p.id} className="rounded-xl border border-[#1e2d42] bg-[#0d1726] px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="font-semibold truncate">{p.nombre}</p>
                                <p className="text-sm text-[#9ba5b6]">{getNombreCampus(p)}</p>
                                <p className="text-xs text-[#9ba5b6]">{p.alumnos_id?.length || 0} alumnos</p>
                            </div>
                            <button onClick={() => abrirEditar(p)}
                                className="shrink-0 rounded-lg border border-[#1e2d42] px-3 py-1.5 text-xs font-semibold text-[#9ba5b6] transition hover:border-[#06b6d4] hover:text-[#06b6d4]">
                                Editar
                            </button>
                        </div>
                    </div>
                ))}
            </section>

            {/* PAGINACIÓN */}
            <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[#9ba5b6]">
                    {filtered.length === 0 ? "0 promociones" : `${(safePage - 1) * PAGE_SIZE + 1}-${Math.min(safePage * PAGE_SIZE, filtered.length)} de ${filtered.length} promociones`}
                </p>
                <div className="flex gap-2">
                    <button disabled={safePage === 1} onClick={() => setPage(c => c - 1)}
                        className="rounded-lg border border-[#324057] px-4 py-2 font-semibold transition hover:bg-[#172238] disabled:opacity-40">Anterior</button>
                    <button disabled={safePage === totalPages} onClick={() => setPage(c => c + 1)}
                        className="rounded-lg border border-[#324057] px-4 py-2 font-semibold transition hover:bg-[#172238] disabled:opacity-40">Siguiente</button>
                </div>
            </div>

            {/* MODAL CREAR */}
            {modalCrear && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-md rounded-2xl border border-[#324057] bg-[#0e182b] p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Nueva promoción</h3>
                            <button onClick={() => setModalCrear(false)} className="text-[#9ba5b6] hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleCrear} className="space-y-4">
                            <div><label className="mb-1.5 block text-sm text-[#9ba5b6]">Nombre *</label>
                                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: FullStack Sevilla 2026" className={inputClass} /></div>
                            <div><label className="mb-1.5 block text-sm text-[#9ba5b6]">Campus *</label>
                                <select value={campusId} onChange={e => setCampusId(e.target.value)} className={inputClass}>
                                    <option value="">Selecciona un campus</option>
                                    {campus.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                </select></div>
                            {error && <p className="text-sm text-red-400">{error}</p>}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModalCrear(false)}
                                    className="flex-1 rounded-lg border border-[#324057] py-3 text-sm font-semibold transition hover:bg-[#172238]">Cancelar</button>
                                <button type="submit" disabled={guardando}
                                    className="flex-1 rounded-lg bg-[#e82b2f] py-3 text-sm font-bold text-white transition hover:bg-[#ff3a3e] disabled:opacity-50">
                                    {guardando ? "Creando..." : "Crear promoción"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDITAR */}
            {modalEditar && promocionEditando && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-lg rounded-2xl border border-[#324057] bg-[#0e182b] p-8 max-h-[90vh] overflow-y-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Editar promoción</h3>
                            <button onClick={() => setModalEditar(false)} className="text-[#9ba5b6] hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleEditar} className="space-y-5">
                            <div><label className="mb-1.5 block text-sm text-[#9ba5b6]">Nombre *</label>
                                <input type="text" value={editNombre} onChange={e => setEditNombre(e.target.value)} className={inputClass} /></div>
                            <div><label className="mb-1.5 block text-sm text-[#9ba5b6]">Fecha de fin</label>
                                <input type="date" value={editFechaFin} onChange={e => setEditFechaFin(e.target.value)} className={inputClass} /></div>

                            {/* ALUMNOS */}
                            <div>
                                <label className="mb-2 block text-sm text-[#9ba5b6]">Alumnos ({editAlumnos.length} seleccionados)</label>
                                <div className="max-h-40 overflow-y-auto rounded-lg border border-[#324057] bg-[#101a2c] p-3 space-y-2">
                                    {alumnos.map(a => (
                                        <label key={a.id} className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" checked={editAlumnos.includes(a.id)} onChange={() => toggleAlumno(a.id)}
                                                className="h-4 w-4 rounded border-[#324057]" />
                                            <span className="text-sm text-[#f6f7fa]">{a.nombre} {a.apellido1} <span className="text-[#9ba5b6]">— {a.email}</span></span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* PROFESORES */}
                            <div>
                                <label className="mb-2 block text-sm text-[#9ba5b6]">Profesores ({editProfesores.length} seleccionados)</label>
                                <div className="max-h-40 overflow-y-auto rounded-lg border border-[#324057] bg-[#101a2c] p-3 space-y-2">
                                    {profesores.map(p => (
                                        <label key={p.id} className="flex items-center gap-3 cursor-pointer">
                                            <input type="checkbox" checked={editProfesores.includes(p.id)} onChange={() => toggleProfesor(p.id)}
                                                className="h-4 w-4 rounded border-[#324057]" />
                                            <span className="text-sm text-[#f6f7fa]">{p.nombre} <span className="text-[#9ba5b6]">— {p.email}</span></span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {error && <p className="text-sm text-red-400">{error}</p>}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModalEditar(false)}
                                    className="flex-1 rounded-lg border border-[#324057] py-3 text-sm font-semibold transition hover:bg-[#172238]">Cancelar</button>
                                <button type="submit" disabled={guardando}
                                    className="flex-1 rounded-lg bg-[#e82b2f] py-3 text-sm font-bold text-white transition hover:bg-[#ff3a3e] disabled:opacity-50">
                                    {guardando ? "Guardando..." : "Guardar cambios"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GestionPromociones;