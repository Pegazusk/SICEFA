import Icono from './Icono'

export function MensajeDeError({ mensaje, reintentar }) {
  if (!mensaje) return null

  return (
    <div role="alert" className="error-message">
      <Icono nombre="alerta" />
      <span>{mensaje}</span>
      {reintentar && <button type="button" onClick={reintentar}>Reintentar</button>}
    </div>
  )
}

export function Cargando({ texto = 'Cargando información…' }) {
  return (
    <div role="status" className="loading">
      <span className="spinner" />
      {texto}
    </div>
  )
}

export function SinRegistros({
  titulo = 'No encontramos registros',
  descripcion = 'Prueba con otra búsqueda o agrega un nuevo registro.',
  icono = 'buscar',
}) {
  return (
    <div className="empty">
      <span className="empty-icon"><Icono nombre={icono} tamano={30} /></span>
      <h3>{titulo}</h3>
      <p>{descripcion}</p>
    </div>
  )
}

export function Etiqueta({ color, children }) {
  return (
    <span className={`status ${color}`}>
      <span />
      {children}
    </span>
  )
}

export function EtiquetaDeEstatus({ estatus }) {
  return <Etiqueta color={estatus ? 'active' : 'inactive'}>{estatus ? 'Activo' : 'Inactivo'}</Etiqueta>
}
