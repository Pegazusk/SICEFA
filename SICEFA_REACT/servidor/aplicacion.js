import express from 'express'
import { join } from 'node:path'
import { rutasDeSesion, revisarSesion, rutaDelUsuarioActual } from './rutas/sesion.js'
import { rutasDeCatalogos } from './rutas/catalogos.js'
import { rutasDeOperaciones } from './rutas/operaciones.js'

export function crearAplicacion(baseDeDatos, carpetaDeReact = null) {
  const aplicacion = express()

  aplicacion.use(express.json({ limit: '1mb' }))

  aplicacion.get('/api/estado', (peticion, respuesta) => {
    respuesta.json({ estado: 'funcionando' })
  })

  rutasDeSesion(aplicacion, baseDeDatos)

  aplicacion.use('/api', revisarSesion(baseDeDatos))

  rutaDelUsuarioActual(aplicacion)
  rutasDeCatalogos(aplicacion, baseDeDatos)
  rutasDeOperaciones(aplicacion, baseDeDatos)

  aplicacion.use('/api', (peticion, respuesta) => {
    respuesta.status(404).json({ mensaje: 'Ruta no encontrada.' })
  })

  if (carpetaDeReact) {
    aplicacion.use(express.static(carpetaDeReact))
    aplicacion.use((peticion, respuesta) => {
      respuesta.sendFile(join(carpetaDeReact, 'index.html'))
    })
  }

  aplicacion.use((error, peticion, respuesta, siguiente) => {
    if (respuesta.headersSent) return siguiente(error)

    if (String(error.message).includes('UNIQUE constraint')) {
      return respuesta.status(409).json({ mensaje: 'Ya existe un registro con esa clave.' })
    }
    if (error.type === 'entity.parse.failed') {
      return respuesta.status(400).json({ mensaje: 'El contenido JSON no es válido.' })
    }
    if (error.type === 'entity.too.large') {
      return respuesta.status(413).json({ mensaje: 'La solicitud supera el tamaño permitido.' })
    }

    console.error(error)
    respuesta.status(500).json({ mensaje: 'No se pudo completar la operación. Inténtalo nuevamente.' })
  })

  return aplicacion
}
