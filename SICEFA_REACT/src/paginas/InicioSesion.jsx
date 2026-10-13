import { useState } from 'react'
import { pedir } from '../api'
import Icono from '../componentes/Icono'
import { MensajeDeError } from '../componentes/Mensajes'

function InicioSesion({ alEntrar, sesionTerminada = false }) {
  const [area, guardarArea] = useState('central')
  const [verContrasena, guardarVerContrasena] = useState(false)
  const [entrando, guardarEntrando] = useState(false)
  const [error, guardarError] = useState('')

  const esCentral = area === 'central'

  async function enviar(evento) {
    evento.preventDefault()
    const formulario = new FormData(evento.currentTarget)

    guardarEntrando(true)
    guardarError('')

    try {
      const respuesta = await pedir('/sesion/entrar', 'POST', {
        usuario: formulario.get('usuario'),
        contrasena: formulario.get('contrasena'),
        area,
      })
      alEntrar(respuesta.usuario)
    } catch (errorDeLaApi) {
      guardarError(errorDeLaApi.message)
    } finally {
      guardarEntrando(false)
    }
  }

  function cambiarDeArea() {
    guardarArea(esCentral ? 'sucursal' : 'central')
    guardarError('')
  }

  return (
    <main className="login-page">
      <div className="login-topline">
        <span>Sistema de Control de Farmacias</span>
        <span>Tu salud, nuestro compromiso.</span>
      </div>

      <section className="login-panel">
        <img src="/img/sicefa_logo_trans.png" className="login-logo" alt="SICEFA" />
        <div className="login-intro">
          <span className="eyebrow">BIENVENIDO DE NUEVO</span>
          <h1>Todo listo para comenzar.</h1>
          <p>Ingresa tus datos para acceder a SICEFA.</p>
        </div>
        <div className="area-label">
          <span className="status-dot" /> Acceso {esCentral ? 'Central' : 'Sucursal'}
        </div>
        {sesionTerminada && <p className="session-notice" role="status">Tu sesión terminó. Ingresa nuevamente.</p>}

        <form onSubmit={enviar} className="login-form">
          <MensajeDeError mensaje={error} />

          <label htmlFor="usuario">{esCentral ? 'Administrador' : 'Usuario de sucursal'}</label>
          <div className="input-icon">
            <Icono nombre="usuario" />
            <input
              id="usuario"
              name="usuario"
              placeholder="Ingresa tu usuario"
              autoComplete="username"
              required
              maxLength={100}
              disabled={entrando}
            />
          </div>

          <label htmlFor="contrasena">Contraseña</label>
          <div className="input-icon">
            <Icono nombre="candado" />
            <input
              id="contrasena"
              name="contrasena"
              placeholder="Ingresa tu contraseña"
              type={verContrasena ? 'text' : 'password'}
              autoComplete="current-password"
              required
              maxLength={200}
              disabled={entrando}
            />
            <button
              type="button"
              className="icon-button"
              onClick={() => guardarVerContrasena(!verContrasena)}
              aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={verContrasena}
            >
              <Icono nombre="ojo" tamano={18} />
            </button>
          </div>

          <button className="button login-submit" disabled={entrando}>
            {entrando ? 'Ingresando…' : 'Entrar'}<Icono nombre="flecha" />
          </button>
        </form>

        <button type="button" className="button switch-area" disabled={entrando} onClick={cambiarDeArea}>
          <Icono nombre="edificio" tamano={18} />Ir a {esCentral ? 'Sucursal' : 'Central'}<Icono nombre="flecha" tamano={17} />
        </button>
      </section>

      <footer className="login-footer">SICEFA <span>·</span> Sistema de Control de Farmacias</footer>
    </main>
  )
}

export default InicioSesion
