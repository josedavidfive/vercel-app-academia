# AprenTIC Academy

## Descripción

AprenTIC Academy es una aplicación web educativa desarrollada con React, Vite y Firebase para gestionar una experiencia de formación completa. El proyecto permite la administración de usuarios, cursos, promociones, inscripciones y material formativo desde tres perfiles principales: administrador, profesor y alumno.

Tiene como objetivo ofrecer una base sólida para la gestión de academias online, con autenticación segura, paneles especializados por rol, rutas privadas y una integración centralizada con Firebase.

## Requisitos previos

- Node.js 18 o superior
- npm 10 o superior (también compatible con Yarn)
- Navegador moderno compatible con aplicaciones SPA
- Conexión a Internet para instalar dependencias y usar Firebase

## Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/AprenTIC_Academy_-FullStack_Web_Sevilla_Group_2.git
```

2. Accede al directorio del proyecto React:

```bash
cd "c:\Users\user\Documents\AprenTIC_Academy_-FullStack_Web_Sevilla_Group_2\mi-proyecto"
```

3. Instala las dependencias:

```bash
npm install
```

## Ejecución

### Desarrollo

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Abre en el navegador la URL que muestre Vite, típicamente:

```text
http://localhost:5173
```

### Producción

Construye la aplicación para producción:

```bash
npm run build
```

Previsualiza el build:

```bash
npm run preview
```

## Uso mínimo

1. Abre la aplicación en el navegador.
2. Inicia sesión con un usuario válido registrado en Firebase.
3. Navega según tu rol:
   - Administrador: gestionar alumnos, profesores, campus, promociones e inscripciones.
   - Profesor: gestionar módulos y lecciones.
   - Alumno: visualizar lecciones y seguimiento.

## Notas importantes

- La configuración de Firebase se encuentra en `mi-proyecto/src/config/firebase.js`.
- Para usar tu propio proyecto Firebase, reemplaza las credenciales existentes en ese archivo.
- Este repositorio contiene una aplicación React en la carpeta `mi-proyecto`.

## Comandos útiles

- `npm run dev` - Inicia en modo desarrollo.
- `npm run build` - Compila para producción.
- `npm run preview` - Previsualiza la versión compilada.
- `npm run lint` - Ejecuta ESLint.

## 📁 Estructura del proyecto

```
src/
├── assets/
├── config/
│   └── firebase.js
├── context/
│   ├── AuthContext.jsx
│   └── PermissionsContext.jsx
├── hooks/
│   ├── useAuth.js
│   └── useCollection.js
├── models/
│   ├── Admin.model.js
│   ├── Alumno.model.js
│   ├── Campus.model.js
│   ├── Inscripcion.model.js
│   ├── Leccion.model.js
│   ├── Modulo.model.js
│   ├── Profesor.model.js
│   └── Promocion.model.js
├── services/
│   ├── auth.service.js
│   ├── admin.service.js
│   ├── alumnos.service.js
│   ├── campus.service.js
│   ├── inscripciones.service.js
│   ├── lecciones.service.js
│   ├── modulos.service.js
│   ├── profesores.service.js
│   └── promociones.service.js
├── routes/
│   ├── AppRouter.jsx
│   └── PrivateRoute.jsx
├── components/
│   ├── layout/
│   │   └── Navbar.jsx
│   └── ui/
│       ├── Button.jsx
│       ├── Input.jsx
│       ├── Modal.jsx
│       ├── Table.jsx
│       └── Badge.jsx
├── pages/
│   ├── Login.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── GestionAlumnos.jsx
│   │   ├── GestionProfesores.jsx
│   │   ├── GestionCampus.jsx
│   │   ├── GestionModulos.jsx
│   │   ├── GestionPromociones.jsx
│   │   └── GestionInscripciones.jsx
│   ├── profesor/
│   │   ├── ProfesorDashboard.jsx
│   │   ├── GestionModulos.jsx
│   │   └── GestionLecciones.jsx
│   └── alumno/
│       ├── AlumnoDashboard.jsx
│       └── VerLecciones.jsx
├── App.jsx
└── main.jsx
```
