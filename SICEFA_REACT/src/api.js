export async function pedir(ruta, metodo = 'GET', cuerpo) {
  const opciones = { method: metodo }

  if (cuerpo) {
    opciones.headers = { 'Content-Type': 'application/json' }
    opciones.body = JSON.stringify(cuerpo)
  }

  let respuesta
  try {
    respuesta = await fetch(`/api${ruta}`, opciones)
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.')
  }

  const datos = await respuesta.json().catch(() => ({}))

  if (!respuesta.ok) {
    if (respuesta.status === 401 && !ruta.startsWith('/sesion/')) {
      window.dispatchEvent(new Event('sesion-terminada'))
    }

    const error = new Error(datos.mensaje || 'No se pudo completar la operación.')
    error.campos = datos.campos
    error.estado = respuesta.status
    throw error
  }

  return datos
}

export function formatoDinero(cantidad) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cantidad || 0)
}

export function formatoFechaHora(fecha) {
  const fechaLocal = new Date(`${fecha.replace(' ', 'T')}Z`)
  return fechaLocal.toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
}
