import { Link } from "react-router";

const stats = [
  { value: "12.400+", label: "Estudiantes" },
  { value: "48", label: "Cursos" },
  { value: "24", label: "Instructores" },
  { value: "94%", label: "Tasa de empleo" },
];

export default function Home() {
  return (
    <div className="h-screen bg-[#0F172A] text-white overflow-hidden">
      <main className="h-screen flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="mb-10 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EF4444] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-red-500/20">
              &lt;&gt;
            </div>

            <span className="text-white text-xl font-black tracking-tight">
              AprenTIC
            </span>
          </div>

          <div className="inline-flex items-center gap-2 border border-slate-700/70 rounded-full px-4 py-1.5 text-xs text-slate-400 mb-8">
            <span className="text-yellow-400 text-xs">⚡</span>
            Nueva plataforma EdTech para desarrolladores
          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-[1.08] tracking-tight">
            EdTech
            <br />
            <span className="text-[#EF4444]">para</span>
            <br />
            <span className="bg-gradient-to-r from-[#EF4444] to-[#06B6D4] bg-clip-text text-transparent">
              Desarrolladores
            </span>
          </h1>

          <p className="mt-6 text-slate-400 text-sm md:text-base max-w-xl leading-relaxed">
            Aprende. Construye. Evoluciona.
            <br />
            Fórmate con proyectos reales y mentores de la industria.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              to="/login"
              className="px-6 py-3 bg-[#EF4444] hover:bg-[#DC2626] rounded-lg text-sm font-semibold transition-colors"
            >
              Comenzar a aprender
            </Link>

            <Link
              to="/cursos"
              className="px-6 py-3 border border-slate-700 hover:border-slate-500 rounded-lg text-sm font-semibold transition-colors"
            >
              Explorar cursos
            </Link>
          </div>
        </section>

        <section className="border-t border-slate-800">
          <div className="max-w-6xl mx-auto grid grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center py-7">
                <p className="text-2xl md:text-3xl font-black text-[#EF4444]">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
