import { useEffect, useMemo, useState } from "react";
import { obtenerUsuariosAdmin } from "../../services/admin.service";

const PAGE_SIZE = 10;

function AdminDashboard() {
    const [usuarios, setUsuarios] = useState([]);
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const cargarUsuarios = async () => {
        try {
            setLoading(true);
            setError("");
            const datos = await obtenerUsuariosAdmin();
            setUsuarios(datos);
        } catch {
            setError("No se pudieron cargar los usuarios.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { cargarUsuarios(); }, []);

    const getNombre = (u) =>
        [u?.nombre, u?.apellido1, u?.apellido2].filter(Boolean).join(" ") || "Sin nombre";

    const getRolLabel = (u) => {
        const r = String(u?.rol || "").toLowerCase();
        if (r === "alumno") return "Alumno";
        if (r === "profesor") return "Profesor";
        if (r === "admin") return "Admin";
        return "Usuario";
    };

    const getRolClasses = (u) => {
        const r = String(u?.rol || "").toLowerCase();
        if (r === "alumno") return "bg-[#2d5f5e] text-[#00d2a1]";
        if (r === "profesor") return "bg-[#5f3d2d] text-[#ffa726]";
        return "bg-[#3d2d5f] text-[#b39ddb]";
    };

    const totalAlumnos = useMemo(() => usuarios.filter(u => u?.rol === "alumno").length, [usuarios]);
    const totalProfesores = useMemo(() => usuarios.filter(u => u?.rol === "profesor").length, [usuarios]);
    const totalAdmins = useMemo(() => usuarios.filter(u => u?.rol === "admin").length, [usuarios]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return usuarios;
        return usuarios.filter(u =>
            getNombre(u).toLowerCase().includes(q) ||
            String(u.email || "").toLowerCase().includes(q)
        );
    }, [usuarios, query]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const visibleUsers = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    if (loading) return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <p className="text-sm text-[#9ba5b6]">Cargando panel administrativo...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0e182b] text-[#f6f7fa]">
            <main className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-12">

                <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">Dashboard Administrador</h1>
                <p className="mt-2 text-sm text-[#9ba5b6]">Gestiona usuarios, alumnos y recursos de la plataforma educativa.</p>

                {/* STATS */}
                <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <Metric label="Usuarios" value={usuarios.length} />
                    <Metric label="Alumnos" value={totalAlumnos} />
                    <Metric label="Profesores" value={totalProfesores} />
                    <Metric label="Admins" value={totalAdmins} />
                </section>

                {/* BUSCADOR */}
                <form
                    onSubmit={e => { e.preventDefault(); setQuery(search); setPage(1); }}
                    className="mt-8 flex w-full gap-3"
                >
                    <input
                        type="search"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por nombre o email"
                        className="min-h-10 flex-1 rounded-lg border border-[#324057] bg-[#101a2c] px-4 text-sm outline-none placeholder:text-[#9ba5b6] focus:border-[#59677e]"
                    />
                    <button
                        type="submit"
                        className="rounded-lg bg-[#e82b2f] px-4 text-sm font-bold transition hover:bg-[#ff3a3e]"
                    >
                        Buscar
                    </button>
                </form>

                {error && (
                    <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
                )}

                {/* TABLA — desktop */}
                <section className="mt-6 hidden overflow-x-auto rounded-xl border border-[#324057] bg-[#111b2c] sm:block">
                    <table className="w-full text-left text-sm">
                        <thead className="text-[11px] uppercase text-[#a6afbe]">
                            <tr>
                                <th className="px-6 py-4 font-bold">Nombre</th>
                                <th className="px-6 py-4 font-bold">Email</th>
                                <th className="px-6 py-4 font-bold">Rol</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleUsers.length === 0 ? (
                                <tr><td colSpan="3" className="px-6 py-12 text-center text-[#9ba5b6]">No se encontraron usuarios.</td></tr>
                            ) : visibleUsers.map(u => (
                                <tr key={u.id} className="border-t border-[#202d42] hover:bg-[#152137]">
                                    <td className="px-6 py-4 font-semibold">{getNombre(u)}</td>
                                    <td className="px-6 py-4 text-[#9ba5b6]">{u.email || "—"}</td>
                                    <td className="px-6 py-4">
                                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${getRolClasses(u)}`}>
                                            {getRolLabel(u)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {/* CARDS — móvil */}
                <section className="mt-6 flex flex-col gap-3 sm:hidden">
                    {visibleUsers.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-[#324057] px-5 py-8 text-center text-sm text-[#9ba5b6]">
                            No se encontraron usuarios.
                        </p>
                    ) : visibleUsers.map(u => (
                        <div key={u.id} className="rounded-xl border border-[#324057] bg-[#111b2c] px-4 py-4">
                            <div className="flex items-center justify-between gap-3">
                                <p className="font-semibold truncate">{getNombre(u)}</p>
                                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${getRolClasses(u)}`}>
                                    {getRolLabel(u)}
                                </span>
                            </div>
                            <p className="mt-1 truncate text-sm text-[#9ba5b6]">{u.email || "—"}</p>
                        </div>
                    ))}
                </section>

                {/* PAGINACIÓN */}
                <div className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[#9ba5b6]">
                        {filtered.length === 0 ? "0 usuarios" : `${(safePage - 1) * PAGE_SIZE + 1}-${Math.min(safePage * PAGE_SIZE, filtered.length)} de ${filtered.length}`}
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={safePage === 1}
                            onClick={() => setPage(c => c - 1)}
                            className="rounded-lg border border-[#324057] px-4 py-2 font-semibold transition hover:bg-[#172238] disabled:opacity-40"
                        >Anterior</button>
                        <button
                            disabled={safePage === totalPages}
                            onClick={() => setPage(c => c + 1)}
                            className="rounded-lg border border-[#324057] px-4 py-2 font-semibold transition hover:bg-[#172238] disabled:opacity-40"
                        >Siguiente</button>
                    </div>
                </div>

            </main>
        </div>
    );
}

function Metric({ label, value }) {
    return (
        <article className="rounded-xl border border-[#324057] bg-[#111b2c] px-4 py-5 sm:px-6">
            <p className="text-xs text-[#9ba5b6] sm:text-sm">{label}</p>
            <strong className="mt-2 block text-2xl font-bold text-[#ee2d31] sm:text-3xl">{value}</strong>
        </article>
    );
}

export default AdminDashboard;