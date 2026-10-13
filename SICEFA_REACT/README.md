# SICEFA · React + Vite + Express + SQLite

Réplica modernizada del proyecto SICEFA original. Conserva la identidad azul y roja, los logos, el acceso Central/Sucursal, la navegación horizontal, los catálogos en tablas y los formularios en ventanas.

## Ejecutar

Requiere **Node.js 24 o superior** y npm. SQLite está integrado en Node; no necesitas instalar un servicio de base de datos.

```bash
npm install
npm run dev
```

- Aplicación: **http://localhost:5173**
- API: **http://localhost:3001/api/estado**
- `npm run dev` inicia ambos procesos. `Ctrl+C` detiene ambos.
- La primera ejecución crea `servidor/datos/sicefa.sqlite` y la llena con los archivos JSON de `servidor/datos/`. Los siguientes arranques conservan los cambios.

Si necesitas otros puertos: `PUERTO=3002 PUERTO_CLIENTE=5174 npm run dev`.

## Accesos iniciales

Selecciona Central o Sucursal en la pantalla de acceso. Los usuarios originales conservan sus credenciales:

| Usuario | Contraseña inicial | Área |
| --- | --- | --- |
| AG20230901 | AG20230901 | Central y Sucursal |
| DP20230901 | DP20230901 | Central y Sucursal |
| MZ20230901 | MZ20230901 | Sucursal |
| HC20230901 | HC20230901 | Sucursal |

Son cuentas de demostración del proyecto original. Las contraseñas se almacenan con scrypt y sal aleatoria en SQLite; el frontend no recibe contraseñas ni hashes. Las sesiones usan cookies HttpOnly, SameSite=Strict y duran 12 horas. Cerrar sesión revoca el token en el servidor.

## Funciones

| Módulo | Central | Sucursal |
| --- | --- | --- |
| Inicio y perfil | Disponible | Disponible |
| Sucursales | Alta, edición, baja y reactivación | Sin acceso |
| Productos | Alta, edición, baja y reactivación | Consulta |
| Empleados | Alta, edición, baja y reactivación | Consulta y edición |
| Clientes | Alta, edición, baja y reactivación | Alta, edición, baja y reactivación |
| Compras | — | Registrar, recibir y cancelar pedidos |
| Ventas | — | Registrar y cancelar ventas |

Los catálogos incluyen búsqueda, filtros de estado, paginación, validación y almacenamiento permanente. Los productos y las personas admiten fotos JPG, PNG y WebP de hasta 500 KB. Las bajas son lógicas y se pueden revertir desde Inactivos. Una sucursal con usuarios asignados no se puede dar de baja.

El servidor calcula los importes de ventas con el precio del catálogo y conserva el precio histórico. Las operaciones se asocian al usuario y a su sucursal, con fecha y hora del servidor. Cada pedido/venta contiene un producto y una cantidad, siguiendo el formulario original. Recibir o cancelar una operación conserva su historial.

## Catálogo visual de medicamentos

El catálogo de productos se muestra en una cuadrícula de 4 columnas en escritorio, 3 en pantallas intermedias y 2 en móvil. Cada tarjeta muestra imagen, nombre, presentación, concentración, estado y precio en MXN. Incluye búsqueda, filtros de estado, orden por nombre/precio/fecha de incorporación y páginas de 12 medicamentos.

Al pulsar la imagen, el contenido de la tarjeta o «Ver detalles», se abre una ficha con imagen grande y todos los campos del medicamento. Central puede editar desde esa ficha; Sucursal puede consultarla. Las acciones de edición, baja y reactivación siguen disponibles en las tarjetas.

El catálogo inicial tiene **48 medicamentos**: los 6 originales y 42 de demostración. Están en `servidor/datos/productos.json` y se cargan una sola vez, cuando la base de datos está vacía.

Los nuevos precios y presentaciones son datos de ejemplo editables, no precios comerciales verificados. No se agregan indicaciones clínicas ni contraindicaciones inventadas. Los 48 medicamentos iniciales incluyen fotografías reales de empaques. Se conservan las 12 fotografías recuperadas del proyecto original y se añaden 36 archivos locales en `public/img/medicamentos/`. Si una fotografía no carga, se muestra «Fotografía no disponible». Fuentes y correspondencias: [fotografías de medicamentos](docs/fotografias-medicamentos.md).

Archivos: `servidor/datos/productos.json`, `src/componentes/CuadriculaMedicamentos.jsx`, `DetalleMedicamento.jsx` e `ImagenMedicamento.jsx`.

## Datos migrados y alcance

- Se importan los **6 productos, 6 clientes, 1 sucursal y 4 usuarios** originales.
- El catálogo de empleados inicial se deriva de los cuatro usuarios existentes; los datos personales no presentes quedan vacíos.
- Las coordenadas `1000/3000` de la sucursal original no son coordenadas geográficas válidas y quedan vacías para su corrección.
- Los archivos de fotos de clientes no estaban incluidos en el original; se dejan sin fotografía. Las fotos de los medicamentos y logos sí se copian.
- Misión y visión sustituyen el texto de relleno del original con una propuesta editable en `src/paginas/Inicio.jsx`.
- Los usuarios iniciales se asignan a la única sucursal original. Los catálogos de personas y productos son compartidos, como en el proyecto inicial; compras y ventas se filtran por sucursal desde la API.
- Es un backend básico para desarrollo local. No incluye existencias por sucursal, facturación fiscal, pagos, recuperación de contraseña ni una interfaz de administración de cuentas. Crear un empleado crea su ficha, no una cuenta de acceso.

## Estructura

Todo el código usa nombres en español. La API está hecha con Express: cada ruta es una función `(peticion, respuesta)`, y React la consulta con `fetch` desde `useEffect`, guardando el resultado con `useState`.

```text
servidor/                     La API
  index.js                    Enciende el servidor
  aplicacion.js               Arma la aplicación de Express y conecta las rutas
  rutas/sesion.js             Entrar, salir y revisar la sesión
  rutas/catalogos.js          Sucursales, productos, empleados y clientes
  rutas/operaciones.js        Compras y ventas
  baseDeDatos.js              Tablas de SQLite y funciones insertar / actualizar / buscarPorId
  validaciones.js             Revisión de los datos de los formularios
  contrasenas.js              Cifrado de contraseñas
  datos/*.json                Datos iniciales (se cargan cuando la base está vacía)
  datos/sicefa.sqlite         Base de datos local (no se versiona)
compartido/catalogos.js       Campos de cada catálogo y permisos; lo usan el servidor y React
src/                          La página de React
  App.jsx                     Sesión, menú y estructura común
  api.js                      Función pedir() para consultar la API, y formatos de dinero y fecha
  paginas/                    InicioSesion, Inicio, Catalogo y Operaciones (compras y ventas)
  componentes/                Icono, Ventana, Mensajes, FormularioRegistro, TablaRegistros y medicamentos
  index.css, styles.css       Estilos y adaptación móvil
scripts/                      Arranque conjunto y servidor aislado de pruebas
pruebas/                      Pruebas de API y de navegador
public/img/                   Logos, fondo y fotografías
docs/                         Capturas de escritorio y móvil
```

### Cómo se crea una ruta y cómo se consume

En el servidor (`servidor/rutas/catalogos.js`):

```js
aplicacion.get('/api/resumen', (peticion, respuesta) => {
  respuesta.json(totales)
})
```

En React (`src/paginas/Inicio.jsx`):

```js
const [totales, guardarTotales] = useState(null)

useEffect(() => {
  pedir('/resumen').then(datos => guardarTotales(datos))
}, [])
```

## Comandos

```bash
npm run lint       # ESLint
npm test           # Pruebas de API con SQLite temporal
npm run test:e2e    # Flujos en navegador: escritorio y móvil
npm run build      # Compilación de React en dist/
npm start          # API y frontend compilado en http://localhost:3001
```

Las pruebas usan bases temporales independientes y no modifican `servidor/datos/sicefa.sqlite`. Las pruebas de navegador usan los puertos 5175 y 3003. En macOS detectan Brave si está instalado; puedes indicar `BROWSER_PATH` o instalar Chromium con `npx playwright install chromium`.

Para dos terminales independientes: `npm run dev:server` y `npm run dev:client`. `npm run preview` requiere que la API esté iniciada; para probar el sistema completo compilado, usa `npm run build` y `npm start`.

Variables opcionales:

| Variable | Predeterminado | Uso |
| --- | --- | --- |
| `PUERTO` | `3001` | Puerto de API / aplicación compilada |
| `PUERTO_CLIENTE` | `5173` | Puerto de Vite |
| `RUTA_BD` | `servidor/datos/sicefa.sqlite` | Archivo SQLite alternativo |

Para respaldar los datos, detén el servidor y copia `servidor/datos/sicefa.sqlite`. Si borras ese archivo, la siguiente ejecución crea uno nuevo con los datos iniciales.

## API

Todas las rutas de datos requieren una sesión. Las acciones de escritura verifican los permisos en el servidor. Los errores responden `{ mensaje }` y, en formularios, también `{ campos }` con el error de cada campo.

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/api/estado` | Comprobar que la API está encendida (sin sesión) |
| POST | `/api/sesion/entrar` | `{ usuario, contrasena, area }` |
| GET | `/api/sesion/usuario` | Usuario de la sesión actual |
| POST | `/api/sesion/salir` | Cerrar sesión |
| GET | `/api/resumen` | Totales de catálogos activos |
| GET / POST | `/api/{catalogo}` | Listar / agregar |
| GET / PUT / DELETE | `/api/{catalogo}/:id` | Consultar / editar / dar de baja |
| PATCH | `/api/{catalogo}/:id/reactivar` | Reactivar |
| GET / POST | `/api/compras` | Listar / registrar `{ idProducto, cantidad }` |
| GET / POST | `/api/ventas` | Listar / registrar `{ idProducto, idCliente, cantidad }` |
| PATCH | `/api/compras/:id` | `{ estado: "Recibido" \| "Cancelado" }` |
| PATCH | `/api/ventas/:id` | `{ estado: "Cancelada" }` |

Catálogos: `sucursales`, `productos`, `empleados`, `clientes`. GET lista solo los activos; con `?estatus=todos` los incluye todos. PUT recibe todos los campos de la ficha. `area` es `central` o `sucursal`.

Referencias técnicas: [Express](https://expressjs.com/), [SQLite integrado en Node](https://nodejs.org/api/sqlite.html), [proxy de desarrollo de Vite](https://vite.dev/config/server-options#server-proxy).
