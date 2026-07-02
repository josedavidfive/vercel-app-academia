import { Link } from "react-router";

const moreCourses = [
  {
    title: "JavaScript moderno",
    duration: "6 semanas",
    level: "Inicial",
    detail: "Fundamentos del lenguaje, DOM, asincronía y buenas prácticas.",
    accent: "text-[#f59e0b]",
  },
  {
    title: "React aplicado",
    duration: "8 semanas",
    level: "Intermedio",
    detail: "Componentes, estado, rutas, formularios y consumo de servicios.",
    accent: "text-[#06b6d4]",
  },
  {
    title: "Backend con Firebase",
    duration: "5 semanas",
    level: "Intermedio",
    detail: "Auth, Firestore, reglas, servicios y persistencia real.",
    accent: "text-[#7c3aed]",
  },
  {
    title: "Portfolio profesional",
    duration: "4 semanas",
    level: "Avanzado",
    detail: "Construcción, revisión y presentación de proyectos finales.",
    accent: "text-[#22c55e]",
  },
];

export default function CursosPopulares() {
  return (
    <section
      id="mas-cursos"
      className="border-t border-[#1f2937] bg-[#0b1220] px-4 py-16 text-[#f8fafc] sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#06b6d4]">
              Más cursos
            </p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold sm:text-4xl">
              Especialízate después del bootcamp
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#94a3b8]">
              Amplía tu ruta con contenidos enfocados en empleabilidad,
              producto y desarrollo profesional. La misma experiencia AprenTIC,
              con itinerarios más específicos.
            </p>
          </div>

          <div className="rounded-xl border border-[#1f2937] bg-[#111827] p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-[#7c3aed]">
              Campus premium
            </p>
            <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
              Continúa desde tu panel, guarda progreso y conecta cada curso con
              tu portfolio final.
            </p>
            <Link
              to="/login"
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-[#334155] px-5 py-2.5 text-sm font-bold transition hover:border-[#06b6d4] hover:text-[#06b6d4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#06b6d4]"
            >
              Entrar al campus
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {moreCourses.map((course) => (
            <article
              key={course.title}
              className="flex min-h-64 flex-col rounded-lg border border-[#1f2937] bg-[#111827] p-5 transition hover:-translate-y-1 hover:border-[#06b6d4]/60 hover:shadow-xl hover:shadow-black/20"
            >
              <div>
                <p className={`text-sm font-bold ${course.accent}`}>
                  {course.level}
                </p>
                <h3 className="mt-3 text-xl font-bold">{course.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#94a3b8]">
                  {course.detail}
                </p>
              </div>

              <div className="mt-auto pt-6">
                <p className="text-xs uppercase tracking-wide text-[#94a3b8]">
                  Duración
                </p>
                <p className="mt-1 font-semibold text-[#f8fafc]">
                  {course.duration}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
