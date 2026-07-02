import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "../services/auth.service";
import { useAuth } from "../hooks/useAuth";
import { loginSchema } from "../schemas/loginSchema";

export default function Login() {
  const { usuario, rol } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorAuth, setErrorAuth] = useState(null);
  const from = location.state?.from?.pathname || null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (!usuario || !rol) return;

    navigate(from || `/${rol}`, { replace: true });
  }, [from, usuario, rol, navigate]);

  async function onSubmit(datos) {
    setErrorAuth(null);

    try {
      await login(datos.email.trim().toLowerCase(), datos.password);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setErrorAuth(getLoginErrorMessage(error?.code));
    }
  }

  return (
    <main className="min-h-screen bg-[#0f172a] px-4 py-8 text-[#f8fafc] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-xl border border-[#1f2937] bg-[#111827] shadow-2xl shadow-black/30 lg:grid-cols-[minmax(0,1fr)_440px]">
          <section className="hidden bg-[#0b1220] p-10 lg:block">
            <Link
              to="/"
              className="inline-flex items-center gap-3 transition hover:text-[#06b6d4]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e53935] text-sm font-black text-white">
                AT
              </span>
              <span className="text-lg font-black">AprenTIC</span>
            </Link>

            <div className="mt-16 max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#06b6d4]">
                Campus privado
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight">
                Entra a tu espacio de aprendizaje
              </h1>
              <p className="mt-5 leading-7 text-[#94a3b8]">
                Accede a tus módulos, lecciones y herramientas según tu rol en
                la academia.
              </p>
            </div>

            <div className="mt-12 grid gap-3">
              {["Firebase Auth", "Firestore", "Rutas por rol"].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-[#1f2937] bg-[#0f172a] p-4"
                >
                  <p className="text-sm font-semibold">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="p-6 sm:p-8 lg:p-10">
            <div className="mb-8 lg:hidden">
              <Link to="/" className="text-lg font-bold">
                AprenTIC
              </Link>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7c3aed]">
                Bienvenido
              </p>
              <h2 className="mt-3 text-3xl font-bold">Iniciar sesión</h2>
              <p className="mt-2 text-sm leading-6 text-[#94a3b8]">
                Usa tus credenciales para continuar en la plataforma.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#e2e8f0]"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  className="min-h-11 w-full rounded-lg border border-[#334155] bg-[#0f172a] px-4 py-2.5 text-sm outline-none transition placeholder:text-[#64748b] hover:border-[#475569] focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-[#fca5a5]">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[#e2e8f0]"
                >
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password")}
                  className="min-h-11 w-full rounded-lg border border-[#334155] bg-[#0f172a] px-4 py-2.5 text-sm outline-none transition placeholder:text-[#64748b] hover:border-[#475569] focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
                />
                {errors.password && (
                  <p className="mt-2 text-sm text-[#fca5a5]">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {errorAuth && (
                <p
                  role="alert"
                  className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-sm text-[#fca5a5]"
                >
                  {errorAuth}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-11 w-full rounded-lg bg-[#e53935] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c62828] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ef4444] focus-visible:ring-offset-2 focus-visible:ring-offset-[#111827] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Accediendo..." : "Entrar"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-[#94a3b8]">
              El acceso está gestionado por Firebase Authentication.
            </p>
          </section>
        </div>
      </div>
    </main>
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
