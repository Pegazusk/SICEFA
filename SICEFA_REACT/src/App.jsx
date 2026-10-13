import { useEffect, useState } from 'react'
import { pedir } from './api'
import { catalogos } from '../compartido/catalogos'
import Icono from './componentes/Icono'
import Ventana from './componentes/Ventana'
import { MensajeDeError, Cargando } from './componentes/Mensajes'
import InicioSesion from './paginas/InicioSesion'
import Inicio from './paginas/Inicio'
import Catalogo from './paginas/Catalogo'
import Operaciones from './paginas/Operaciones'

const menuDeCentral = [
  ['inicio', 'Inicio', 'inicio'],
  ['sucursales', 'Sucursal', 'edificio'],
  ['productos', 'Producto', 'pastilla'],
  ['empleados', 'Empleado', 'gafete'],
  ['clientes', 'Cliente', 'usuarios'],
]
const menuDeSucursal = [
  ['inicio', 'Inicio', 'inicio'],
  ['clientes', 'Clientes', 'usuarios'],
  ['compras', 'Compra', 'carrito'],
  ['empleados', 'Empleados', 'gafete'],
  ['productos', 'Productos', 'pastilla'],
  ['ventas', 'Ventas', 'recibo'],
]

function leerPaginaDeLaDireccion() {
  return window.location.hash.replace(/^#\/?/, '').split('/')[0] || 'inicio'
}

function App() {
  const [usuario, guardarUsuario] = useState(null)
  const [cargando, guardarCargando] = useState(true)
  const [errorAlIniciar, guardarErrorAlIniciar] = useState('')
  const [intento, guardarIntento] = useState(0)
  const [sesionTerminada, guardarSesionTerminada] = useState(false)

  const [pagina, guardarPagina] = useState(leerPaginaDeLaDireccion)
  const [aviso, guardarAviso] = useState('')
  const [verPerfil, guardarVerPerfil] = useState(false)
  const [saliendo, guardarSaliendo] = useState(false)

  useEffect(() => {
    pedir('/sesion/usuario')
      .then(respuesta => {
        guardarUsuario(respuesta.usuario)
        guardarErrorAlIniciar('')
      })
      .catch(error => {
        if (error.estado !== 401) guardarErrorAlIniciar(error.message)
      })
      .finally(() => guardarCargando(false))
  }, [intento])

  useEffect(() => {
    function cambiarDePagina() {
      guardarPagina(leerPaginaDeLaDireccion())
      window.scrollTo(0, 0)
    }
    function terminarSesion() {
      guardarUsuario(null)
      guardarSesionTerminada(true)
      guardarVerPerfil(false)
    }

    window.addEventListener('hashchange', cambiarDePagina)
    window.addEventListener('sesion-terminada', terminarSesion)
    return () => {
      window.removeEventListener('hashchange', cambiarDePagina)
      window.removeEventListener('sesion-terminada', terminarSesion)
    }
  }, [])

  useEffect(() => {
    if (!aviso) return
    const reloj = setTimeout(() => guardarAviso(''), 4500)
    return () => clearTimeout(reloj)
  }, [aviso])

  const menu = usuario && usuario.area === 'sucursal' ? menuDeSucursal : menuDeCentral
  const paginaActual = menu.some(([clave]) => clave === pagina) ? pagina : 'inicio'
  const tituloDeLaPagina = menu.find(([clave]) => clave === paginaActual)[1]

  useEffect(() => {
    document.title = `SICEFA · ${usuario ? tituloDeLaPagina : 'Iniciar sesión'}`
  }, [usuario, tituloDeLaPagina])

  function entrar(usuarioQueEntro) {
    guardarUsuario(usuarioQueEntro)
    guardarSesionTerminada(false)
    window.location.hash = '/inicio'
    guardarPagina('inicio')
  }

  async function salir() {
    guardarSaliendo(true)
    try {
      await pedir('/sesion/salir', 'POST')
      guardarUsuario(null)
      guardarSesionTerminada(false)
      guardarVerPerfil(false)
      window.location.hash = '/inicio'
    } catch (error) {
      guardarAviso(error.message)
    } finally {
      guardarSaliendo(false)
    }
  }

  function reintentar() {
    guardarCargando(true)
    guardarIntento(intento + 1)
  }

  function irAlContenido(evento) {
    evento.preventDefault()
    document.getElementById('contenido').focus()
  }

  if (cargando) {
    return (
      <main className="startup">
        <img src="/img/sicefa_logo_trans.png" alt="SICEFA" />
        <Cargando texto="Preparando tu espacio…" />
      </main>
    )
  }

  if (errorAlIniciar && !usuario) {
    return (
      <main className="startup">
        <img src="/img/sicefa_logo_trans.png" alt="SICEFA" />
        <MensajeDeError mensaje={errorAlIniciar} reintentar={reintentar} />
      </main>
    )
  }

  if (!usuario) {
    return <InicioSesion sesionTerminada={sesionTerminada} alEntrar={entrar} />
  }

  const nombreDelArea = usuario.area === 'central' ? 'Central' : 'Sucursal'
  const iniciales = usuario.nombre.split(' ').map(palabra => palabra[0]).slice(0, 2).join('')

  let contenido
  if (paginaActual === 'inicio') {
    contenido = <Inicio usuario={usuario} />
  } else if (catalogos[paginaActual]) {
    contenido = <Catalogo key={paginaActual} catalogo={paginaActual} usuario={usuario} avisar={guardarAviso} />
  } else {
    contenido = <Operaciones key={paginaActual} tipo={paginaActual} usuario={usuario} avisar={guardarAviso} />
  }

  return (
    <div className="app-shell">
      <a href="#contenido" className="skip-link" onClick={irAlContenido}>Ir al contenido</a>

      <header className="app-header">
        <div className="container header-inner">
          <a className="brand" href="#/inicio" aria-label="SICEFA, ir a Inicio">
            <img src="/img/logo_trans.png" alt="" />
            <div>
              <span>SICEFA</span>
              <small>Sistema de Control de Farmacias</small>
            </div>
          </a>
          <div className="header-right">
            <span className="area-badge"><span className="status-dot" />{nombreDelArea}</span>
            <span className="header-divider" />
            <button className="profile-button" onClick={() => guardarVerPerfil(true)} aria-label="Mi perfil">
              <span className="avatar">{iniciales}</span>
              <span>
                <strong>{usuario.nombre}</strong>
                <small>Mi perfil</small>
              </span>
            </button>
            <button className="logout-button" onClick={salir} disabled={saliendo} aria-label="Cerrar sesión" title="Cerrar sesión">
              <Icono nombre="salir" />
            </button>
          </div>
        </div>
      </header>

      <nav className="main-nav" aria-label="Navegación principal">
        <div className="container nav-inner">
          {menu.map(([clave, texto, icono]) => (
            <a
              key={clave}
              href={`#/${clave}`}
              className={paginaActual === clave ? 'active' : ''}
              aria-current={paginaActual === clave ? 'page' : undefined}
            >
              <Icono nombre={icono} tamano={19} />{texto}
            </a>
          ))}
          <span className="nav-caption">Cuidamos lo que importa.</span>
        </div>
      </nav>

      <main className="container main-content" id="contenido" tabIndex="-1">
        <div className="breadcrumbs">
          <Icono nombre="inicio" tamano={14} />
          <span>SICEFA {nombreDelArea}</span>
          <Icono nombre="siguiente" tamano={12} />
          <strong>{tituloDeLaPagina}</strong>
        </div>
        {contenido}
      </main>

      <footer className="app-footer container">
        <span><strong>SICEFA</strong> · Sistema de Control de Farmacias</span>
        <span>Tu salud, nuestro compromiso.</span>
      </footer>

      {aviso && (
        <div className="toast" role="status">
          <Icono nombre="palomita" />
          <span>{aviso}</span>
          <button className="icon-button" aria-label="Cerrar notificación" onClick={() => guardarAviso('')}>
            <Icono nombre="cerrar" tamano={16} />
          </button>
        </div>
      )}

      {verPerfil && (
        <Ventana chica titulo="Mi perfil" alCerrar={() => guardarVerPerfil(false)}>
          <div className="modal-body profile-details">
            <span className="avatar large">{iniciales}</span>
            <h3>{usuario.nombre}</h3>
            <p>{usuario.usuario}</p>
            <dl>
              <dt>Área de acceso</dt>
              <dd>{nombreDelArea}</dd>
              <dt>Sucursal asignada</dt>
              <dd>{usuario.nombreSucursal}</dd>
            </dl>
          </div>
          <footer className="modal-footer">
            <button className="button secondary" onClick={() => guardarVerPerfil(false)}>Cerrar</button>
            <button className="button danger" onClick={salir} disabled={saliendo}>
              <Icono nombre="salir" tamano={17} />
              {saliendo ? 'Saliendo…' : 'Cerrar sesión'}
            </button>
          </footer>
        </Ventana>
      )}
    </div>
  )
}

export default App
