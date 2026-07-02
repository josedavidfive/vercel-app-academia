import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import ProfesorNavbar from "../../components/layout/ProfesorNavbar.jsx";
import { getAlumnosByProfesor } from "../../services/alumnos.service";
import {
  markProfessorConversationRead,
  sendProfessorMessage,
  subscribeConversation,
} from "../../services/conversaciones.service";

const PAGE_SIZE = 10;

function progressValue(alumno) {
  const value = Number(alumno.progreso ?? alumno.avance ?? 0);
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}

export default function SeguimientoProfesor() {
  const { usuario, cargando } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [alumnos, setAlumnos] = useState([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedStudentId, setSelectedStudentId] = useState(() => searchParams.get("chat") || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStudents() {
      if (!usuario?.uid) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError("");
        setAlumnos(await getAlumnosByProfesor(usuario.uid));
      } catch (loadError) {
        console.error("Error al cargar alumnos:", loadError);
        setError("No se pudieron cargar los alumnos de Firebase.");
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, [usuario?.uid]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return alumnos;
    return alumnos.filter((alumno) =>
      String(alumno.nombre || "").toLowerCase().includes(normalized),
    );
  }, [alumnos, query]);

  const selectedStudent = alumnos.find((alumno) => alumno.id === selectedStudentId) || null;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const visibleStudents = filtered.slice(start, start + PAGE_SIZE);

  function submitSearch(event) {
    event.preventDefault();
    setQuery(search);
    setPage(1);
  }

  function openConversation(alumno) {
    setSelectedStudentId(alumno.id);
    setSearchParams({ chat: alumno.id });
  }

  function closeConversation() {
    setSelectedStudentId("");
    setSearchParams({});
  }

  if (cargando || loading) return <ProfessorState message="Cargando alumnos..." />;

  return (
    <div className="profesor-theme min-h-screen bg-[#0e182b] text-[#f6f7fa]">
      <ProfesorNavbar />
      <main className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">Lista de alumnos</h1>
            <p className="mt-2 text-sm text-[#9ba5b6]">Consulta el progreso y abre una conversación directa con cada alumno.</p>
          </div>
          <form onSubmit={submitSearch} className="flex w-full max-w-sm gap-3">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Buscar alumno por nombre</span>
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ba5b6]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre"
                className="profesor-search-input min-h-10 w-full rounded-lg border border-[#324057] bg-[#101a2c] pl-11 pr-10 text-sm outline-none placeholder:text-[#9ba5b6] focus:border-[#59677e]"
              />
              {(search || query) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setQuery("");
                    setPage(1);
                  }}
                  className="profesor-search-clear absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[#9ba5b6] transition hover:bg-[#202d42] hover:text-white"
                  aria-label="Limpiar búsqueda y mostrar todos los alumnos"
                  title="Mostrar todos"
                >
                  ✕
                </button>
              )}
            </label>
            <button type="submit" className="min-h-10 rounded-lg bg-[#e82b2f] px-5 text-sm font-bold transition hover:bg-[#ff3a3e]">Buscar</button>
          </form>
        </div>

        {error && <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}

        <section className="mt-8 overflow-x-auto rounded-xl border border-[#324057] bg-[#111b2c]" aria-label="Lista de alumnos">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-[11px] uppercase text-[#a6afbe]">
              <tr>
                <th className="px-6 py-4 font-bold">Nombre</th>
                <th className="px-6 py-4 font-bold">Email</th>
                <th className="px-6 py-4 font-bold">Progreso</th>
                <th className="px-6 py-4 text-right font-bold">Conversación</th>
              </tr>
            </thead>
            <tbody>
              {visibleStudents.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-[#9ba5b6]">No se encontraron alumnos.</td></tr>
              ) : (
                visibleStudents.map((alumno) => {
                  const progress = progressValue(alumno);
                  return (
                    <tr key={alumno.id} className="profesor-table-row border-t border-[#202d42] transition hover:bg-[#152137]">
                      <td className="px-6 py-5 font-semibold">{alumno.nombre || "Sin nombre"}</td>
                      <td className="px-6 py-5 text-[#9ba5b6]">{alumno.email || "—"}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className="h-1.5 w-40 overflow-hidden rounded-full bg-[#3c475b]"><span className="block h-full rounded-full bg-[#ea2d31]" style={{ width: `${progress}%` }} /></span>
                          <span className="min-w-9 text-xs text-[#9ba5b6]">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button type="button" onClick={() => openConversation(alumno)} className="inline-flex items-center gap-2 rounded-lg border border-[#3a4961] bg-[#172238] px-4 py-2 text-xs font-bold transition hover:border-[#e82b2f] hover:text-[#ff5558]">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /></svg>
                          Mensaje
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>

        <div className="mt-8 flex flex-col gap-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[#9ba5b6]">
            {filtered.length === 0 ? "Mostrando 0 alumnos" : `Mostrando ${start + 1}-${Math.min(start + PAGE_SIZE, filtered.length)} de ${filtered.length} alumnos`}
          </p>
          <div className="flex gap-2">
            <button type="button" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-lg border border-[#324057] px-4 py-2 font-semibold transition hover:bg-[#172238] disabled:cursor-not-allowed disabled:opacity-40">Anterior</button>
            <button type="button" disabled={safePage === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-lg border border-[#324057] px-4 py-2 font-semibold transition hover:bg-[#172238] disabled:cursor-not-allowed disabled:opacity-40">Siguiente</button>
          </div>
        </div>
      </main>

      {selectedStudent && (
        <ConversationPanel
          key={selectedStudent.id}
          alumno={selectedStudent}
          profesorId={usuario.uid}
          onClose={closeConversation}
        />
      )}
    </div>
  );
}

function ConversationPanel({ alumno, profesorId, onClose }) {
  const [messages, setMessages] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEnd = useRef(null);

  useEffect(() => {
    markProfessorConversationRead(profesorId, alumno.id).catch((readError) => {
      console.error("No se pudo marcar la conversación como leída:", readError);
    });

    return subscribeConversation(
      profesorId,
      alumno.id,
      setMessages,
      (subscribeError) => {
        console.error("Error al cargar la conversación:", subscribeError);
        setError("No se pudo cargar la conversación.");
      },
    );
  }, [alumno.id, profesorId]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(event) {
    event.preventDefault();
    if (!text.trim()) return;
    try {
      setSending(true);
      setError("");
      await sendProfessorMessage({ profesorId, alumno, texto: text });
      setText("");
    } catch (sendError) {
      console.error("Error al enviar mensaje:", sendError);
      setError("No se pudo enviar el mensaje.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/55 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Conversación con ${alumno.nombre}`}>
      <section className="profesor-chat-panel flex h-full w-full max-w-lg flex-col border-l border-[#324057] bg-[#101a2c] shadow-2xl">
        <header className="flex items-center justify-between border-b border-[#324057] px-6 py-5">
          <div>
            <p className="font-bold">{alumno.nombre || "Alumno"}</p>
            <p className="mt-1 text-xs text-[#9ba5b6]">{alumno.email}</p>
          </div>
          <button type="button" onClick={onClose} className="profesor-chat-close flex h-9 w-9 items-center justify-center rounded-lg text-[#9ba5b6] transition hover:bg-[#202d42] hover:text-white" aria-label="Cerrar conversación">✕</button>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-5">
          {messages === null ? (
            <p className="py-10 text-center text-sm text-[#9ba5b6]">Cargando conversación...</p>
          ) : messages.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-semibold">Inicia la conversación</p>
              <p className="mt-2 text-sm text-[#9ba5b6]">Escribe el primer mensaje para {alumno.nombre || "este alumno"}.</p>
            </div>
          ) : (
            messages.map((message) => {
              const ownMessage = message.remitente_id === profesorId;
              return (
                <div key={message.id} className={`flex ${ownMessage ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 ${ownMessage ? "rounded-br-md bg-[#e82b2f] text-white" : "profesor-chat-received rounded-bl-md bg-[#202d42] text-[#f6f7fa]"}`}>
                    <p>{message.texto}</p>
                    <p className={`mt-1 text-[9px] ${ownMessage ? "text-white/65" : "text-[#9ba5b6]"}`}>{formatMessageTime(message.creado_en)}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEnd} />
        </div>

        <form onSubmit={sendMessage} className="border-t border-[#324057] p-5">
          {error && <p className="mb-3 text-xs text-red-300">{error}</p>}
          <div className="flex gap-3">
            <textarea value={text} onChange={(event) => setText(event.target.value)} rows="2" placeholder="Escribe un mensaje..." className="profesor-chat-input min-h-12 flex-1 resize-none rounded-xl border border-[#324057] bg-[#0e182b] px-4 py-3 text-sm outline-none placeholder:text-[#68758a] focus:border-[#59677e]" />
            <button type="submit" disabled={sending || !text.trim()} className="self-end rounded-xl bg-[#e82b2f] px-5 py-3 text-sm font-bold transition hover:bg-[#ff3a3e] disabled:cursor-not-allowed disabled:opacity-50">Enviar</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function formatMessageTime(timestamp) {
  if (!timestamp?.toDate) return "Enviando...";
  return timestamp.toDate().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function ProfessorState({ message }) {
  return (
    <div className="profesor-theme min-h-screen bg-[#0e182b] text-white">
      <ProfesorNavbar />
      <main className="flex min-h-[60vh] items-center justify-center"><p className="text-sm text-[#9ba5b6]">{message}</p></main>
    </div>
  );
}
