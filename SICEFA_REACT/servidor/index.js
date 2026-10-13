import { fileURLToPath } from 'node:url'
import { abrirBaseDeDatos } from './baseDeDatos.js'
import { crearAplicacion } from './aplicacion.js'

const puerto = Number(process.env.PUERTO || 3001)

const esProduccion = process.env.NODE_ENV === 'production'
const carpetaDeReact = esProduccion ? fileURLToPath(new URL('../dist', import.meta.url)) : null

const baseDeDatos = abrirBaseDeDatos()
const aplicacion = crearAplicacion(baseDeDatos, carpetaDeReact)

aplicacion.listen(puerto, '127.0.0.1', () => {
  console.log(`SICEFA funcionando en http://localhost:${puerto}`)
})
