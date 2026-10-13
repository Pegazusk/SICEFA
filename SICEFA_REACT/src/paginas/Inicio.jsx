import { useEffect, useState } from 'react'
import { pedir } from '../api'
import Icono from '../componentes/Icono'
import { MensajeDeError } from '../componentes/Mensajes'

const tarjetasDeCentral = [
  ['sucursales', 'Sucursales', 'edificio'],
  ['productos', 'Productos', 'pastilla'],
  ['empleados', 'Empleados', 'gafete'],
  ['clientes', 'Clientes', 'usuarios'],
]
const tarjetasDeSucursal = [
  ['productos', 'Productos', 'pastilla'],
  ['clientes', 'Clientes', 'usuarios'],
  ['empleados', 'Empleados', 'gafete'],
]

function Inicio({ usuario }) {
  const [totales, guardarTotales] = useState(null)
  const [error, guardarError] = useState('')
  const [intento, guardarIntento] = useState(0)

  useEffect(() => {
    pedir('/resumen')
      .then(datos => {
        guardarTotales(datos)
        guardarError('')
      })
      .catch(errorDeLaApi => guardarError(errorDeLaApi.message))
  }, [intento])

  const esCentral = usuario.area === 'central'
  const tarjetas = esCentral ? tarjetasDeCentral : tarjetasDeSucursal
  const primerNombre = usuario.nombre.split(' ')[0]
  const fechaDeHoy = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">TU ESPACIO DE TRABAJO</span>
          <h1>Inicio</h1>
          <p>Un nuevo día para cuidar de los demás.</p>
        </div>
        <span className="today">{fechaDeHoy}</span>
      </div>

      <section className="panel welcome-panel">
        <div>
          <span className="welcome-tag"><span className="status-dot" />SICEFA {esCentral ? 'Central' : 'Sucursal'}</span>
          <h2>Bienvenido, {primerNombre}.</h2>
          <p>
            Todo lo que necesitas para administrar tu farmacia,<br className="desktop-break" /> con la atención y el cuidado de siempre.
          </p>
          {!esCentral && (
            <span className="branch-caption"><Icono nombre="edificio" tamano={15} />{usuario.nombreSucursal}</span>
          )}
        </div>
        <div className="welcome-art"><img src="/img/logo_trans.png" alt="" /></div>
      </section>

      <MensajeDeError mensaje={error} reintentar={() => guardarIntento(intento + 1)} />

      <div className="overview-grid">
        {tarjetas.map(([catalogo, etiqueta, icono]) => (
          <a href={`#/${catalogo}`} className="overview-card" key={catalogo}>
            <span className="overview-icon"><Icono nombre={icono} tamano={23} /></span>
            <div>
              <strong>{totales ? totales[catalogo] : '—'}</strong>
              <span>{etiqueta} activos</span>
            </div>
            <Icono nombre="siguiente" tamano={17} />
          </a>
        ))}
      </div>

      <section className="panel purpose-panel">
        <span className="purpose-icon"><Icono nombre="objetivo" tamano={26} /></span>
        <div>
          <span className="eyebrow">HACIA DÓNDE VAMOS</span>
          <h2>Nuestra visión</h2>
          <p>Ser una red de farmacias cercana y confiable, reconocida por la calidad de su servicio y el compromiso con el bienestar de cada persona.</p>
        </div>
      </section>

      <section className="panel purpose-panel">
        <span className="purpose-icon red"><Icono nombre="corazon" tamano={26} /></span>
        <div>
          <span className="eyebrow">LO QUE NOS MUEVE</span>
          <h2>Nuestra misión</h2>
          <p>Facilitar el acceso a medicamentos y productos para la salud, brindando una atención responsable, humana y oportuna en cada una de nuestras sucursales.</p>
        </div>
      </section>
    </>
  )
}

export default Inicio
