// pages/alumno/AlumnoDashboard.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from "../../hooks/useAuth"
import { getModulos } from '../../services/modulos.service'

// TODO: importar cuando exista el service de promociones
// import { getPromocionById } from '../../services/promociones.service'

// ── ICONOS por nombre de módulo ──
const ICONOS = {
    javascript: '⚡',
    react: '⚛️',
    node: '🟢',
    css: '🎨',
}

const AlumnoDashboard = () => {
    const navigate = useNavigate()
    const { usuario } = useAuth()

    const [alumno, setAlumno] = useState(null)
    const [modulos, setModulos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setLoading(true)

                const mods = await getModulos()

                setAlumno({
                    nombre: usuario?.displayName || usuario?.email,
                    promocion: {
                        nombre: 'FullStack Sevilla Web 2026', // TODO: await getPromocionById(usuario.promociones_id[0])
                        fechaInicio: new Date('2026-01-15'),   // TODO: traer de Firestore
                    }
                })

                setModulos(mods)
            } catch (error) {
                console.error('Error cargando datos del alumno:', error)
            } finally {
                setLoading(false)
            }
        }

        cargarDatos()
    }, [usuario])

    if (loading) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <p className="text-white text-lg">Cargando...</p>
        </div>
    )

    const totalHoras = modulos.reduce((acc, m) => acc + (m.horas || 0), 0)
    const totalLecciones = modulos.reduce((acc, m) => acc + (m.lecciones_id?.length || 0), 0)
    const diasEnBootcamp = alumno?.promocion?.fechaInicio
        ? Math.floor((new Date() - alumno.promocion.fechaInicio) / (1000 * 60 * 60 * 24))
        : 0

    return (
        <div className="min-h-screen bg-gray-950 text-white px-6 py-10 max-w-5xl mx-auto">

            {/* SALUDO */}
            <section className="mb-10">
                <h1 className="text-4xl font-bold mb-1">
                    Hola, {alumno?.nombre} 👋
                </h1>
                <p className="text-gray-400 text-sm">
                    {alumno?.promocion?.nombre}
                </p>
            </section>

            {/* STATS */}
            <section className="grid grid-cols-3 gap-4 mb-12">
                <div className="bg-gray-800 rounded-2xl p-6">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">
                        Días en el bootcamp
                    </p>
                    <p className="text-4xl font-bold text-cyan-400">{diasEnBootcamp}</p>
                </div>
                <div className="bg-gray-800 rounded-2xl p-6">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">
                        Horas totales
                    </p>
                    <p className="text-4xl font-bold text-cyan-400">{totalHoras}h</p>
                </div>
                <div className="bg-gray-800 rounded-2xl p-6">
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">
                        Lecciones disponibles
                    </p>
                    <p className="text-4xl font-bold text-cyan-400">{totalLecciones}</p>
                </div>
            </section>

            {/* MÓDULOS */}
            <section>
                <h2 className="text-xl font-semibold mb-6">Mis módulos</h2>
                <div className="grid grid-cols-2 gap-4">
                    {modulos.map((modulo) => (
                        <div
                            key={modulo.id}
                            onClick={() => navigate(`/${modulo.id}`)}
                            className="bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer rounded-2xl p-6 flex items-center gap-5"
                        >
                            <div className="text-4xl">
                                {ICONOS[modulo.nombre?.toLowerCase()] || '📘'}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">{modulo.nombre}</h3>
                                <p className="text-gray-400 text-sm">
                                    {modulo.horas}h · {modulo.lecciones_id?.length || 0} lecciones
                                </p>
                                <span className="inline-block mt-2 text-xs text-cyan-400 font-medium">
                                    Continuar →
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </div>
    )
}

export default AlumnoDashboard
