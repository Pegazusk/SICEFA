import { createHash, randomBytes } from 'node:crypto'
import { insertar } from '../baseDeDatos.js'
import { contrasenaCorrecta } from '../contrasenas.js'

const nombreDeLaCookie = 'sicefa_sesion'
const duracionDeLaSesion = 1000 * 60 * 60 * 12

function huella(token) {
  return createHash('sha256').update(token).digest('hex')
}

function leerToken(peticion) {
  const cookies = (peticion.headers.cookie || '').split(';').map(cookie => cookie.trim())
  const cookie = cookies.find(cookie => cookie.startsWith(`${nombreDeLaCookie}=`))
  return cookie ? cookie.slice(nombreDeLaCookie.length + 1) : ''
}

function buscarUsuarioDeLaSesion(baseDeDatos, peticion) {
  const usuario = baseDeDatos.prepare(`
    SELECT usuarios.id, usuarios.usuario, usuarios.nombre, usuarios.idSucursal,
           sesiones.area,
           sucursales.nombre AS nombreSucursal,
           sucursales.estatus AS sucursalActiva
    FROM sesiones
    JOIN usuarios ON usuarios.id = sesiones.idUsuario
    JOIN sucursales ON sucursales.id = usuarios.idSucursal
    WHERE sesiones.token = ? AND sesiones.expira > ?
  `).get(huella(leerToken(peticion)), Date.now())

  if (usuario && usuario.area === 'sucursal' && !usuario.sucursalActiva) return undefined
  return usuario
}

function datosPublicos(usuario) {
  return {
    id: usuario.id,
    usuario: usuario.usuario,
    nombre: usuario.nombre,
    area: usuario.area,
    idSucursal: usuario.idSucursal,
    nombreSucursal: usuario.nombreSucursal,
  }
}

export function rutasDeSesion(aplicacion, baseDeDatos) {
  aplicacion.post('/api/sesion/entrar', (peticion, respuesta) => {
    const { usuario, contrasena, area } = peticion.body || {}

    const datosCompletos = typeof usuario === 'string' && typeof contrasena === 'string'
    if (!datosCompletos || !['central', 'sucursal'].includes(area)) {
      return respuesta.status(400).json({ mensaje: 'Ingresa un usuario, contraseña y área válidos.' })
    }

    const encontrado = baseDeDatos.prepare(`
      SELECT usuarios.*, sucursales.nombre AS nombreSucursal, sucursales.estatus AS sucursalActiva
      FROM usuarios
      JOIN sucursales ON sucursales.id = usuarios.idSucursal
      WHERE usuarios.usuario = ?
    `).get(usuario.trim())

    const puedeEntrar = encontrado
      && contrasenaCorrecta(contrasena, encontrado.contrasena)
      && (area === 'central' ? encontrado.esCentral : encontrado.sucursalActiva)

    if (!puedeEntrar) {
      return respuesta.status(401).json({ mensaje: 'Usuario o contraseña incorrectos para esta área.' })
    }

    const ahora = Date.now()
    baseDeDatos.prepare('DELETE FROM sesiones WHERE expira <= ?').run(ahora)

    const token = randomBytes(32).toString('hex')
    insertar(baseDeDatos, 'sesiones', {
      token: huella(token),
      idUsuario: encontrado.id,
      area,
      expira: ahora + duracionDeLaSesion,
    })

    respuesta.cookie(nombreDeLaCookie, token, { httpOnly: true, sameSite: 'strict', maxAge: duracionDeLaSesion })
    respuesta.json({ usuario: datosPublicos({ ...encontrado, area }) })
  })

  aplicacion.post('/api/sesion/salir', (peticion, respuesta) => {
    baseDeDatos.prepare('DELETE FROM sesiones WHERE token = ?').run(huella(leerToken(peticion)))
    respuesta.clearCookie(nombreDeLaCookie)
    respuesta.json({ listo: true })
  })
}

export function revisarSesion(baseDeDatos) {
  return (peticion, respuesta, siguiente) => {
    const usuario = buscarUsuarioDeLaSesion(baseDeDatos, peticion)
    if (!usuario) {
      return respuesta.status(401).json({ mensaje: 'Tu sesión terminó. Inicia sesión nuevamente.' })
    }

    peticion.usuario = usuario
    siguiente()
  }
}

export function rutaDelUsuarioActual(aplicacion) {
  aplicacion.get('/api/sesion/usuario', (peticion, respuesta) => {
    respuesta.json({ usuario: datosPublicos(peticion.usuario) })
  })
}
