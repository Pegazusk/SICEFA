import { useEffect, useRef, useId } from 'react'
import Icono from './Icono'

function Ventana({ titulo, subtitulo, children, alCerrar, ocupada = false, chica = false, ancha = false }) {
  const dialogo = useRef(null)
  const idDelTitulo = useId()

  useEffect(() => {
    const elemento = dialogo.current
    const desplazamientoAnterior = document.body.style.overflow

    elemento.showModal()
    document.body.style.overflow = 'hidden'

    return () => {
      elemento.close()
      document.body.style.overflow = desplazamientoAnterior
    }
  }, [])

  function alCancelar(evento) {
    evento.preventDefault()
    if (!ocupada) alCerrar()
  }

  function alHacerClic(evento) {
    if (evento.target !== dialogo.current || ocupada) return

    const borde = dialogo.current.getBoundingClientRect()
    const fueAfuera = evento.clientX < borde.left || evento.clientX > borde.right
      || evento.clientY < borde.top || evento.clientY > borde.bottom

    if (fueAfuera) alCerrar()
  }

  let clases = 'modal'
  if (chica) clases += ' modal-small'
  if (ancha) clases += ' modal-wide'

  return (
    <dialog ref={dialogo} className={clases} aria-labelledby={idDelTitulo} onCancel={alCancelar} onClick={alHacerClic}>
      <header className="modal-header">
        <div>
          <h2 id={idDelTitulo}>{titulo}</h2>
          {subtitulo && <p>{subtitulo}</p>}
        </div>
        <button type="button" className="icon-button" aria-label="Cerrar ventana" disabled={ocupada} onClick={alCerrar}>
          <Icono nombre="cerrar" />
        </button>
      </header>
      {children}
    </dialog>
  )
}

export default Ventana
