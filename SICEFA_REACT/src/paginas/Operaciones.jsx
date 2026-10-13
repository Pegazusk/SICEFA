import { useEffect, useState } from 'react'
import { pedir, formatoDinero, formatoFechaHora } from '../api'
import { nombreCompleto } from '../../compartido/catalogos'
import Icono from '../componentes/Icono'
import Ventana from '../componentes/Ventana'
import { SinRegistros, MensajeDeError, Cargando, Etiqueta } from '../componentes/Mensajes'

const textos = {
  compras: {
    titulo: 'Compras',
    descripcion: 'Realiza y da seguimiento a tus pedidos de compra.',
    icono: 'carrito',
    tituloDelFormulario: 'Pedido de compra',
    botonRegistrar: 'Realizar pedido',
    avisoRegistrada: 'Pedido de compra registrado correctamente.',
    tituloDeLaLista: 'Lista de pedidos',
    listaVacia: 'Aún no hay pedidos',
    letraDelFolio: 'C',
    estados: ['Todos', 'Pendiente', 'Recibido', 'Cancelado'],
    estadoInicial: 'Pendiente',
    estadoCancelado: 'Cancelado',
  },
  ventas: {
    titulo: 'Ventas',
    descripcion: 'Registra las ventas y consulta su historial.',
    icono: 'recibo',
    tituloDelFormulario: 'Registro de ventas',
    botonRegistrar: 'Registrar venta',
    avisoRegistrada: 'Venta registrada correctamente.',
    tituloDeLaLista: 'Lista de ventas',
    listaVacia: 'Aún no hay ventas',
    letraDelFolio: 'V',
    estados: ['Todos', 'Registrada', 'Cancelada'],
    estadoInicial: 'Registrada',
    estadoCancelado: 'Cancelada',
  },
}

function colorDelEstado(estado) {
  if (estado.startsWith('Cancel')) return 'inactive'
  if (estado === 'Pendiente') return 'pending'
  return 'active'
}

function Operaciones({ tipo, usuario, avisar }) {
  const texto = textos[tipo]
  const esVenta = tipo === 'ventas'

  const [operaciones, guardarOperaciones] = useState([])
  const [productos, guardarProductos] = useState([])
  const [clientes, guardarClientes] = useState([])
  const [cargando, guardarCargando] = useState(true)
  const [error, guardarError] = useState('')
  const [recarga, guardarRecarga] = useState(0)

  const [idProducto, guardarIdProducto] = useState('')
  const [cantidad, guardarCantidad] = useState(1)
  const [guardando, guardarGuardando] = useState(false)
  const [errorAlGuardar, guardarErrorAlGuardar] = useState('')

  const [filtro, guardarFiltro] = useState('Todos')
  const [busqueda, guardarBusqueda] = useState('')

  const [porConfirmar, guardarPorConfirmar] = useState(null)

  useEffect(() => {
    const consultas = [pedir(`/${tipo}`), pedir('/productos')]
    if (tipo === 'ventas') consultas.push(pedir('/clientes'))

    Promise.all(consultas)
      .then(([listaDeOperaciones, listaDeProductos, listaDeClientes = []]) => {
        guardarOperaciones(listaDeOperaciones)
        guardarProductos(listaDeProductos)
        guardarClientes(listaDeClientes)
        guardarError('')
      })
      .catch(errorDeLaApi => guardarError(errorDeLaApi.message))
      .finally(() => guardarCargando(false))
  }, [tipo, recarga])

  function recargar() {
    guardarCargando(true)
    guardarError('')
    guardarRecarga(recarga + 1)
  }

  const productoElegido = productos.find(producto => producto.id === Number(idProducto))
  const precio = productoElegido ? productoElegido.precioUnitario : 0
  const total = precio * Number(cantidad || 0)
  const formularioBloqueado = guardando || cargando || Boolean(error)

  async function registrar(evento) {
    evento.preventDefault()
    const formulario = evento.currentTarget

    const datos = { idProducto: Number(idProducto), cantidad: Number(cantidad) }
    if (esVenta) datos.idCliente = Number(new FormData(formulario).get('idCliente'))

    guardarGuardando(true)
    guardarErrorAlGuardar('')

    try {
      await pedir(`/${tipo}`, 'POST', datos)
      avisar(texto.avisoRegistrada)
      formulario.reset()
      guardarIdProducto('')
      guardarCantidad(1)
      recargar()
    } catch (errorDeLaApi) {
      guardarErrorAlGuardar(errorDeLaApi.message)
    } finally {
      guardarGuardando(false)
    }
  }

  function pedirConfirmacion(operacion, nuevoEstado) {
    guardarErrorAlGuardar('')
    guardarPorConfirmar({ ...operacion, nuevoEstado })
  }

  async function cambiarEstado() {
    guardarGuardando(true)
    guardarErrorAlGuardar('')

    try {
      await pedir(`/${tipo}/${porConfirmar.id}`, 'PATCH', { estado: porConfirmar.nuevoEstado })
      avisar('Estado actualizado correctamente.')
      guardarPorConfirmar(null)
      recargar()
    } catch (errorDeLaApi) {
      guardarErrorAlGuardar(errorDeLaApi.message)
    } finally {
      guardarGuardando(false)
    }
  }

  const filtradas = operaciones.filter(operacion => {
    if (filtro !== 'Todos' && operacion.estado !== filtro) return false

    const textoDeLaFila = `${operacion.id} ${operacion.nombreProducto} ${operacion.nombreCliente || ''} ${operacion.nombreEmpleado}`
    return textoDeLaFila.toLowerCase().includes(busqueda.toLowerCase())
  })

  function tituloDeLaConfirmacion() {
    if (porConfirmar.nuevoEstado === 'Recibido') return 'Recibir pedido'
    return esVenta ? 'Cancelar venta' : 'Cancelar pedido'
  }

  let lista
  if (cargando) {
    lista = <Cargando />
  } else if (filtradas.length === 0) {
    lista = (
      <SinRegistros
        icono={texto.icono}
        titulo={operaciones.length ? 'No hay resultados' : texto.listaVacia}
        descripcion={operaciones.length ? 'Prueba con otros filtros.' : 'Registra la primera operación con el formulario de arriba.'}
      />
    )
  } else {
    lista = (
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Folio</th>
              {esVenta && <th>Cliente</th>}
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Fecha y hora</th>
              <th>{esVenta ? 'Total' : 'Importe'}</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map(operacion => (
              <tr key={operacion.id}>
                <td className="folio">{texto.letraDelFolio}-{String(operacion.id).padStart(4, '0')}</td>
                {esVenta && <td>{operacion.nombreCliente}</td>}
                <td className="name-cell">{operacion.nombreProducto}</td>
                <td>{operacion.cantidad}</td>
                <td>{formatoFechaHora(operacion.fecha)}</td>
                <td className="money">{formatoDinero(esVenta ? operacion.total : operacion.cantidad * operacion.precio)}</td>
                <td><Etiqueta color={colorDelEstado(operacion.estado)}>{operacion.estado}</Etiqueta></td>
                <td>
                  <div className="row-actions">
                    {operacion.estado === texto.estadoInicial ? (
                      <>
                        {!esVenta && (
                          <button className="action restore" onClick={() => pedirConfirmacion(operacion, 'Recibido')}>Recibir</button>
                        )}
                        <button className="action delete" onClick={() => pedirConfirmacion(operacion, texto.estadoCancelado)}>Cancelar</button>
                      </>
                    ) : (
                      <span className="muted">Finalizada</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">OPERACIÓN DE SUCURSAL</span>
          <h1>{texto.titulo}</h1>
          <p>{texto.descripcion}</p>
        </div>
        <span className="page-symbol"><Icono nombre={texto.icono} tamano={30} /></span>
      </div>

      <MensajeDeError mensaje={error} reintentar={recargar} />

      <section className="panel transaction-panel">
        <div className="catalog-heading">
          <div className="section-title">
            <Icono nombre={texto.icono} />
            <h2>{texto.tituloDelFormulario}</h2>
          </div>
          <span className="branch-caption"><Icono nombre="edificio" tamano={16} />{usuario.nombreSucursal}</span>
        </div>

        <form onSubmit={registrar}>
          <fieldset disabled={formularioBloqueado} className="transaction-fields">
            {esVenta && (
              <div className="field">
                <label htmlFor="idCliente">Cliente *</label>
                <select id="idCliente" name="idCliente" required defaultValue="">
                  <option value="">Selecciona un cliente</option>
                  {clientes.map(cliente => <option key={cliente.id} value={cliente.id}>{nombreCompleto(cliente)}</option>)}
                </select>
              </div>
            )}
            <div className="field">
              <label htmlFor="idProducto">Producto *</label>
              <select id="idProducto" required value={idProducto} onChange={evento => guardarIdProducto(evento.target.value)}>
                <option value="">Selecciona un producto</option>
                {productos.map(producto => (
                  <option key={producto.id} value={producto.id}>{producto.nombre} · {producto.concentracion}</option>
                ))}
              </select>
            </div>
            <div className="field quantity-field">
              <label htmlFor="cantidad">Cantidad *</label>
              <input id="cantidad" type="number" min="1" max="1000000" step="1" required value={cantidad} onChange={evento => guardarCantidad(evento.target.value)} />
            </div>
            <div className="field quantity-field">
              <label>Precio unitario</label>
              <output>{formatoDinero(precio)}</output>
            </div>
          </fieldset>

          <div className="transaction-bottom">
            <span className="muted">Atiende: <strong>{usuario.nombre}</strong> · Fecha y hora automáticas</span>
            <div className="transaction-total">
              <span>Total <strong>{formatoDinero(total)}</strong></span>
              <button className="button success" disabled={formularioBloqueado || !productoElegido}>
                <Icono nombre="mas" tamano={18} />
                {guardando ? 'Guardando…' : texto.botonRegistrar}
              </button>
            </div>
          </div>

          {!porConfirmar && <MensajeDeError mensaje={errorAlGuardar} />}
        </form>
      </section>

      <section className="panel catalog-panel">
        <div className="catalog-heading">
          <div className="section-title">
            <h2>{texto.tituloDeLaLista}</h2>
            <span className="count-badge">{operaciones.length}</span>
          </div>
        </div>

        <div className="table-toolbar">
          <select className="status-filter" aria-label="Filtrar por estado" value={filtro} onChange={evento => guardarFiltro(evento.target.value)}>
            {texto.estados.map(estado => <option key={estado}>{estado}</option>)}
          </select>
          <div className="search-box">
            <Icono nombre="buscar" tamano={18} />
            <input type="search" placeholder="Buscar operación…" aria-label="Buscar operación" value={busqueda} onChange={evento => guardarBusqueda(evento.target.value)} />
          </div>
        </div>

        {lista}

        <footer className="table-footer">
          <span>{filtradas.length} operaciones</span>
          <span>Importes en MXN</span>
        </footer>
      </section>

      {porConfirmar && (
        <Ventana chica titulo={tituloDeLaConfirmacion()} alCerrar={() => guardarPorConfirmar(null)} ocupada={guardando}>
          <div className="modal-body">
            <p>
              La operación de <strong>{porConfirmar.cantidad} × {porConfirmar.nombreProducto}</strong> quedará
              como <strong>{porConfirmar.nuevoEstado.toLowerCase()}</strong>.
            </p>
            <p className="muted">El historial se conservará. Este cambio no se puede deshacer.</p>
            <MensajeDeError mensaje={errorAlGuardar} />
          </div>
          <footer className="modal-footer">
            <button className="button secondary" onClick={() => guardarPorConfirmar(null)} disabled={guardando}>Volver</button>
            <button className="button primary" onClick={cambiarEstado} disabled={guardando}>
              {guardando ? 'Guardando…' : 'Confirmar'}
            </button>
          </footer>
        </Ventana>
      )}
    </>
  )
}

export default Operaciones
