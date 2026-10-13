import { actualizar, buscarPorId, insertar } from '../baseDeDatos.js'
import { esEnteroPositivo } from '../validaciones.js'

const operaciones = {
  compras: { estadoInicial: 'Pendiente', estadosSiguientes: ['Recibido', 'Cancelado'] },
  ventas: { estadoInicial: 'Registrada', estadosSiguientes: ['Cancelada'] },
}

export function rutasDeOperaciones(aplicacion, baseDeDatos) {
  for (const [tabla, reglas] of Object.entries(operaciones)) {
    const esVenta = tabla === 'ventas'

    function esDeSucursal(peticion, respuesta) {
      const permitido = peticion.usuario.area === 'sucursal'
      if (!permitido) respuesta.status(403).json({ mensaje: 'Ingresa al área Sucursal para registrar operaciones.' })
      return permitido
    }

    function listar(idSucursal) {
      const columnaCliente = esVenta ? ", clientes.nombre || ' ' || clientes.apellidoPaterno AS nombreCliente" : ''
      const unirClientes = esVenta ? `JOIN clientes ON clientes.id = ${tabla}.idCliente` : ''

      return baseDeDatos.prepare(`
        SELECT ${tabla}.*,
               productos.nombre AS nombreProducto,
               usuarios.nombre AS nombreEmpleado
               ${columnaCliente}
        FROM ${tabla}
        JOIN productos ON productos.id = ${tabla}.idProducto
        JOIN usuarios ON usuarios.id = ${tabla}.idUsuario
        ${unirClientes}
        WHERE ${tabla}.idSucursal = ?
        ORDER BY ${tabla}.id DESC
      `).all(idSucursal)
    }

    aplicacion.get(`/api/${tabla}`, (peticion, respuesta) => {
      if (!esDeSucursal(peticion, respuesta)) return
      respuesta.json(listar(peticion.usuario.idSucursal))
    })

    aplicacion.post(`/api/${tabla}`, (peticion, respuesta) => {
      if (!esDeSucursal(peticion, respuesta)) return

      const { idProducto, cantidad, idCliente } = peticion.body || {}

      if (!esEnteroPositivo(idProducto)) {
        return respuesta.status(400).json({ mensaje: 'El producto debe ser un entero entre 1 y 1,000,000.' })
      }
      if (!esEnteroPositivo(cantidad)) {
        return respuesta.status(400).json({ mensaje: 'La cantidad debe ser un entero entre 1 y 1,000,000.' })
      }

      const producto = buscarPorId(baseDeDatos, 'productos', idProducto)
      if (!producto) return respuesta.status(404).json({ mensaje: 'No se encontró el registro.' })
      if (!producto.estatus) return respuesta.status(400).json({ mensaje: 'El registro seleccionado está inactivo.' })

      const operacion = {
        idProducto,
        cantidad,
        precio: producto.precioUnitario,
        idSucursal: peticion.usuario.idSucursal,
        idUsuario: peticion.usuario.id,
      }

      if (esVenta) {
        if (!esEnteroPositivo(idCliente)) {
          return respuesta.status(400).json({ mensaje: 'El cliente debe ser un entero entre 1 y 1,000,000.' })
        }

        const cliente = buscarPorId(baseDeDatos, 'clientes', idCliente)
        if (!cliente) return respuesta.status(404).json({ mensaje: 'No se encontró el registro.' })
        if (!cliente.estatus) return respuesta.status(400).json({ mensaje: 'El registro seleccionado está inactivo.' })

        operacion.idCliente = idCliente
        operacion.total = Math.round(producto.precioUnitario * cantidad * 100) / 100
      }

      const id = insertar(baseDeDatos, tabla, operacion)
      const registrada = listar(peticion.usuario.idSucursal).find(fila => fila.id === id)
      respuesta.status(201).json(registrada)
    })

    aplicacion.patch(`/api/${tabla}/:id`, (peticion, respuesta) => {
      if (!esDeSucursal(peticion, respuesta)) return

      const operacion = buscarPorId(baseDeDatos, tabla, Number(peticion.params.id))
      if (!operacion || operacion.idSucursal !== peticion.usuario.idSucursal) {
        return respuesta.status(404).json({ mensaje: 'No se encontró la operación.' })
      }

      const nuevoEstado = (peticion.body || {}).estado
      if (!reglas.estadosSiguientes.includes(nuevoEstado)) {
        return respuesta.status(400).json({ mensaje: 'Estado de operación inválido.' })
      }
      if (operacion.estado !== reglas.estadoInicial) {
        return respuesta.status(409).json({ mensaje: 'Esta operación ya fue procesada.' })
      }

      actualizar(baseDeDatos, tabla, operacion.id, { estado: nuevoEstado })
      const actualizada = listar(peticion.usuario.idSucursal).find(fila => fila.id === operacion.id)
      respuesta.json(actualizada)
    })
  }
}
