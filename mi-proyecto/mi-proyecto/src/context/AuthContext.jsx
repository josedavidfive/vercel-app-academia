import { useState, useEffect } from "react";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { buscarRolPorUid } from "../services/usuarioService";
import { AuthContext } from "../hooks/useAuth";

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [rol, setRol] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorAuth, setErrorAuth] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCargando(true);
      setErrorAuth(null);

      try {
        if (!user) {
          setUsuario(null);
          setRol(null);
          return;
        }

        setUsuario(user);

        const rolEncontrado = await buscarRolPorUid(user.uid);

        if (!rolEncontrado) {
          console.error(
            "El usuario existe en Authentication, pero no tiene un perfil válido en Firestore.",
          );

          setRol(null);
          setErrorAuth(
            "El usuario existe en Authentication, pero no tiene un perfil valido en Firestore.",
          );
          return;
        }

        setRol(rolEncontrado);
      } catch (error) {
        console.error("Error buscando el rol:", error.code);
        console.error("Mensaje:", error.message);

        setRol(null);
        setErrorAuth("No se pudo cargar el perfil del usuario.");
      } finally {
        setCargando(false);
      }
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, rol, cargando, errorAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
