import { useState } from 'react'

function ImagenMedicamento({ medicamento, grande = false }) {
  const [fotoQueFallo, guardarFotoQueFallo] = useState(null)

  const tieneFoto = medicamento.foto && medicamento.foto !== fotoQueFallo

  return (
    <span className={grande ? 'product-visual product-visual-large' : 'product-visual'}>
      {tieneFoto ? (
        <img
          src={medicamento.foto}
          alt={medicamento.nombre}
          loading={grande ? 'eager' : 'lazy'}
          onError={() => guardarFotoQueFallo(medicamento.foto)}
        />
      ) : (
        <span className="product-photo-unavailable">Fotografía no disponible</span>
      )}
    </span>
  )
}

export default ImagenMedicamento
