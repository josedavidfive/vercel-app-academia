import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import CursosPopulares from "./CursosPopulares.jsx";

export default function Cursos() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f8fafc]">
      <Navbar />

      <main>
        <section className="border-b border-[#1f2937] px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#06b6d4]">
              Catálogo público
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
              Cursos para seguir construyendo tu perfil tech
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-[#94a3b8] sm:text-base">
              Esta vista muestra el catálogo público disponible actualmente. No
              consulta datos privados ni expone información interna del campus.
            </p>
          </div>
        </section>

        <CursosPopulares />
      </main>

      <Footer />
    </div>
  );
}
