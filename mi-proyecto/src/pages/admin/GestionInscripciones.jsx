import { doc, Timestamp, updateDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "../../config/firebase";
import { crearAlumno, obtenerInscripciones, obtenerPromociones } from "../../services/admin.service";

const PAGE_SIZE = 10;

function GestionInscripciones() {
    const [inscripciones, setInscripciones] = useState([]);
    const [promociones, setPromociones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);

    // Modal aceptar
    const [modalAceptar, setModalAceptar] = useState(false);
    const [inscSeleccionada, setInscSeleccionada] = useState(null);
    const [promocionId, setPromocionId] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [passwordGenerada, setPasswordGenerada] = useState("");
    const [errorModal, setErrorModal] = useState("");

    // Modal rechazar
    const [modalRechazar, setModalRechazar] = useState(false);

    const cargarDatos = async () => {
        try {
            setLoading(true);
            const [datosInsc, datosPromo] = await Promise.all([
                obtenerInscripciones(),
                obtenerPromociones(),
            ]);
            setInscripciones(datosInsc);
            setPromociones(datosPromo);
        } catch {
            setError("No se pudieron cargar las inscripciones.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    const abrirAceptar = (insc) => {
        setInscSeleccionada(insc);
        setPromocionId("");
        setPasswordGenerada("");
        setErrorModal("");
        setModalAceptar(true);
    };

    const abrirRechazar = (insc) => {
        setInscSeleccionada(insc);
        setErrorModal("");
        setModalRechazar(true);
    };

    const handleAceptar = async (e) => {
        e.preventDefault();
        if (!promocionId) { setErrorModal("Selecciona una promoción."); return; }
        try {
            setGuardando(true); setErrorModal("");
            // Crear alumno con los datos de la inscripción
            const resultado = await crearAlumno({
                nombre: inscSeleccionada.nombre || "",
                apellido1: inscSeleccionada.apellido || "",
                email: inscSeleccionada.email,
                curso: promocionId,
            });
            setPasswordGenerada(resultado.password);
            // Marcar inscripción como aceptada
            await updateDoc(doc(db, "inscripciones", inscSeleccionada.id), {
                aceptada: true,
                actualizadoEn: Timestamp.now(),
            });
            await cargarDatos();
        } catch (e) {
            setErrorModal(e.message || "Error al aceptar la inscripción.");
        } finally {
            setGuardando(false);
        }
    };

    const handleRechazar = async () => {
        try {
            setGuardando(true); setErrorModal("");
            await updateDoc(doc(db, "inscripciones", inscSeleccionada.id), {
                aceptada: false,
                rechazada: true,
                actualizadoEn: Timestamp.now(),
            });
            await cargarDatos();
            setModalRechazar(false);
            setInscSeleccionada(null);
        } catch {
            setErrorModal("Error al rechazar la inscripción.");
        } finally {
            setGuardando(false);
        }
    };

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return inscripciones;
        return inscripciones.filter(i =>
            [i.nombre, i.apellido, i.email].filter(Boolean).some(v => v.toLowerCase().includes(q))
        );
    }, [inscripciones, query]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const getEstado = (insc) => {
        if (insc.rechazada) return { label: "Rechazada", classes: "bg-[#3d2d2d] text-[#ff5558]" };
        if (insc.aceptada) return { label: "Aceptada", classes: "bg-[#2d5f5e] text-[#00d2a1]" };
        return { label: "Pendiente", classes: "bg-[#3d3d2d] text-[#ffa726]" };
    };

    const inputClass = "w-full rounded-lg border border-[#324057] bg-[#101a2c] px-4 py-3 text-sm outline-none placeholder:text-[#9ba5b6] focus:border-[#59677e]";

    return (
        <div className="space-y-6 px-4 pt-8 sm:px-6 lg:px-8">

            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold sm:text-3xl">Gestión de Inscripciones</h2>
            </div>

            <form onSubmit={e => { e.preventDefault(); setQuery(search); setPage(1); }} className="flex w-full gap-3">
                <input type="search" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar por nombre o email"
                    className="min-h-10 flex-1 rounded-lg border border-[#324057] bg-[#101a2c] px-4 text-sm outline-none placeholder:text-[#9ba5b6] focus:border-[#59677e]" />
                <button type="submit" className="rounded-lg bg-[#e82b2f] px-5 text-sm font-bold text-white transition hover:bg-[#ff3a3e]">
                    Buscar
                </button>
            </form>

            {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

            {/* TABLA desktop */}
            <section className="hidden overflow-hidden rounded-2xl border border-[#1e2d42] bg-[#0d1726] sm:block">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-[#1e2d42]">
                            {["Nombre", "Apellido", "Email", "Estado", "Acciones"].map(h => (
                                <th key={h} className="px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-[#4a5a72]">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-12 text-center text-[#9ba5b6]">Cargando...</td></tr>
                        ) : visible.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-12 text-center text-[#9ba5b6]">No hay inscripciones.</td></tr>
                        ) : visible.map((insc, i) => {
                            const estado = getEstado(insc);
                            const pendiente = !insc.aceptada && !insc.rechazada;
                            return (
                                <tr key={insc.id} className={`border-b border-[#1e2d42] transition hover:bg-[#111e2f] ${i % 2 === 0 ? "bg-[#0d1726]" : "bg-[#0a1420]"}`}>
                                    <td className="px-6 py-4 font-semibold text-white">{insc.nombre || "—"}</td>
                                    <td className="px-6 py-4 text-[#9ba5b6]">{insc.apellido || "—"}</td>
                                    <td className="px-6 py-4 text-[#9ba5b6]">{insc.email || "—"}</td>
                                    <td className="px-6 py-4">
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${estado.classes}`}>
                                            {estado.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {pendiente && (
                                            <div className="flex gap-2">
                                                <button onClick={() => abrirAceptar(insc)}
                                                    className="rounded-lg border border-[#2d5f5e] px-3 py-1.5 text-xs font-semibold text-[#00d2a1] transition hover:bg-[#2d5f5e]/30">
                                                    ✅ Aceptar
                                                </button>
                                                <button onClick={() => abrirRechazar(insc)}
                                                    className="rounded-lg border border-[#3d2d2d] px-3 py-1.5 text-xs font-semibold text-[#ff5558] transition hover:bg-[#3d2d2d]/30">
                                                    ❌ Rechazar
                                                </button>
                                            </div>
                                        )}
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
                ) : visible.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-[#324057] px-5 py-8 text-center text-sm text-[#9ba5b6]">No hay inscripciones.</p>
                ) : visible.map(insc => {
                    const estado = getEstado(insc);
                    const pendiente = !insc.aceptada && !insc.rechazada;
                    return (
                        <div key={insc.id} className="rounded-xl border border-[#1e2d42] bg-[#0d1726] px-4 py-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-semibold truncate">{insc.nombre} {insc.apellido}</p>
                                    <p className="truncate text-sm text-[#9ba5b6]">{insc.email}</p>
                                </div>
                                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${estado.classes}`}>
                                    {estado.label}
                                </span>
                            </div>
                            {pendiente && (
                                <div className="flex gap-2">
                                    <button onClick={() => abrirAceptar(insc)}
                                        className="flex-1 rounded-lg border border-[#2d5f5e] py-2 text-xs font-semibold text-[#00d2a1] transition hover:bg-[#2d5f5e]/30">
                                        ✅ Aceptar
                                    </button>
                                    <button onClick={() => abrirRechazar(insc)}
                                        className="flex-1 rounded-lg border border-[#3d2d2d] py-2 text-xs font-semibold text-[#ff5558] transition hover:bg-[#3d2d2d]/30">
                                        ❌ Rechazar
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </section>

            {/* PAGINACIÓN */}
            <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[#9ba5b6]">
                    {filtered.length === 0 ? "0 inscripciones" : `${(safePage - 1) * PAGE_SIZE + 1}-${Math.min(safePage * PAGE_SIZE, filtered.length)} de ${filtered.length} inscripciones`}
                </p>
                <div className="flex gap-2">
                    <button disabled={safePage === 1} onClick={() => setPage(c => c - 1)}
                        className="rounded-lg border border-[#324057] px-4 py-2 font-semibold transition hover:bg-[#172238] disabled:opacity-40">Anterior</button>
                    <button disabled={safePage === totalPages} onClick={() => setPage(c => c + 1)}
                        className="rounded-lg border border-[#324057] px-4 py-2 font-semibold transition hover:bg-[#172238] disabled:opacity-40">Siguiente</button>
                </div>
            </div>

            {/* MODAL ACEPTAR */}
            {modalAceptar && inscSeleccionada && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-md rounded-2xl border border-[#324057] bg-[#0e182b] p-8 max-h-[90vh] overflow-y-auto">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Aceptar inscripción</h3>
                            <button onClick={() => setModalAceptar(false)} className="text-[#9ba5b6] hover:text-white">✕</button>
                        </div>

                        {passwordGenerada ? (
                            <div className="space-y-4">
                                <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-4">
                                    <p className="text-sm font-semibold text-green-300">✅ Alumno creado correctamente</p>
                                    <p className="mt-2 text-sm text-green-200">
                                        Contraseña temporal: <strong className="font-mono text-base">{passwordGenerada}</strong>
                                    </p>
                                    <p className="mt-1 text-xs text-green-400">Comunícasela al alumno para que pueda acceder.</p>
                                </div>
                                <button onClick={() => { setModalAceptar(false); setInscSeleccionada(null); setPasswordGenerada(""); }}
                                    className="w-full rounded-lg bg-[#e82b2f] py-3 text-sm font-bold text-white transition hover:bg-[#ff3a3e]">
                                    Cerrar
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleAceptar} className="space-y-4">
                                <div className="rounded-lg border border-[#324057] bg-[#111b2c] px-4 py-3 text-sm">
                                    <p><span className="text-[#9ba5b6]">Nombre:</span> <span className="font-semibold">{inscSeleccionada.nombre} {inscSeleccionada.apellido}</span></p>
                                    <p className="mt-1"><span className="text-[#9ba5b6]">Email:</span> <span className="font-semibold">{inscSeleccionada.email}</span></p>
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-sm text-[#9ba5b6]">Asignar a promoción *</label>
                                    <select value={promocionId} onChange={e => setPromocionId(e.target.value)} className={inputClass}>
                                        <option value="">Selecciona una promoción</option>
                                        {promociones.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                    </select>
                                </div>
                                {errorModal && <p className="text-sm text-red-400">{errorModal}</p>}
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setModalAceptar(false)}
                                        className="flex-1 rounded-lg border border-[#324057] py-3 text-sm font-semibold transition hover:bg-[#172238]">Cancelar</button>
                                    <button type="submit" disabled={guardando}
                                        className="flex-1 rounded-lg bg-[#e82b2f] py-3 text-sm font-bold text-white transition hover:bg-[#ff3a3e] disabled:opacity-50">
                                        {guardando ? "Creando alumno..." : "Aceptar y crear alumno"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* MODAL RECHAZAR */}
            {modalRechazar && inscSeleccionada && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
                    <div className="w-full max-w-sm rounded-2xl border border-[#324057] bg-[#0e182b] p-8">
                        <h3 className="text-xl font-bold mb-4">Rechazar inscripción</h3>
                        <p className="text-sm text-[#9ba5b6] mb-6">
                            ¿Seguro que quieres rechazar la solicitud de <strong className="text-white">{inscSeleccionada.nombre} {inscSeleccionada.apellido}</strong>?
                        </p>
                        {errorModal && <p className="text-sm text-red-400 mb-4">{errorModal}</p>}
                        <div className="flex gap-3">
                            <button onClick={() => setModalRechazar(false)}
                                className="flex-1 rounded-lg border border-[#324057] py-3 text-sm font-semibold transition hover:bg-[#172238]">Cancelar</button>
                            <button onClick={handleRechazar} disabled={guardando}
                                className="flex-1 rounded-lg bg-[#ff5558] py-3 text-sm font-bold text-white transition hover:bg-[#ff3a3e] disabled:opacity-50">
                                {guardando ? "Rechazando..." : "Rechazar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default GestionInscripciones;