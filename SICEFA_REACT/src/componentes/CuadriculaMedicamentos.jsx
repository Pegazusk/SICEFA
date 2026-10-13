import { formatoDinero } from '../api'
import Icono from './Icono'
import ImagenMedicamento from './ImagenMedicamento'
import { EtiquetaDeEstatus } from './Mensajes'

function TarjetaMedicamento({ medicamento, puedeEditar, puedeEliminar, alVer, alEditar, alCambiarEstatus }) {
  const nombre = medicamento.nombre
  const presentacion = [medicamento.concentracion, medicamento.presentacion].filter(Boolean).join(' · ')
  const accionDeEstatus = medicamento.estatus ? 'Dar de baja' : 'Reactivar'

  return (
    <article className={medicamento.estatus ? 'product-card' : 'product-card product-card-inactive'} aria-label={nombre}>
      <button type="button" className="product-card-open" onClick={() => alVer(medicamento)} aria-label={`Ver información de ${nombre}`}>
        <span className="product-card-image">
          <ImagenMedicamento medicamento={medicamento} />
          <span className="product-open-hint"><Icono nombre="ojo" tamano={16} />Ver medicamento</span>
        </span>
        <span className="product-card-body">
          <span className="product-card-meta">
            <span className="product-form">
              {medicamento.formaFarmaceutica || medicamento.unidadDeMedida || 'Medicamento'}
            </span>
            <EtiquetaDeEstatus estatus={medicamento.estatus} />
          </span>
          <span className="product-card-name">{nombre}</span>
          <span className="product-card-generic">{medicamento.nombreGenerico}</span>
          <span className="product-card-presentation">{presentacion || 'Presentación no registrada'}</span>
          <span className="product-card-price">{formatoDinero(medicamento.precioUnitario)}<small>MXN</small></span>
        </span>
      </button>

      <div className="product-card-actions">
        <button type="button" className="product-details-link" onClick={() => alVer(medicamento)} aria-label={`Ver detalles de ${nombre}`}>
          Ver detalles<Icono nombre="flecha" tamano={15} />
        </button>
        <div className="row-actions">
          {puedeEditar && (
            <button type="button" className="action edit" aria-label={`Editar ${nombre}`} title="Editar" onClick={() => alEditar(medicamento)}>
              <Icono nombre="editar" tamano={15} /><span>Editar</span>
            </button>
          )}
          {puedeEliminar && (
            <button
              type="button"
              className={medicamento.estatus ? 'action delete' : 'action restore'}
              aria-label={`${accionDeEstatus} ${nombre}`}
              title={accionDeEstatus}
              onClick={() => alCambiarEstatus(medicamento)}
            >
              <Icono nombre={medicamento.estatus ? 'basura' : 'reactivar'} tamano={15} />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function CuadriculaMedicamentos({ medicamentos, ...opciones }) {
  return (
    <div className="product-grid" aria-label="Medicamentos">
      {medicamentos.map(medicamento => (
        <TarjetaMedicamento key={medicamento.id} medicamento={medicamento} {...opciones} />
      ))}
    </div>
  )
}

export default CuadriculaMedicamentos
