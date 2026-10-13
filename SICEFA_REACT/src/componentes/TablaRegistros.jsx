import { nombreCompleto } from '../../compartido/catalogos'
import Icono from './Icono'
import { EtiquetaDeEstatus } from './Mensajes'

function TablaRegistros({ columnas, registros, puedeEditar, puedeEliminar, alEditar, alCambiarEstatus }) {
  const hayAcciones = puedeEditar || puedeEliminar

  function textoDeLaCelda(registro, clave) {
    if (clave === 'nombreCompleto') return nombreCompleto(registro)
    return registro[clave] || '—'
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            {columnas.map(([clave, encabezado]) => <th key={clave} scope="col">{encabezado}</th>)}
            <th scope="col">Estado</th>
            {hayAcciones && <th scope="col" className="actions-heading">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {registros.map(registro => {
            const accionDeEstatus = registro.estatus ? 'Dar de baja' : 'Reactivar'

            return (
              <tr key={registro.id}>
                {columnas.map(([clave]) => (
                  <td key={clave} className={clave === 'nombre' || clave === 'nombreCompleto' ? 'name-cell' : ''}>
                    {textoDeLaCelda(registro, clave)}
                  </td>
                ))}
                <td><EtiquetaDeEstatus estatus={registro.estatus} /></td>
                {hayAcciones && (
                  <td>
                    <div className="row-actions">
                      {puedeEditar && (
                        <button className="action edit" aria-label={`Editar ${registro.nombre}`} title="Editar" onClick={() => alEditar(registro)}>
                          <Icono nombre="editar" tamano={16} /><span>Editar</span>
                        </button>
                      )}
                      {puedeEliminar && (
                        <button
                          className={registro.estatus ? 'action delete' : 'action restore'}
                          aria-label={`${accionDeEstatus} ${registro.nombre}`}
                          title={accionDeEstatus}
                          onClick={() => alCambiarEstatus(registro)}
                        >
                          <Icono nombre={registro.estatus ? 'basura' : 'reactivar'} tamano={16} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default TablaRegistros
