import { addDoc, collection, doc, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { db } from "../config/firebase";
import { useAuth } from "../hooks/useAuth";
import { login as loginWithFirebase } from "../services/auth.service";
import { getCampus } from "../services/campus.service";

const stats = [
  { value: "1.848.333", label: "Estudiantes" },
  { value: "5.000+", label: "Colaboradores" },
  { value: "2013", label: "Fundado en" },
];
const technologies = [
  { name: "JavaScript", icon: "", color: "#f59e0b" },
  { name: "Python", icon: "bolt", color: "#3b82f6" },
  { name: "HTML & CSS", icon: "", color: "#ef4444" },
  { name: "React", icon: "react", color: "#06b6d4" },
  { name: "Node.js", icon: "hexagon", color: "#22c55e" },
  { name: "TypeScript", icon: "", color: "#3b82f6" },
  { name: "DevOps", icon: "dot", color: "#7c3aed" },
  { name: "Git & GitHub", icon: "git", color: "#f8fafc" },
];
const courses = [
  { title: "React Fundamentals", duration: "8 sem", level: "Inicial", track: "Frontend", color: "#06b6d4", shape: "react", code: "01" },
  { title: "Full-Stack JavaScript", duration: "12 sem", level: "Intermedio", track: "Full Stack", color: "#7c3aed", shape: "terminal", code: "02" },
  { title: "Ciberseguridad", duration: "6 sem", level: "Inicial", track: "Security", color: "#ef3f3f", shape: "shield", code: "03" },
  { title: "Node.js & APIs", duration: "9 sem", level: "Intermedio", track: "Backend", color: "#22c55e", shape: "node", code: "04" },
  { title: "Python Backend", duration: "10 sem", level: "Intermedio", track: "Backend", color: "#f59e0b", shape: "python", code: "05" },
  { title: "DevOps & Cloud", duration: "8 sem", level: "Avanzado", track: "Cloud", color: "#3b82f6", shape: "cloud", code: "06" },
];

function Brand() {
  return (
    <Link to="/" className="inline-flex items-center gap-3" aria-label="AprenTIC, inicio">
      <span className="flex h-7 w-7 rotate-45 items-center justify-center rounded-[6px] bg-[#ef3f3f] shadow-lg shadow-red-950/20">
        <span className="-rotate-45 text-[10px] font-black text-white">&lt;&gt;</span>
      </span>
      <span className="text-base font-extrabold tracking-tight text-[var(--home-text)]">AprenTIC</span>
    </Link>
  );
}

function TechIcon({ type }) {
  if (!type) return <span className="h-5" />;
  if (type === "bolt") return <span className="text-3xl leading-none">ϟ</span>;
  if (type === "react") return <span className="text-3xl leading-none">✦</span>;
  if (type === "hexagon") return <span className="text-3xl leading-none">⬢</span>;
  if (type === "dot") return <span className="text-2xl leading-none">•</span>;
  return <span className="text-2xl leading-none tracking-[5px]">•••</span>;
}

function CourseShape({ shape, color }) {
  if (shape === "shield") {
    return (
      <span className="h-12 w-12" style={{ backgroundColor: color, clipPath: "polygon(50% 0, 90% 18%, 90% 58%, 76% 80%, 50% 100%, 24% 80%, 10% 58%, 10% 18%)" }} />
    );
  }
  const symbols = { react: "⚛", terminal: "</>", node: "⬢", python: "Py", cloud: "☁" };
  return (
    <span className="flex h-16 w-16 items-center justify-center rounded-2xl border font-mono text-xl font-black shadow-2xl"
      style={{ color, borderColor: `${color}80`, backgroundColor: `${color}18`, boxShadow: `0 18px 50px ${color}20` }}>
      {symbols[shape] || "<>"}
    </span>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { usuario, rol } = useAuth();
  const [lightMode, setLightMode] = useState(() => window.localStorage.getItem("aprentic-theme") === "light");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Modal inscripción
  const [modalInscripcion, setModalInscripcion] = useState(false);
  const [campus, setCampus] = useState([]);
  const [inscNombre, setInscNombre] = useState("");
  const [inscApellido, setInscApellido] = useState("");
  const [inscApellido2, setInscApellido2] = useState("");
  const [inscEmail, setInscEmail] = useState("");
  const [inscCampusId, setInscCampusId] = useState("");
  const [inscObservaciones, setInscObservaciones] = useState("");
  const [inscError, setInscError] = useState("");
  const [inscExito, setInscExito] = useState(false);
  const [inscGuardando, setInscGuardando] = useState(false);

  useEffect(() => {
    window.localStorage.setItem("aprentic-theme", lightMode ? "light" : "dark");
    document.documentElement.dataset.aprenticTheme = lightMode ? "light" : "dark";
    document.documentElement.style.colorScheme = lightMode ? "light" : "dark";
  }, [lightMode]);

  useEffect(() => {
    if (usuario && rol) navigate(`/${rol}`, { replace: true });
  }, [navigate, rol, usuario]);

  useEffect(() => {
    if (modalInscripcion && campus.length === 0) {
      getCampus().then(setCampus).catch(() => { });
    }
  }, [modalInscripcion]);

  const abrirModal = () => {
    setInscNombre(""); setInscApellido(""); setInscApellido2("");
    setInscEmail(""); setInscCampusId(""); setInscObservaciones("");
    setInscError(""); setInscExito(false);
    setModalInscripcion(true);
  };

  const handleInscripcion = async (e) => {
    e.preventDefault();
    if (!inscNombre.trim() || !inscApellido.trim() || !inscApellido2.trim() || !inscEmail.trim() || !inscCampusId || !inscObservaciones.trim()) {
      setInscError("Todos los campos son obligatorios.");
      return;
    }
    try {
      setInscGuardando(true);
      setInscError("");
      const campusRef = doc(db, "campus", inscCampusId);
      await addDoc(collection(db, "inscripciones"), {
        nombre: inscNombre.trim(),
        apellido: inscApellido.trim(),
        apellido2: inscApellido2.trim(),
        email: inscEmail.trim(),
        campus_id: campusRef,
        observaciones: inscObservaciones.trim(),
        aceptada: false,
        creadoEn: Timestamp.now(),
        actualizadoEn: Timestamp.now(),
      });
      setInscExito(true);
    } catch {
      setInscError("No se pudo enviar la solicitud. Inténtalo de nuevo.");
    } finally {
      setInscGuardando(false);
    }
  };

  const theme = lightMode
    ? { "--home-bg": "#f3f4f6", "--home-surface": "#ffffff", "--home-surface-alt": "#f8fafc", "--home-field": "#eef1f5", "--home-border": "#d5dae3", "--home-text": "#243044", "--home-muted": "#657084" }
    : { "--home-bg": "#0c1628", "--home-surface": "#101b2e", "--home-surface-alt": "#171d25", "--home-field": "#080d16", "--home-border": "#2b3950", "--home-text": "#edf2f7", "--home-muted": "#798497" };

  async function openLogin(event) {
    event.preventDefault();
    setLoginError("");
    try {
      setSubmitting(true);
      await loginWithFirebase(email.trim().toLowerCase(), password);
    } catch (error) {
      setLoginError(getLoginErrorMessage(error?.code));
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "min-h-10 w-full rounded-lg border border-[var(--home-border)] bg-[var(--home-field)] px-4 text-xs text-[var(--home-text)] outline-none transition placeholder:text-[var(--home-muted)] focus:border-[#ef3f3f] focus:ring-2 focus:ring-[#ef3f3f]/15";
  const modalInputClass = "min-h-10 w-full rounded-lg border border-[#2b3950] bg-[#080d16] px-4 text-xs text-white outline-none placeholder:text-[#798497] focus:border-[#ef3f3f]";

  return (
    <div style={theme} className="min-h-screen bg-[var(--home-bg)] text-[var(--home-text)] transition-colors duration-300">
      <header className="mx-auto flex max-w-[1380px] flex-col-reverse items-start gap-5 px-5 py-6 sm:h-24 sm:flex-row sm:items-center sm:justify-between sm:gap-0 sm:px-8 sm:py-0">
        <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase text-[var(--home-muted)]">
          <span className="text-[#f5b51b]">ϟ</span>
          Nueva plataforma EdTech para desarrolladores
        </p>
        <div className="flex items-center gap-5">
          <button type="button" onClick={() => setLightMode(c => !c)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--home-border)] bg-[var(--home-surface)] text-[var(--home-text)] transition hover:-translate-y-0.5 hover:border-[#ef3f3f]"
            aria-label={lightMode ? "Activar modo oscuro" : "Activar modo claro"}>
            {lightMode ? (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></svg>
            ) : (
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            )}
          </button>
          <Brand />
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative mx-auto min-h-[calc(100vh-6rem)] max-w-[1380px] px-5 pb-24 pt-14 sm:px-8 lg:pt-20">
          <div aria-hidden="true" className="pointer-events-none absolute left-1/4 top-1/3 h-80 w-80 rounded-full bg-[#ef3f3f]/[0.025] blur-[110px]" />
          <div className="relative mx-auto w-full max-w-[1140px]">
            <h1 className="text-4xl font-black leading-[1.08] tracking-[-0.045em] sm:text-6xl xl:text-[64px]">
              EdTech for
              <span className="mt-3 block text-[#f33b3e]">Web Developers</span>
            </h1>
            <div className="mt-3 h-[3px] w-56 bg-[#f33b3e] sm:w-[320px]" />
            <p className="ml-auto mt-20 max-w-2xl text-right text-sm leading-6 text-[var(--home-muted)] sm:text-base">
              Learn. Build. Evolve.
              <br />
              Fórmate con proyectos reales y mentores de la industria líder.
            </p>
            <div className="mx-auto mt-16 flex w-full flex-col justify-center gap-3 border-b-2 border-[#ef3f3f] pb-1 sm:w-fit sm:flex-row sm:gap-5">
              <a href="#login"
                className="inline-flex min-h-[52px] items-center justify-center rounded-md bg-[#f33b3e] px-8 text-xs font-bold text-white shadow-xl shadow-red-950/10 transition hover:-translate-y-0.5 hover:bg-[#ff4b4e]">
                Start Learning
              </a>
              <a href="#" onClick={e => { e.preventDefault(); abrirModal(); }}
                className="inline-flex min-h-[52px] items-center justify-center rounded-md bg-[#f33b3e] px-8 text-xs font-bold text-white shadow-xl shadow-red-950/10 transition hover:-translate-y-0.5 hover:bg-[#ff4b4e]">
                Solicitar Inscripción
              </a>
              <a href="#cursos"
                className="inline-flex min-h-[52px] items-center justify-center rounded-md border border-[var(--home-border)] bg-[var(--home-surface)] px-8 text-xs font-bold text-[var(--home-text)] transition hover:-translate-y-0.5 hover:border-[#53627a]">
                Explore Courses
              </a>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mx-auto max-w-[1380px] px-5 py-28 sm:px-8 lg:py-32">
          <div className="grid gap-6 md:grid-cols-3">
            {stats.map(stat => (
              <article key={stat.label} className="relative flex min-h-[150px] flex-col items-center justify-center overflow-hidden rounded-xl border border-[var(--home-border)] bg-[var(--home-surface)] px-6 py-7 text-center shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
                <p className="text-3xl font-extrabold tracking-tight">{stat.value}</p>
                <p className="mt-2 text-sm font-medium text-[var(--home-muted)]">{stat.label}</p>
              </article>
            ))}
          </div>
          <div className="mt-28 lg:mt-32">
            <h2 className="text-3xl font-extrabold tracking-tight">Domina el Stack</h2>
            <p className="mt-3 text-sm text-[var(--home-muted)]">Tecnologías de vanguardia impartidas por expertos que construyen el futuro digital.</p>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {technologies.map(technology => (
                <article key={technology.name} className="relative flex min-h-20 flex-col justify-between rounded-xl border border-[var(--home-border)] bg-[var(--home-surface-alt)] p-4 transition hover:-translate-y-1 hover:border-[#536076]">
                  <span className="absolute right-5 top-5 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: technology.color }} />
                  <TechIcon type={technology.icon} />
                  <h3 className="text-sm font-bold text-[var(--home-text)]">{technology.name}</h3>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* LOGIN */}
        <section id="login" className="mx-auto grid max-w-[1380px] scroll-mt-8 gap-16 px-5 py-28 sm:px-8 lg:grid-cols-[1.45fr_1fr] lg:items-center lg:py-32">
          <div className="min-h-[270px] overflow-hidden rounded-xl border border-[var(--home-border)] bg-[var(--home-surface-alt)]">
            <div className="flex h-8 items-center gap-2 border-b border-[var(--home-border)] bg-[var(--home-surface)] px-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ef5350]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
            </div>
            <pre className="overflow-x-auto p-6 font-mono text-xs leading-7 text-[var(--home-text)]">
              <code>{`interface `}<span className="text-[#ef3f3f]">Course</span>{` {\n  id: `}<span className="text-[#06b6d4]">string</span>{`;\n  title: `}<span className="text-[#06b6d4]">string</span>{`;\n  isActive: `}<span className="text-[#06b6d4]">boolean</span>{`;\n}`}</code>
            </pre>
          </div>
          <div className="rounded-2xl border border-[var(--home-border)] bg-[var(--home-surface-alt)] p-7 shadow-2xl shadow-black/10 sm:p-8">
            <h2 className="text-xl font-bold">Bienvenido de nuevo</h2>
            <p className="mt-2 text-sm text-[var(--home-muted)]">Continúa tu formación en desarrollo</p>
            <form onSubmit={openLogin} className="mt-7 space-y-4">
              <div>
                <label htmlFor="home-email" className="mb-2 block text-[9px] font-bold uppercase text-[var(--home-text)]">Correo electrónico</label>
                <input id="home-email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required placeholder="tu@ejemplo.com" className={inputClass} />
              </div>
              <div>
                <label htmlFor="home-password" className="mb-2 block text-[9px] font-bold uppercase text-[var(--home-text)]">Contraseña</label>
                <input id="home-password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" required placeholder="••••••••" className={inputClass} />
              </div>
              {loginError && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">{loginError}</p>}
              <button type="submit" disabled={submitting} className="min-h-11 w-full rounded-lg bg-[#ef3f3f] px-5 text-xs font-bold text-white transition hover:bg-[#ff514d] disabled:opacity-60">
                {submitting ? "Accediendo..." : "Iniciar Sesión"}
              </button>
            </form>
          </div>
        </section>

        {/* CURSOS */}
        <section id="cursos" className="mx-auto max-w-[1380px] scroll-mt-8 px-5 py-28 sm:px-8 lg:py-32">
          <h2 className="text-2xl font-extrabold tracking-tight">Cursos Destacados</h2>
          <div className="mt-11 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
              <article key={course.title} className="group overflow-hidden rounded-xl border border-[var(--home-border)] bg-[var(--home-surface)] shadow-lg transition hover:-translate-y-1.5 hover:shadow-2xl" style={{ borderTopColor: course.color, borderTopWidth: 3 }}>
                <div className="relative flex h-40 items-center justify-center overflow-hidden bg-[var(--home-field)]"
                  style={{ backgroundImage: "linear-gradient(var(--home-border) 1px, transparent 1px), linear-gradient(90deg, var(--home-border) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
                  <span className="absolute left-4 top-4 font-mono text-[10px] font-bold text-[var(--home-muted)]">PATH_{course.code}</span>
                  <span className="absolute right-4 top-4 h-2 w-2 rounded-full" style={{ backgroundColor: course.color }} />
                  <CourseShape shape={course.shape} color={course.color} />
                </div>
                <div className="p-5">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: course.color }}>{course.track}</p>
                  <h3 className="mt-2 text-base font-bold">{course.title}</h3>
                  <p className="mt-3 text-[10px] text-[var(--home-muted)]">{course.duration}<span className="mx-2">•</span><span style={{ color: course.color }}>{course.level}</span></p>
                  <button type="button" onClick={abrirModal}
                    className="mt-4 inline-flex min-h-9 w-full items-center justify-center rounded-md bg-[#ef3f3f] text-[10px] font-bold text-white transition hover:bg-[#ff514d]">
                    Solicitar plaza
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--home-border)] bg-[var(--home-field)]">
        <div className="mx-auto grid max-w-[1380px] gap-8 px-5 py-9 sm:px-8 md:grid-cols-3 md:items-center">
          <div>
            <Brand />
            <p className="mt-3 text-[9px] text-[var(--home-muted)]">Learn. Build. Evolve.</p>
          </div>
          <p className="text-center text-[9px] text-[var(--home-muted)]">© 2026 AprenTIC. Todos los derechos reservados.</p>
          <nav aria-label="Enlaces de pie de página" className="flex flex-wrap justify-start gap-5 text-[9px] font-semibold text-[var(--home-text)] md:justify-end">
            <a href="#instagram">Instagram</a>
            <a href="#linkedin">LinkedIn</a>
            <a href="#twitter">Twitter</a>
            <a href="#contacto">Contacto</a>
          </nav>
        </div>
      </footer>

      {/* MODAL INSCRIPCIÓN */}
      {modalInscripcion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2b3950] bg-[#0c1628] p-8 max-h-[90vh] overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Solicitar Inscripción</h3>
              <button onClick={() => setModalInscripcion(false)} className="text-[#798497] hover:text-white">✕</button>
            </div>

            {inscExito ? (
              <div className="text-center py-6">
                <p className="text-4xl mb-4">✅</p>
                <p className="text-lg font-bold text-white mb-2">¡Solicitud enviada!</p>
                <p className="text-sm text-[#798497] mb-6">Nos pondremos en contacto contigo pronto.</p>
                <button onClick={() => setModalInscripcion(false)}
                  className="rounded-lg bg-[#ef3f3f] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#ff514d]">
                  Cerrar
                </button>
              </div>
            ) : (
              <form onSubmit={handleInscripcion} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[9px] font-bold uppercase text-[#798497]">Nombre *</label>
                  <input type="text" value={inscNombre} onChange={e => setInscNombre(e.target.value)} placeholder="Tu nombre" required className={modalInputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[9px] font-bold uppercase text-[#798497]">Apellido 1 *</label>
                  <input type="text" value={inscApellido} onChange={e => setInscApellido(e.target.value)} placeholder="Tu primer apellido" required className={modalInputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[9px] font-bold uppercase text-[#798497]">Apellido 2 *</label>
                  <input type="text" value={inscApellido2} onChange={e => setInscApellido2(e.target.value)} placeholder="Tu segundo apellido" required className={modalInputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[9px] font-bold uppercase text-[#798497]">Email *</label>
                  <input type="email" value={inscEmail} onChange={e => setInscEmail(e.target.value)} placeholder="tu@ejemplo.com" required className={modalInputClass} />
                </div>
                <div>
                  <label className="mb-1.5 block text-[9px] font-bold uppercase text-[#798497]">Campus *</label>
                  <select value={inscCampusId} onChange={e => setInscCampusId(e.target.value)} required
                    className="min-h-10 w-full rounded-lg border border-[#2b3950] bg-[#080d16] px-4 text-xs text-white outline-none focus:border-[#ef3f3f]">
                    <option value="">Selecciona un campus</option>
                    {campus.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[9px] font-bold uppercase text-[#798497]">Mensaje *</label>
                  <textarea value={inscObservaciones} onChange={e => setInscObservaciones(e.target.value)} rows={3}
                    placeholder="Cuéntanos algo sobre ti y por qué quieres unirte..." required
                    className="w-full rounded-lg border border-[#2b3950] bg-[#080d16] px-4 py-3 text-xs text-white outline-none placeholder:text-[#798497] focus:border-[#ef3f3f] resize-none" />
                </div>
                {inscError && <p className="text-xs text-red-400">{inscError}</p>}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setModalInscripcion(false)}
                    className="flex-1 rounded-lg border border-[#2b3950] py-3 text-xs font-semibold text-white transition hover:bg-[#101b2e]">Cancelar</button>
                  <button type="submit" disabled={inscGuardando}
                    className="flex-1 rounded-lg bg-[#ef3f3f] py-3 text-xs font-bold text-white transition hover:bg-[#ff514d] disabled:opacity-50">
                    {inscGuardando ? "Enviando..." : "Enviar solicitud"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function getLoginErrorMessage(code) {
  const messages = {
    "auth/invalid-credential": "Email o contraseña inválidos.",
    "auth/user-not-found": "No existe una cuenta con ese email.",
    "auth/wrong-password": "Email o contraseña inválidos.",
    "auth/too-many-requests": "Demasiados intentos. Prueba de nuevo más tarde.",
    "auth/network-request-failed": "No se pudo conectar. Revisa tu conexión.",
    "auth/user-disabled": "Esta cuenta está deshabilitada.",
  };
  return messages[code] || "No se pudo iniciar sesión. Revisa tus datos.";
}