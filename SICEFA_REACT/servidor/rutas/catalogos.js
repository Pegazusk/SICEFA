import { catalogos, puedeAdministrar } from '../../compartido/catalogos.js'
import { actualizar, buscarPorId, insertar } from '../baseDeDatos.js'
import { validarRegistro } from '../validaciones.js'

export function rutasDeCatalogos(aplicacion, baseDeDatos) {
  aplicacion.get('/api/resumen', (peticion, respuesta) => {
    const totales = {}
    for (const tabla of Object.keys(catalogos)) {
      totales[tabla] = baseDeDatos.prepare(`SELECT COUNT(*) AS total FROM ${tabla} WHERE estatus = 1`).get().total
    }
    respuesta.json(totales)
  })

  for (const tabla of Object.keys(catalogos)) {
    function tienePermiso(peticion, respuesta, accion) {
      const area = peticion.usuario.area
      const permitido = accion === 'consultar'
        ? tabla !== 'sucursales' || area === 'central'
        : puedeAdministrar(area, tabla, accion)

      if (!permitido) respuesta.status(403).json({ mensaje: 'No tienes permisos para esta acción.' })
      return permitido
    }

    function buscarRegistro(peticion, respuesta) {
      const registro = buscarPorId(baseDeDatos, tabla, Number(peticion.params.id))
      if (!registro) respuesta.status(404).json({ mensaje: 'No se encontró el registro.' })
      return registro
    }

    aplicacion.get(`/api/${tabla}`, (peticion, respuesta) => {
      if (!tienePermiso(peticion, respuesta, 'consultar')) return

      const filtro = peticion.query.estatus === 'todos' ? '' : 'WHERE estatus = 1'
      const registros = baseDeDatos.prepare(`SELECT * FROM ${tabla} ${filtro} ORDER BY id DESC`).all()
      respuesta.json(registros)
    })

    aplicacion.get(`/api/${tabla}/:id`, (peticion, respuesta) => {
      if (!tienePermiso(peticion, respuesta, 'consultar')) return

      const registro = buscarRegistro(peticion, respuesta)
      if (registro) respuesta.json(registro)
    })

    aplicacion.post(`/api/${tabla}`, (peticion, respuesta) => {
      if (!tienePermiso(peticion, respuesta, 'crear')) return

      const { datos, errores, hayErrores } = validarRegistro(tabla, peticion.body || {})
      if (hayErrores) {
        return respuesta.status(400).json({ mensaje: 'Revisa los campos del formulario.', campos: errores })
      }

      const id = insertar(baseDeDatos, tabla, datos)
      respuesta.status(201).json(buscarPorId(baseDeDatos, tabla, id))
    })

    aplicacion.put(`/api/${tabla}/:id`, (peticion, respuesta) => {
      if (!tienePermiso(peticion, respuesta, 'editar')) return

      const registro = buscarRegistro(peticion, respuesta)
      if (!registro) return

      const { datos, errores, hayErrores } = validarRegistro(tabla, peticion.body || {})
      if (hayErrores) {
        return respuesta.status(400).json({ mensaje: 'Revisa los campos del formulario.', campos: errores })
      }

      actualizar(baseDeDatos, tabla, registro.id, datos)
      respuesta.json(buscarPorId(baseDeDatos, tabla, registro.id))
    })

    aplicacion.delete(`/api/${tabla}/:id`, (peticion, respuesta) => {
      if (!tienePermiso(peticion, respuesta, 'eliminar')) return

      const registro = buscarRegistro(peticion, respuesta)
      if (!registro) return

      if (tabla === 'sucursales') {
        const tieneUsuarios = baseDeDatos.prepare('SELECT id FROM usuarios WHERE idSucursal = ?').get(registro.id)
        if (tieneUsuarios) {
          return respuesta.status(409).json({ mensaje: 'Esta sucursal tiene usuarios asignados y no se puede dar de baja.' })
        }
      }

      actualizar(baseDeDatos, tabla, registro.id, { estatus: 0 })
      respuesta.json(buscarPorId(baseDeDatos, tabla, registro.id))
    })

    aplicacion.patch(`/api/${tabla}/:id/reactivar`, (peticion, respuesta) => {
      if (!tienePermiso(peticion, respuesta, 'eliminar')) return

      const registro = buscarRegistro(peticion, respuesta)
      if (!registro) return

      actualizar(baseDeDatos, tabla, registro.id, { estatus: 1 })
      respuesta.json(buscarPorId(baseDeDatos, tabla, registro.id))
    })
  }
}
