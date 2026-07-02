import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import AlumnoNavbar from '../../components/layout/AlumnoNavbar.jsx'
import { db } from '../../config/firebase'
import { useAuth } from '../../hooks/useAuth'
import { getModulosByPromocionActivos } from '../../services/modulos.service'
import { moduleName, sortModules } from '../../utils/modulos.js'

const AlumnoDashboard = () => {
    const navigate = useNavigate()
    const { usuario } = useAuth()

    const [alumno, setAlumno] = useState(null)
    const [modulos, setModulos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const cargarDatos = async () => {
            if (!usuario?.uid) { setLoading(false); return; }
            try {
                setLoading(true)
                setError("")

                // 1. Leer documento del alumno
                const alumnoSnap = await getDoc(doc(db, 'alumnos', usuario.uid))
                if (!alumnoSnap.exists()) { setError("No se encontró tu perfil."); return; }
                const alumnoData = alumnoSnap.data()

                // 2. Leer su primera promoción
                const promocionRef = alumnoData.promociones_id?.[0] || alumnoData.promocion?.[0]
                if (!promocionRef) { setError("No tienes ninguna promoción asignada."); return; }

                const promocionSnap = await getDoc(promocionRef)
                if (!promocionSnap.exists()) { setError("No se encontró tu promoción."); return; }
                const promocionData = promocionSnap.data()

                setAlumno({
                    nombre: alumnoData.nombre || usuario.email,
                    promocion: {
                        nombre: promocionData.nombre || "Sin promoción",
                        fechaInicio: typeof promocionData.fechaInicio?.toDate === 'function'
                            ? promocionData.fechaInicio.toDate()
                            : typeof promocionData.fechaInicio === 'string'
                                ? new Date(promocionData.fechaInicio)
                                : new Date(),
                    }
                })

                // 3. Cargar módulos activos de la promoción
                const mods = await getModulosByPromocionActivos(promocionRef)
                setModulos(sortModules(mods))

            } catch (error) {
                console.error('Error cargando datos del alumno:', error)
                setError("No se pudo cargar tu espacio de aprendizaje.")
            } finally {
                setLoading(false)
            }
        }
        cargarDatos()
    }, [usuario?.uid])

    if (loading) return (
        <div className="min-h-screen bg-[#0e182b] flex items-center justify-center">
            <AlumnoNavbar />
            <p className="text-[#9ba5b6] text-sm">Cargando tu espacio de aprendizaje...</p>
        </div>
    )

    const totalHoras = modulos.reduce((acc, m) => acc + (m.horas || 0), 0)
    const totalLecciones = modulos.reduce((acc, m) => acc + (m.lecciones_id?.length || 0), 0)
    const diasEnBootcamp = alumno?.promocion?.fechaInicio
        ? Math.floor((new Date() - alumno.promocion.fechaInicio) / (1000 * 60 * 60 * 24))
        : 0

    return (
        <div className="min-h-screen bg-[#0e182b] text-[#f6f7fa]">
            <AlumnoNavbar />
            <main className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 lg:py-14">

                {/* SALUDO */}
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Hola, <span className="text-[#ee2d31]">{alumno?.nombre}</span> 👋
                </h1>
                <p className="mt-2 text-sm text-[#9ba5b6]">{alumno?.promocion?.nombre}</p>

                {error && (
                    <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
                )}

                {/* STATS */}
                <section className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Metric label="Días en el bootcamp" value={diasEnBootcamp} />
                    <Metric label="Horas totales" value={`${totalHoras}h`} />
                    <Metric label="Lecciones disponibles" value={totalLecciones} />
                </section>

                {/* MÓDULOS */}
                <section className="mt-10">
                    <h2 className="text-xl font-bold">Mis módulos</h2>
                    {modulos.length === 0 ? (
                        <p className="mt-8 rounded-xl border border-dashed border-[#324057] px-5 py-8 text-sm text-[#9ba5b6]">
                            No tienes módulos disponibles todavía.
                        </p>
                    ) : (
                        <div className="mt-7 grid gap-4 sm:grid-cols-2">
                            {modulos.map((modulo, index) => (
                                <button
                                    key={modulo.id}
                                    onClick={() => navigate(`/alumno/${modulo.id}`)}
                                    className="flex min-h-[90px] items-center justify-between gap-4 rounded-xl border border-[#324057] bg-[#111b2c] px-6 py-5 text-left transition hover:border-[#06b6d4] hover:bg-[#132038]"
                                >
                                    <div>
                                        <h3 className="text-base font-semibold">
                                            Módulo {index + 1}: {moduleName(modulo)}
                                        </h3>
                                        <p className="mt-1 text-xs text-[#9ba5b6]">
                                            {modulo.horas || 0}h · {modulo.lecciones_id?.length || 0} lecciones
                                        </p>
                                    </div>
                                    <span className="rounded bg-[#063b39] px-2.5 py-1 text-[10px] font-bold uppercase text-[#00d2a1]">
                                        Continuar
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

            </main>
        </div>
    )
}

function Metric({ label, value }) {
    return (
        <article className="min-h-[116px] rounded-xl border border-[#324057] bg-[#111b2c] px-6 py-6">
            <p className="text-sm text-[#9ba5b6]">{label}</p>
            <strong className="mt-3 block text-3xl font-bold text-[#ee2d31]">{value}</strong>
        </article>
    )
}

export default AlumnoDashboard