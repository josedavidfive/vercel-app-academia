import { useEffect, useMemo, useState } from "react";
import {
    actualizarAlumno,
    crearAlumno,
    obtenerAlumnos,
    obtenerPromociones,
} from "../../services/admin.service";

const PAGE_SIZE = 10;

function GestionAlumnos() {
    const [alumnos, setAlumnos] = useState([]);
    const [promociones, setPromociones] = useState([]);
    const [modalCrear, setModalCrear] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);
    const [alumnoEditando, setAlumnoEditando] = useState(null);
    const [loading, setLoading] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState("");
    const [passwordGenerada, setPasswordGenerada] = useState("");
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);

    const [nombre, setNombre] = useState("");
    const [apellido1, setApellido1] = useState("");
    const [apellido2, setApellido2] = useState("");
    const [email, setEmail] = useState("");
    const [curso, setCurso] = useState("");

    const [editNombre, setEditNombre] = useState("");
    const [editApellido1, setEditApellido1] = useState("");
    const [editApellido2, setEditApellido2] = useState("");
    const [editEmail, setEditEmail] = useState("");

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [datosAlumnos, datosPromociones] = await Promise.all([
                obtenerAlumnos(),
                obtenerPromociones(),
            ]);
            setAlumnos(datosAlumnos);
            setPromociones(datosPromociones);
        } catch {
            setError("No se pudieron cargar los datos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    const limpiarFormulario = () => {
        setNombre(""); setApellido1(""); setApellido2("");
        setEmail(""); setCurso(""); setError(""); setPasswordGenerada("");
    };

    const abrirEditar = (alumno) => {
        setAlumnoEditando(alumno);
        setEditNombre(alumno.nombre || "");
        setEditApellido1(alumno.apellido1 || "");
        setEditApellido2(alumno.apellido2 || "");
        setEditEmail(alumno.email || "");
        setError("");
        setModalEditar(true);
    };

    const handleCrear = async (e) => {
        e.preventDefault();
        if (!nombre.trim() || !email.trim()) { setError("Nombre y email son obligatorios."); return; }
        try {
            setGuardando(true); setError("");
            const resultado = await crearAlumno({ nombre, apellido1, apellido2, email, curso });
            setPasswordGenerada(resultado.password);
            await cargarDatos();
            setNombre(""); setApellido1(""); setApellido2(""); setEmail(""); setCurso("");
        } catch (e) {
            setError(e.message || "Error al crear el alumno.");
        } finally { setGuardando(false); }
    };

    const handleEditar = async (e) => {
        e.preventDefault();
        if (!editNombre.trim() || !editEmail.trim()) { setError("Nombre y email son obligatorios."); return; }
        try {
            setGuardando(true); setError("");
            await actualizarAlumno(alumnoEditando.id, {
                nombre: editNombre.trim(),
                apellido1: editApellido1.trim(),
                apellido2: editApellido2.trim(),
                email: editEmail.trim(),
            });
            await cargarDatos();
            setModalEditar(false);
            setAlumnoEditando(null);
        } catch (e) {
            setError(e.message || "Error al actualizar el alumno.");
        } finally { setGuardando(false); }
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return alumnos;
        return alumnos.filter(a =>
            [a.nombre, a.apellido1, a.apellido2, a.email]
                .filter(Boolean).some(v => v.toLowerCase().includes(q))
        );
    }, [alumnos, query]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const inputClass = "w-full rounded-lg border border-[#324057] bg-[#101a2c] px-4 py-3 text-sm outline-none placeholder:text-[#9ba5b6] focus:border-[#59677e]";

    return (
        <div className="space-y-6 px-4 pt-8 sm:px-6 lg:px-8">

            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold sm:text-3xl">Gestión de Alumnos</h2>
                <button onClick={() => { setModalCrear(true); limpiarFormulario(); }}
                    className="rounded-lg bg-[#e82b2f] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#ff3a3e]">
                    + Nuevo alumno
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
                            {["Nombre", "Apellido 1", "Apellido 2", "Email", "Avatar", "Acciones"].map(h => (
                                <th key={h} className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#4a5a72]">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="px-6 py-12 text-center text-[#9ba5b6]">Cargando...</td></tr>
                        ) : visible.length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-12 text-center text-[#9ba5b6]">No se encontraron alumnos.</td></tr>
                        ) : visible.map((a, i) => (
                            <tr key={a.id} className={`border-b border-[#1e2d42] transition hover:bg-[#111e2f] ${i % 2 === 0 ? "bg-[#0d1726]" : "bg-[#0a1420]"}`}>
                                <td className="px-6 py-4 font-semibold text-white">{a.nombre || "—"}</td>
                                <td className="px-6 py-4 text-[#9ba5b6]">{a.apellido1 || "—"}</td>
                                <td className="px-6 py-4 text-[#9ba5b6]">{a.apellido2 || "—"}</td>
                                <td className="px-6 py-4 text-[#9ba5b6]">{a.email || "—"}</td>
                                <td className="px-6 py-4">
                                    <img src={a.avatar || "/assets/avatar/avatar3.webp"} alt={a.nombre} className="h-8 w-8 rounded-full object-cover" />
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => abrirEditar(a)}
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
                    <p className="rounded-xl border border-dashed border-[#324057] px-5 py-8 text-center text-sm text-[#9ba5b6]">No se encontraron alumnos.</p>
                ) : visible.map(a => (
                    <div key={a.id} className="rounded-xl border border-[#1e2d42] bg-[#0d1726] px-4 py-4">
                        <div className="flex items-center gap-3">
                            <img src={a.avatar || "/assets/avatar/avatar3.webp"} alt={a.nombre} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                            <div className="min-w-0">
                                <p className="font-semibold truncate">{a.nombre} {a.apellido1} {a.apellido2}</p>
                                <p className="truncate text-sm text-[#9ba5b6]">{a.email || "—"}</p>
                            </div>
                            <button onClick={() => abrirEditar(a)}
                                className="ml-auto shrink-0 rounded-lg border border-[#1e2d42] px-3 py-1.5 text-xs font-semibold text-[#9ba5b6] transition hover:border-[#06b6d4] hover:text-[#06b6d4]">
                                Editar
                            </button>
                        </div>
                    </div>
                ))}
            </section>

            {/* PAGINACIÓN */}
            <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[#9ba5b6]">
                    {filtered.length === 0 ? "0 alumnos" : `${(safePage - 1) * PAGE_SIZE + 1}-${Math.min(safePage * PAGE_SIZE, filtered.length)} de ${filtered.length} alumnos`}
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
                            <h3 className="text-xl font-bold">Nuevo alumno</h3>
                            <button onClick={() => setModalCrear(false)} className="text-[#9ba5b6] hover:text-white">✕</button>
                        </div>
                        {passwordGenerada && (
                            <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
                                <p className="text-sm font-semibold text-green-300">✅ Alumno creado correctamente</p>
                                <p className="mt-1 text-sm text-green-200">Contraseña temporal: <strong className="font-mono">{passwordGenerada}</strong></p>
                                <p className="mt-1 text-xs text-green-400">Comunícasela al alumno.</p>
                            </div>
                        )}
                        <form onSubmit={handleCrear} className="space-y-4">
                            <div><label className="mb-1.5 block text-sm text-[#9ba5b6]">Nombre *</label>
                                <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" className={inputClass} /></div>
                            <div><label className="mb-1.5 block text-sm text-[#9ba5b6]">Apellido 1</label>
                                <input type="text" value={apellido1} onChange={e => setApellido1(e.target.value)} placeholder="Primer apellido" className={inputClass} /></div>
                            <div><label className="mb-1.5 block text-sm text-[#9ba5b6]">Apellido 2</label>
                                <input type="text" value={apellido2} onChange={e => setApellido2(e.target.value)} placeholder="Segundo apellido" className={inputClass} /></div>
                            <div><label className="mb-1.5 block text-sm text-[#9ba5b6]">Email *</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@ejemplo.com" className={inputClass} /></div>
                            <div><label className="mb-1.5 block text-sm text-[#9ba5b6]">Promoción</label>
                                <select value={curso} onChange={e => setCurso(e.target.value)} className={inputClass}>
                                    <option value="">Sin promoción</option>
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
                                    {guardando ? "Creando..." : "Crear alumno"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL EDITAR */}
            {modalEditar && alumnoEditando && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-md rounded-2xl border border-[#324057] bg-[#0e182b] p-8 max-h-[90vh] overflow-y-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Editar alumno</h3>
                            <button onClick={() => setModalEditar(false)} className="text-[#9ba5b6] hover:text-white">✕</button>
                        </div>
                        <form onSubmit={handleEditar} className="space-y-4">
                            <div><label className="mb-1.5 block text-sm text-[#9ba5b6]">Nombre *</label>
                                <input type="text" value={editNombre} onChange={e => setEditNombre(e.target.value)} className={inputClass} /></div>
                            <div><label className="mb-1.5 block text-sm text-[#9ba5b6]">Apellido 1</label>
                                <input type="text" value={editApellido1} onChange={e => setEditApellido1(e.target.value)} className={inputClass} /></div>
                            <div><label className="mb-1.5 block text-sm text-[#9ba5b6]">Apellido 2</label>
                                <input type="text" value={editApellido2} onChange={e => setEditApellido2(e.target.value)} className={inputClass} /></div>
                            <div><label className="mb-1.5 block text-sm text-[#9ba5b6]">Email *</label>
                                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className={inputClass} /></div>
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

export default GestionAlumnos;