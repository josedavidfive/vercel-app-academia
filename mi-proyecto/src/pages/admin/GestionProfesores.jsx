import { useEffect, useMemo, useState } from "react";
import {
    actualizarProfesor,
    crearProfesor,
    obtenerProfesores,
    obtenerPromociones,
} from "../../services/admin.service";

const PAGE_SIZE = 10;

function GestionProfesores() {
    const [profesores, setProfesores] = useState([]);
    const [promociones, setPromociones] = useState([]);
    const [modalCrear, setModalCrear] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);
    const [profesorEditando, setProfesorEditando] = useState(null);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [passwordGenerada, setPasswordGenerada] = useState("");
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);

    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [promocionId, setPromocionId] = useState("");

    const [editNombre, setEditNombre] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editIsActive, setEditIsActive] = useState(true);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [datosProfesores, datosPromociones] = await Promise.all([
                obtenerProfesores(),
                obtenerPromociones(),
            ]);
            setProfesores(datosProfesores);
            setPromociones(datosPromociones);
        } catch {
            setError("No se pudieron cargar los datos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    const limpiarFormulario = () => {
        setNombre(""); setEmail(""); setPromocionId("");
        setError(""); setPasswordGenerada("");
    };

    const abrirEditar = (profesor) => {
        setProfesorEditando(profesor);
        setEditNombre(profesor.nombre || "");
        setEditEmail(profesor.email || "");
        setEditIsActive(profesor.isActive ?? true);
        setError("");
        setModalEditar(true);
    };

    const handleCrear = async (e) => {
        e.preventDefault();
        if (!nombre.trim() || !email.trim() || !promocionId) {
            setError("Nombre, email y promoción son obligatorios.");
            return;
        }
        try {
            setGuardando(true); setError("");
            const resultado = await crearProfesor({ nombre, email, promocionId });
            setPasswordGenerada(resultado.password);
            await cargarDatos();
            setNombre(""); setEmail(""); setPromocionId("");
        } catch (e) {
            setError(e.message || "Error al crear el profesor.");
        } finally { setGuardando(false); }
    };

    const handleEditar = async (e) => {
        e.preventDefault();
        if (!editNombre.trim() || !editEmail.trim()) {
            setError("Nombre y email son obligatorios.");
            return;
        }
        try {
            setGuardando(true); setError("");
            await actualizarProfesor(profesorEditando.id, {
                nombre: editNombre.trim(),
                email: editEmail.trim(),
                isActive: editIsActive,
            });
            await cargarDatos();
            setModalEditar(false);
            setProfesorEditando(null);
        } catch (e) {
            setError(e.message || "Error al actualizar el profesor.");
        } finally { setGuardando(false); }
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return profesores;
        return profesores.filter(p =>
            [p.nombre, p.email].filter(Boolean).some(v => v.toLowerCase().includes(q))
        );
    }, [profesores, query]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const inputClass = "w-full rounded-lg border border-[#324057] bg-[#101a2c] px-4 py-3 text-sm outline-none placeholder:text-[#9ba5b6] focus:border-[#59677e]";

    return (
        <div className="space-y-6 px-4 pt-8 sm:px-6 lg:px-8">

            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold sm:text-3xl">Gestión de Profesores</h2>
                <button onClick={() => { setModalCrear(true); limpiarFormulario(); }}
                    className="rounded-lg bg-[#e82b2f] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#ff3a3e]">
                    + Nuevo profesor
                </button>
            </div>

            <form onSubmit={e => { e.preventDefault(); setQuery(search); setPage(1); }} className="flex w-full gap-3">
                <input type="search" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por nombre o email"
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
                            {["Avatar", "Nombre", "Email", "Estado", "Acciones"].map(h => (
                                <th key={h} className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#4a5a72]">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-12 text-center text-[#9ba5b6]">Cargando...</td></tr>
                        ) : visible.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-12 text-center text-[#9ba5b6]">No se encontraron profesores.</td></tr>
                        ) : visible.map((p, i) => (
                            <tr key={p.id} className={`border-b border-[#1e2d42] transition hover:bg-[#111e2f] ${i % 2 === 0 ? "bg-[#0d1726]" : "bg-[#0a1420]"}`}>
                                <td className="px-6 py-4">
                                    <img src={p.avatar || "/assets/avatar/avatar2.webp"} alt={p.nombre} className="h-8 w-8 rounded-full object-cover" />
                                </td>
                                <td className="px-6 py-4 font-semibold text-white">{p.nombre || "—"}</td>
                                <td className="px-6 py-4 text-[#9ba5b6]">{p.email || "—"}</td>
                                <td className="px-6 py-4">
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${p.isActive ? "bg-[#2d5f5e] text-[#00d2a1]" : "bg-[#3d2d2d] text-[#ff5558]"}`}>
                                        {p.isActive ? "Activo" : "Inactivo"}
                                    </span>
                                </td>
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
                    <p className="rounded-xl border border-dashed border-[#324057] px-5 py-8 text-center text-sm text-[#9ba5b6]">No se encontraron profesores.</p>
                ) : visible.map(p => (
                    <div key={p.id} className="rounded-xl border border-[#1e2d42] bg-[#0d1726] px-4 py-4">
                        <div className="flex items-center gap-3">
                            <img src={p.avatar || "/assets/avatar/avatar2.webp"} alt={p.nombre} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                            <div className="min-w-0">
                                <p className="font-semibold truncate">{p.nombre}</p>
                                <p className="truncate text-sm text-[#9ba5b6]">{p.email || "—"}</p>
                            </div>
                            <div className="ml-auto flex shrink-0 items-center gap-2">
                                <span className={`rounded-full px-2 py-1 text-xs font-bold ${p.isActive ? "bg-[#2d5f5e] text-[#00d2a1]" : "bg-[#3d2d2d] text-[#ff5558]"}`}>
                                    {p.isActive ? "Activo" : "Inactivo"}
                                </span>
                                <button onClick={() => abrirEditar(p)}
                                    className="rounded-lg border border-[#1e2d42] px-3 py-1.5 text-xs font-semibold text-[#9ba5b6] transition hover:border-[#06b6d4] hover:text-[#06b6d4]">
                                    Editar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </section>

            {/* PAGINACIÓN */}
            <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[#9ba5b6]">
                    {filtered.length === 0 ? "0 profesores" : `${(safePage - 1) * PAGE_SIZE + 1}-${Math.min(safePage * PAGE_SIZE, filtered.length)} de ${filtered.length} profesores`}
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
                    <div className="w-full max-w-md rounded-2xl border border-[#324057] bg-[#0e182b] p-8 max-h-[90vh] overflow-y-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Nuevo profesor</h3>
                            <button onClick={() => setModalCrear(false)} className="text-[#9ba5b6] hover:text-white">✕</button>
                        </div>
                        {passwordGenerada && (
                            <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
                                <p className="text-sm font-semibold text-green-300">✅ Profesor creado correctamente</p>
                                <p className="mt-1 text-sm text-green-200">Contraseña temporal: <strong className="font-mono">{passwordGenerada}</strong></p>
                                <p className="mt-1 text-xs text-green-400">Comunícasela al profesor.</p>
                            </div>
                        )}
                        <form onSubmit={handleCrear} className="space-y-4">
                            <div><label className="mb-1.5 block text-sm text-[#9ba5b6]">Nombre *</label>
                                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre completo" className={inputClass} /></div>
                            <div><label className="mb-1.5 block text-sm text-[#9ba5b6]">Email *</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@ejemplo.com" className={inputClass} /></div>
                            <div><label className="mb-1.5 block text-sm text-[#9ba5b6]">Promoción *</label>
                                <select value={promocionId} onChange={e => setPromocionId(e.target.value)} className={inputClass}>
                                    <option value="">Selecciona una promoción</option>
                                    {promociones.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                </select></div>
                            {error && <p className="text-sm text-red-400">{error}</p>}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModalCrear(false)}
                                    className="flex-1 rounded-lg border border-[#324057] py-3 text-sm font-semibold transition hover:bg-[#172238]">
                                    {passwordGenerada ? "Cerrar" : "Cancelar"}
                                </button>
                                <button type="submit" disabled={guardando}
                                    className="flex-1 rounded-lg bg-[#e82b2f] py-3 text-sm font-bold text-white transition hover:bg-[#ff3a3e] disabled:opacity-50">
                                    {guardando ? "Creando..." : "Crear profesor"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDITAR */}
            {modalEditar && profesorEditando && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-md rounded-2xl border border-[#324057] bg-[#0e182b] p-8 max-h-[90vh] overflow-y-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Editar profesor</h3>
                            <button onClick={() => setModalEditar(false)} className="text-[#9ba5b6] hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleEditar} className="space-y-4">
                            <div><label className="mb-1.5 block text-sm text-[#9ba5b6]">Nombre *</label>
                                <input type="text" value={editNombre} onChange={e => setEditNombre(e.target.value)} className={inputClass} /></div>
                            <div><label className="mb-1.5 block text-sm text-[#9ba5b6]">Email *</label>
                                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className={inputClass} /></div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="isActive" checked={editIsActive} onChange={e => setEditIsActive(e.target.checked)}
                                    className="h-4 w-4 rounded border-[#324057] bg-[#101a2c]" />
                                <label htmlFor="isActive" className="text-sm text-[#9ba5b6]">Profesor activo</label>
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

export default GestionProfesores;