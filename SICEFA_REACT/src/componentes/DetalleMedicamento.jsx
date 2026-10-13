import { catalogos } from '../../compartido/catalogos'
import { formatoDinero } from '../api'
import Ventana from './Ventana'
import Icono from './Icono'
import ImagenMedicamento from './ImagenMedicamento'
import { EtiquetaDeEstatus } from './Mensajes'

const camposAparte = ['nombre', 'foto', 'precioUnitario', 'principalIndicacion', 'contraindicaciones']

function DetalleMedicamento({ medicamento, puedeEditar, alEditar, alCerrar }) {
  const camposDeLaLista = catalogos.productos.campos.filter(campo => !camposAparte.includes(campo.clave))
  const folio = String(medicamento.id).padStart(4, '0')

  return (
    <Ventana titulo="Información del medicamento" subtitulo={`Ficha de producto · #${folio}`} alCerrar={alCerrar} ancha>
      <div className="product-detail-layout">
        <div className="product-detail-image">
          <ImagenMedicamento medicamento={medicamento} grande />
        </div>
        <div className="product-detail-info">
          <EtiquetaDeEstatus estatus={medicamento.estatus} />
          <h3>{medicamento.nombre}</h3>
          <p className="product-detail-generic">{medicamento.nombreGenerico}</p>
          <p className="product-detail-price">{formatoDinero(medicamento.precioUnitario)}<span>MXN / unidad</span></p>
          <dl className="product-specifications">
            {camposDeLaLista.map(campo => (
              <div key={campo.clave}>
                <dt>{campo.etiqueta}</dt>
                <dd>{medicamento[campo.clave] ?? 'No registrado'}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className="product-detail-notes">
        <section>
          <h3>Principal indicación</h3>
          <p>{medicamento.principalIndicacion || 'Sin información registrada.'}</p>
        </section>
        <section>
          <h3>Contraindicaciones</h3>
          <p>{medicamento.contraindicaciones || 'Sin información registrada.'}</p>
        </section>
      </div>

      <footer className="modal-footer">
        <button type="button" className="button secondary" onClick={alCerrar}>Cerrar</button>
        {puedeEditar && (
          <button type="button" className="button primary" onClick={() => alEditar(medicamento)}>
            <Icono nombre="editar" tamano={17} />Editar medicamento
          </button>
        )}
      </footer>
    </Ventana>
  )
}

export default DetalleMedicamento
