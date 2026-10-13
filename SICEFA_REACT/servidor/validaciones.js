import { catalogos } from '../compartido/catalogos.js'

const formatoDeCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const formatoDeFecha = /^\d{4}-\d{2}-\d{2}$/
const rutaDeImagen = /^\/img\/[\w./-]+$/
const imagenSubida = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/

export function validarRegistro(catalogo, cuerpo) {
  const datos = {}
  const errores = {}

  for (const campo of catalogos[catalogo].campos) {
    let valor = cuerpo[campo.clave]
    if (typeof valor === 'string') valor = valor.trim()

    const estaVacio = valor === undefined || valor === null || valor === ''
    if (estaVacio) {
      if (campo.obligatorio) errores[campo.clave] = 'Este campo es obligatorio.'
      datos[campo.clave] = null
      continue
    }

    if (campo.tipo === 'numero') {
      valor = Number(valor)
      if (campo.paso === '0.01') valor = Math.round(valor * 100) / 100
    }

    const error = campo.tipo === 'numero' ? revisarNumero(campo, valor) : revisarTexto(campo, valor)
    if (error) errores[campo.clave] = error

    datos[campo.clave] = valor
  }

  return { datos, errores, hayErrores: Object.keys(errores).length > 0 }
}

function revisarNumero(campo, valor) {
  const minimo = campo.minimo ?? -Infinity
  const maximo = campo.maximo ?? 10000000
  const debeSerEntero = campo.paso === 1

  if (!Number.isFinite(valor) || valor < minimo || valor > maximo || (debeSerEntero && !Number.isInteger(valor))) {
    return 'Ingresa un número dentro del rango permitido.'
  }
  return null
}

function revisarTexto(campo, valor) {
  if (typeof valor !== 'string') return 'Ingresa un texto válido.'

  if (campo.tipo === 'imagen') {
    const esValida = valor.length <= 750000 && (rutaDeImagen.test(valor) || imagenSubida.test(valor))
    return esValida ? null : 'Usa una imagen PNG, JPG o WebP de hasta 500 KB.'
  }

  const largoMaximo = campo.tipo === 'parrafo' ? 2000 : 250
  if (valor.length > largoMaximo) return 'El texto es demasiado largo.'

  if (campo.tipo === 'correo' && !formatoDeCorreo.test(valor)) return 'Ingresa un correo válido.'
  if (campo.tipo === 'fecha' && !esFechaValida(valor)) return 'Ingresa una fecha válida.'
  if (campo.tipo === 'lista' && !campo.opciones.includes(valor)) return 'Selecciona una opción válida.'

  return null
}

function esFechaValida(valor) {
  if (!formatoDeFecha.test(valor)) return false
  const fecha = new Date(valor)
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor
}

export function esEnteroPositivo(valor) {
  return Number.isInteger(valor) && valor >= 1 && valor <= 1000000
}
