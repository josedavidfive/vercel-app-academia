import { createUserWithEmailAndPassword } from "firebase/auth";
import { authSecondary, db, firebaseConfig } from "../config/firebase";

import {
    addDoc,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc
} from "firebase/firestore";

const generarPasswordTemporal = (nombre = "", apellido1 = "") => {
    const limpiarTexto = (valor = "") =>
        valor
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-zA-Z]/g, "")
            .toLowerCase();

    const nombreBase = limpiarTexto(nombre).slice(0, 2) || "al";
    const apellidoBase = limpiarTexto(apellido1).slice(0, 2) || "um";

    return `${nombreBase}${apellidoBase}123`;
};

const crearUsuarioAuth = async (email, password) => {
    const response = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password,
                returnSecureToken: true
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.error?.message || "No se pudo crear el usuario de autenticación.");
    }

    return data.localId;
};

//Alumnos

export const obtenerAlumnos = async () => {
    const alumnosRef = collection(db, "alumnos");

    const snapshot = await getDocs(alumnosRef);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};


export const crearAlumno = async (alumno) => {
    if (!alumno?.email) {
        throw new Error("El email del alumno es obligatorio");
    }

    const passwordTemporal = generarPasswordTemporal(alumno.nombre, alumno.apellido1);

    const uid = await crearUsuarioAuth(alumno.email, passwordTemporal);
    const alumnoRef = doc(db, "alumnos", uid);
    const promocionRef = alumno?.curso ? doc(db, "promociones", alumno.curso) : null;

    await setDoc(alumnoRef, {
        nombre: alumno.nombre,
        apellido1: alumno.apellido1 || "",
        apellido2: alumno.apellido2 || "",
        email: alumno.email,
        avatar: alumno.avatar || "/assets/avatar/avatar3.webp",
        promociones_id: promocionRef ? [promocionRef] : [],
        rol: "alumno",
        uid,
        createdAt: new Date().toISOString()
    });

    if (promocionRef) {
        const promocionSnap = await getDoc(promocionRef);

        if (promocionSnap.exists()) {
            await updateDoc(promocionRef, {
                alumnos_id: arrayUnion(alumnoRef)
            });
        }
    }

    return {
        id: uid,
        uid,
        password: passwordTemporal
    };
};


export const actualizarAlumno = async (id, datosActualizados) => {
    const alumnoRef = doc(db, "alumnos", id);

    await updateDoc(alumnoRef, datosActualizados);

};


export const eliminarAlumno = async (id) => {

    const alumnoRef = doc(db, "alumnos", id);

    await deleteDoc(alumnoRef);
};


//Profesores

export const obtenerProfesores = async () => {
    const profesoresRef = collection(db, "profesores");

    const snapshot = await getDocs(profesoresRef);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

export const obtenerUsuariosAdmin = async () => {
    const colecciones = [
        { coleccion: "alumnos", rol: "alumno" },
        { coleccion: "profesores", rol: "profesor" },
        { coleccion: "admin", rol: "admin" },
        //{ coleccion: "admins", rol: "admin" }
    ];

    const resultados = await Promise.all(
        colecciones.map(async ({ coleccion, rol }) => {
            const ref = collection(db, coleccion);
            const snapshot = await getDocs(ref);

            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                rol: doc.data()?.rol || rol
            }));
        })
    );

    return resultados.flat();
};


export const crearProfesor = async (profesor) => {
    const promocionRef = doc(db, "promociones", profesor.promocionId);
    const promocionSnap = await getDoc(promocionRef);
    const campusRef = promocionSnap.data()?.campus_id || null;

    const passwordTemporal = generarPasswordTemporal(profesor.nombre);

    const credenciales = await createUserWithEmailAndPassword(
        authSecondary,
        profesor.email,
        passwordTemporal
    );
    const uid = credenciales.user.uid;

    const profesorRef = doc(db, "profesores", uid);

    await setDoc(profesorRef, {
        nombre: profesor.nombre,
        email: profesor.email,
        avatar: "/assets/avatar/avatar2.webp",
        campus_id: campusRef,
        promocion_id: [promocionRef],
        isActive: true,
        rol: "profesor",
        uid,
        createdAt: new Date().toISOString()
    });

    if (promocionSnap.exists()) {
        await updateDoc(promocionRef, {
            profesores_id: arrayUnion(profesorRef)
        });
    }

    return { id: uid, uid, password: passwordTemporal };
};


export const actualizarProfesor = async (id, datosActualizados) => {
    const profesorRef = doc(db, "profesores", id);

    await updateDoc(profesorRef, datosActualizados);

};


export const eliminarProfesor = async (id) => {

    const profesorRef = doc(db, "profesores", id);

    await deleteDoc(profesorRef);
};

//campus

export const obtenerCampus = async () => {
    const campusRef = collection(db, "campus");

    const snapshot = await getDocs(campusRef);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};
export const crearCampus = async (campus) => {
    const campusRef = collection(db, "campus");

    const respuesta = await addDoc(campusRef, campus);

    return respuesta.id;

};

//promociones

export const obtenerPromociones = async () => {
    const promocionesRef = collection(db, "promociones");

    const snapshot = await getDocs(promocionesRef);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

export const crearPromocion = async (promocion) => {
    const promocionesRef = collection(db, "promociones");
    const campusRef = promocion?.campusId ? doc(db, "campus", promocion.campusId) : null;

    const respuesta = await addDoc(promocionesRef, {
        nombre: promocion?.nombre || "",
        campus_id: campusRef,
        fechaInicio: new Date().toISOString(),
        fechaFin: promocion?.fechaFin || null,
        alumnos_id: [],
        profesores_id: []
    });

    return respuesta.id;
};

export const actualizarPromocion = async (id, datosActualizados) => {
    const promocionRef = doc(db, "promociones", id);
    const datos = { ...datosActualizados };

    if (datos.campusId) {
        datos.campus_id = doc(db, "campus", datos.campusId);
        delete datos.campusId;
    }

    if (Array.isArray(datos.alumnos_id)) {
        datos.alumnos_id = datos.alumnos_id.map((alumnoId) => doc(db, "alumnos", alumnoId));
    }

    if (Array.isArray(datos.profesor_id)) {
        datos.profesor_id = datos.profesor_id.map((profesorId) => doc(db, "profesores", profesorId));
    }

    await updateDoc(promocionRef, datos);
};

//inscripciones
export const obtenerInscripciones = async () => {
    const inscripcionesRef = collection(db, "inscripciones");

    const snapshot = await getDocs(inscripcionesRef);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};
export const crearInscripcion = async (inscripcion) => {
    const inscripcionesRef = collection(db, "inscripciones");

    const respuesta = await addDoc(inscripcionesRef, inscripcion);

    return respuesta.id;
};