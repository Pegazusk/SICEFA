import { useEffect, useState } from 'react'
import { catalogos, puedeAdministrar } from '../../compartido/catalogos'
import { pedir } from '../api'
import Icono from '../componentes/Icono'
import Ventana from '../componentes/Ventana'
import FormularioRegistro from '../componentes/FormularioRegistro'
import TablaRegistros from '../componentes/TablaRegistros'
import CuadriculaMedicamentos from '../componentes/CuadriculaMedicamentos'
import DetalleMedicamento from '../componentes/DetalleMedicamento'
import { SinRegistros, MensajeDeError, Cargando } from '../componentes/Mensajes'

const filtrosDeEstatus = [['activos', 'Activos'], ['todos', 'Todos'], ['inactivos', 'Inactivos']]

function simplificar(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function ordenarMedicamentos(medicamentos, orden) {
  const porNombre = (a, b) => a.nombre.localeCompare(b.nombre, 'es')

  return [...medicamentos].sort((a, b) => {
    if (orden === 'precio-menor') return a.precioUnitario - b.precioUnitario || porNombre(a, b)
    if (orden === 'precio-mayor') return b.precioUnitario - a.precioUnitario || porNombre(a, b)
    if (orden === 'recientes') return b.id - a.id
    return porNombre(a, b) || a.id - b.id
  })
}

function ConfirmarEstatus({ registro, singular, guardando, error, alConfirmar, alCerrar }) {
  const esBaja = registro.estatus === 1
  const accion = esBaja ? 'dar de baja' : 'reactivar'

  return (
    <Ventana chica titulo={`${esBaja ? 'Dar de baja' : 'Reactivar'} ${singular}`} alCerrar={alCerrar} ocupada={guardando}>
      <div className="modal-body">
        <div className={esBaja ? 'confirm-symbol danger' : 'confirm-symbol'}>
          <Icono nombre={esBaja ? 'basura' : 'reactivar'} tamano={26} />
        </div>
        <p>¿Quieres {accion} a <strong>{registro.nombre}</strong>?</p>
        <p className="muted">
          {esBaja
            ? 'El registro se conservará y podrás reactivarlo desde la vista de inactivos.'
            : 'Volverá a aparecer en los registros activos.'}
        </p>
        <MensajeDeError mensaje={error} />
      </div>
      <footer className="modal-footer">
        <button className="button secondary" disabled={guardando} onClick={alCerrar}>Cancelar</button>
        <button className={esBaja ? 'button danger' : 'button primary'} disabled={guardando} onClick={alConfirmar}>
          {guardando ? 'Guardando…' : 'Confirmar'}
        </button>
      </footer>
    </Ventana>
  )
}

function Catalogo({ catalogo, usuario, avisar }) {
  const configuracion = catalogos[catalogo]
  const titulo = configuracion.titulo.toLowerCase()
  const singular = configuracion.singular.toLowerCase()
  const esProductos = catalogo === 'productos'
  const registrosPorPagina = esProductos ? 12 : 8

  const [registros, guardarRegistros] = useState([])
  const [cargando, guardarCargando] = useState(true)
  const [error, guardarError] = useState('')
  const [recarga, guardarRecarga] = useState(0)

  const [busqueda, guardarBusqueda] = useState('')
  const [filtro, guardarFiltro] = useState('activos')
  const [orden, guardarOrden] = useState('nombre')
  const [pagina, guardarPagina] = useState(1)

  const [registroEnFormulario, guardarRegistroEnFormulario] = useState(null)
  const [medicamentoVisto, guardarMedicamentoVisto] = useState(null)
  const [registroPorConfirmar, guardarRegistroPorConfirmar] = useState(null)
  const [guardando, guardarGuardando] = useState(false)
  const [errorAlConfirmar, guardarErrorAlConfirmar] = useState('')

  useEffect(() => {
    pedir(`/${catalogo}?estatus=todos`)
      .then(datos => {
        guardarRegistros(datos)
        guardarError('')
      })
      .catch(errorDeLaApi => guardarError(errorDeLaApi.message))
      .finally(() => guardarCargando(false))
  }, [catalogo, recarga])

  function recargar() {
    guardarCargando(true)
    guardarError('')
    guardarRecarga(recarga + 1)
  }

  function cambiar(guardar, valor) {
    guardar(valor)
    guardarPagina(1)
  }

  function pedirConfirmacion(registro) {
    guardarErrorAlConfirmar('')
    guardarRegistroPorConfirmar(registro)
  }

  async function cambiarEstatus() {
    const reactivar = registroPorConfirmar.estatus === 0

    guardarGuardando(true)
    guardarErrorAlConfirmar('')

    try {
      if (reactivar) {
        await pedir(`/${catalogo}/${registroPorConfirmar.id}/reactivar`, 'PATCH')
      } else {
        await pedir(`/${catalogo}/${registroPorConfirmar.id}`, 'DELETE')
      }
      avisar(`${configuracion.singular} ${reactivar ? 'reactivado' : 'dado de baja'} correctamente.`)
      guardarRegistroPorConfirmar(null)
      recargar()
    } catch (errorDeLaApi) {
      guardarErrorAlConfirmar(errorDeLaApi.message)
    } finally {
      guardarGuardando(false)
    }
  }

  function pasaLosFiltros(registro) {
    if (filtro === 'activos' && registro.estatus !== 1) return false
    if (filtro === 'inactivos' && registro.estatus !== 0) return false

    const camposDeTexto = configuracion.campos.filter(campo => campo.tipo !== 'imagen')
    return camposDeTexto.some(campo => simplificar(registro[campo.clave]).includes(simplificar(busqueda)))
  }

  let filtrados = registros.filter(pasaLosFiltros)
  if (esProductos) filtrados = ordenarMedicamentos(filtrados, orden)

  const totalDePaginas = Math.max(1, Math.ceil(filtrados.length / registrosPorPagina))
  const paginaActual = Math.min(pagina, totalDePaginas)
  const primero = (paginaActual - 1) * registrosPorPagina
  const ultimo = Math.min(primero + registrosPorPagina, filtrados.length)
  const visibles = filtrados.slice(primero, ultimo)

  const puedeCrear = puedeAdministrar(usuario.area, catalogo, 'crear')
  const puedeEditar = puedeAdministrar(usuario.area, catalogo, 'editar')
  const puedeEliminar = puedeAdministrar(usuario.area, catalogo, 'eliminar')

  let contenido = null
  if (cargando) {
    contenido = <Cargando />
  } else if (!error && visibles.length === 0) {
    contenido = (
      <SinRegistros
        icono={configuracion.icono}
        descripcion={busqueda ? 'Prueba con otro nombre o limpia los filtros.' : 'Aún no hay registros en esta vista.'}
      />
    )
  } else if (!error && esProductos) {
    contenido = (
      <CuadriculaMedicamentos
        medicamentos={visibles}
        puedeEditar={puedeEditar}
        puedeEliminar={puedeEliminar}
        alVer={guardarMedicamentoVisto}
        alEditar={guardarRegistroEnFormulario}
        alCambiarEstatus={pedirConfirmacion}
      />
    )
  } else if (!error) {
    contenido = (
      <TablaRegistros
        columnas={configuracion.columnas}
        registros={visibles}
        puedeEditar={puedeEditar}
        puedeEliminar={puedeEliminar}
        alEditar={guardarRegistroEnFormulario}
        alCambiarEstatus={pedirConfirmacion}
      />
    )
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">ADMINISTRACIÓN</span>
          <h1>{configuracion.titulo}</h1>
          <p>{configuracion.descripcion}</p>
        </div>
        <span className="page-symbol"><Icono nombre={configuracion.icono} tamano={30} /></span>
      </div>

      <section className={esProductos ? 'panel catalog-panel products-catalog' : 'panel catalog-panel'} aria-label={`Catálogo de ${titulo}`}>
        <div className="catalog-heading">
          <div className="section-title">
            <Icono nombre={configuracion.icono} />
            <h2>Catálogo de {titulo}</h2>
            <span className="count-badge">{registros.length}</span>
          </div>
          {puedeCrear && (
            <button className="button success" onClick={() => guardarRegistroEnFormulario({})}>
              <Icono nombre="mas" tamano={18} />Agregar {singular}
            </button>
          )}
        </div>

        <div className="table-toolbar">
          <div className="segmented" aria-label="Filtrar por estado">
            {filtrosDeEstatus.map(([valor, etiqueta]) => (
              <button
                key={valor}
                aria-pressed={filtro === valor}
                className={filtro === valor ? 'selected' : ''}
                onClick={() => cambiar(guardarFiltro, valor)}
              >
                {etiqueta}
              </button>
            ))}
          </div>

          <div className="catalog-search-tools">
            {esProductos && (
              <select className="product-sort" aria-label="Ordenar medicamentos" value={orden} onChange={evento => cambiar(guardarOrden, evento.target.value)}>
                <option value="nombre">Nombre: A–Z</option>
                <option value="precio-menor">Precio: menor a mayor</option>
                <option value="precio-mayor">Precio: mayor a menor</option>
                <option value="recientes">Más recientes</option>
              </select>
            )}
            <div className="search-box">
              <Icono nombre="buscar" tamano={18} />
              <input
                type="search"
                aria-label={`Buscar ${titulo}`}
                placeholder={`Buscar ${titulo}…`}
                value={busqueda}
                onChange={evento => cambiar(guardarBusqueda, evento.target.value)}
              />
            </div>
          </div>
        </div>

        <MensajeDeError mensaje={error} reintentar={recargar} />
        {contenido}

        <footer className="table-footer">
          <span>
            {filtrados.length ? `${primero + 1}–${ultimo} de ${filtrados.length}` : '0'} {esProductos ? 'medicamentos' : 'registros'}
          </span>
          <div className="pagination">
            <button aria-label="Página anterior" disabled={paginaActual === 1} onClick={() => guardarPagina(paginaActual - 1)}>
              <Icono nombre="siguiente" tamano={16} className="rotate" />
            </button>
            <span aria-label={`Página ${paginaActual} de ${totalDePaginas}`}>{paginaActual}</span>
            <button aria-label="Página siguiente" disabled={paginaActual === totalDePaginas} onClick={() => guardarPagina(paginaActual + 1)}>
              <Icono nombre="siguiente" tamano={16} />
            </button>
          </div>
        </footer>
      </section>

      {medicamentoVisto && (
        <DetalleMedicamento
          key={medicamentoVisto.id}
          medicamento={medicamentoVisto}
          puedeEditar={puedeEditar}
          alCerrar={() => guardarMedicamentoVisto(null)}
          alEditar={medicamento => {
            guardarMedicamentoVisto(null)
            guardarRegistroEnFormulario(medicamento)
          }}
        />
      )}

      {registroEnFormulario && (
        <FormularioRegistro
          catalogo={catalogo}
          registro={registroEnFormulario}
          alCerrar={() => guardarRegistroEnFormulario(null)}
          alGuardar={mensaje => {
            guardarRegistroEnFormulario(null)
            avisar(mensaje)
            recargar()
          }}
        />
      )}

      {registroPorConfirmar && (
        <ConfirmarEstatus
          registro={registroPorConfirmar}
          singular={singular}
          guardando={guardando}
          error={errorAlConfirmar}
          alConfirmar={cambiarEstatus}
          alCerrar={() => guardarRegistroPorConfirmar(null)}
        />
      )}
    </>
  )
}

export default Catalogo
