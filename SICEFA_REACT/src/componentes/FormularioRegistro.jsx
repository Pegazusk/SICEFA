import { useState } from 'react'
import { catalogos, fechaDeHoy } from '../../compartido/catalogos'
import { pedir } from '../api'
import Ventana from './Ventana'
import Icono from './Icono'
import { MensajeDeError } from './Mensajes'

const tiposDeEntrada = { texto: 'text', telefono: 'tel', correo: 'email', fecha: 'date', numero: 'number' }

const formatosDeImagen = ['image/png', 'image/jpeg', 'image/webp']
const pesoMaximoDeImagen = 500 * 1024

function CampoDeImagen({ campo, valorInicial }) {
  const [imagen, guardarImagen] = useState(valorInicial || '')
  const [error, guardarError] = useState('')

  function elegirArchivo(evento) {
    const archivo = evento.target.files[0]
    if (!archivo) return

    if (!formatosDeImagen.includes(archivo.type) || archivo.size > pesoMaximoDeImagen) {
      guardarError('Elige una imagen JPG, PNG o WebP de hasta 500 KB.')
      evento.target.value = ''
      return
    }

    const lector = new FileReader()
    lector.onload = () => {
      guardarImagen(lector.result)
      guardarError('')
    }
    lector.onerror = () => guardarError('No se pudo leer la imagen.')
    lector.readAsDataURL(archivo)
  }

  return (
    <div className="image-field">
      <span className="field-label">{campo.etiqueta}</span>
      <input type="hidden" name={campo.clave} value={imagen} />

      <div className="image-upload">
        {imagen
          ? <img src={imagen} alt="Vista previa" />
          : <span className="image-placeholder"><Icono nombre="subir" /></span>}
        <div>
          <label className="upload-label">
            Seleccionar imagen
            <input aria-label={campo.etiqueta} type="file" accept={formatosDeImagen.join(',')} onChange={elegirArchivo} />
          </label>
          <small>JPG, PNG o WebP · Máx. 500 KB</small>
          {imagen && <button className="text-button" type="button" onClick={() => guardarImagen('')}>Quitar imagen</button>}
        </div>
      </div>

      {error && <small role="alert" className="field-error">{error}</small>}
    </div>
  )
}

function CampoDeFormulario({ campo, valorInicial, error }) {
  const id = `campo-${campo.clave}`
  const idDelError = `error-${campo.clave}`

  const propiedades = {
    id,
    name: campo.clave,
    required: campo.obligatorio,
    defaultValue: valorInicial,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? idDelError : undefined,
  }

  let entrada
  if (campo.tipo === 'lista') {
    entrada = (
      <select {...propiedades}>
        <option value="">Seleccionar</option>
        {campo.opciones.map(opcion => <option key={opcion}>{opcion}</option>)}
      </select>
    )
  } else if (campo.tipo === 'parrafo') {
    entrada = <textarea {...propiedades} rows={3} maxLength={2000} />
  } else {
    entrada = (
      <input
        {...propiedades}
        type={tiposDeEntrada[campo.tipo]}
        min={campo.minimo}
        max={campo.maximo}
        step={campo.paso}
        maxLength={250}
        placeholder={campo.tipo === 'fecha' ? undefined : campo.etiqueta}
      />
    )
  }

  return (
    <div className="field">
      <label htmlFor={id}>
        {campo.etiqueta}
        {campo.obligatorio && <span className="required"> *</span>}
      </label>
      {entrada}
      {error && <small className="field-error" id={idDelError}>{error}</small>}
    </div>
  )
}

function FormularioRegistro({ catalogo, registro, alCerrar, alGuardar }) {
  const configuracion = catalogos[catalogo]
  const esEdicion = Boolean(registro.id)

  const [guardando, guardarGuardando] = useState(false)
  const [error, guardarError] = useState('')
  const [erroresPorCampo, guardarErroresPorCampo] = useState({})

  async function enviar(evento) {
    evento.preventDefault()

    const datos = Object.fromEntries(new FormData(evento.currentTarget))

    guardarGuardando(true)
    guardarError('')
    guardarErroresPorCampo({})

    try {
      if (esEdicion) {
        await pedir(`/${catalogo}/${registro.id}`, 'PUT', datos)
      } else {
        await pedir(`/${catalogo}`, 'POST', datos)
      }
      alGuardar(`${configuracion.singular} ${esEdicion ? 'actualizado' : 'agregado'} correctamente.`)
    } catch (errorDeLaApi) {
      guardarError(errorDeLaApi.message)
      guardarErroresPorCampo(errorDeLaApi.campos || {})
    } finally {
      guardarGuardando(false)
    }
  }

  function valorInicial(campo) {
    if (registro[campo.clave] != null) return registro[campo.clave]
    if (campo.clave === 'fechaRegistro' || campo.clave === 'fechaIngreso') return fechaDeHoy()
    return ''
  }

  return (
    <Ventana
      titulo={`${esEdicion ? 'Editar' : 'Agregar'} ${configuracion.singular.toLowerCase()}`}
      subtitulo="Los campos con * son obligatorios."
      alCerrar={alCerrar}
      ocupada={guardando}
    >
      <form onSubmit={enviar}>
        <div className="modal-body">
          <MensajeDeError mensaje={error} />
          <fieldset disabled={guardando} className="form-grid">
            {configuracion.campos.map(campo => (
              campo.tipo === 'imagen'
                ? <CampoDeImagen key={campo.clave} campo={campo} valorInicial={valorInicial(campo)} />
                : <CampoDeFormulario key={campo.clave} campo={campo} valorInicial={valorInicial(campo)} error={erroresPorCampo[campo.clave]} />
            ))}
          </fieldset>
        </div>

        <footer className="modal-footer">
          <button type="button" className="button secondary" disabled={guardando} onClick={alCerrar}>Cancelar</button>
          <button className="button primary" disabled={guardando}>
            <Icono nombre="palomita" />
            {guardando ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </footer>
      </form>
    </Ventana>
  )
}

export default FormularioRegistro
