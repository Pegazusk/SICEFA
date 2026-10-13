const trazos = {
  inicio: 'm3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
  edificio: 'M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16M2 21h20M8 7h1m6 0h1M8 11h1m6 0h1M10 21v-5h4v5',
  pastilla: 'm8 16 8-8M6 18a5.66 5.66 0 0 1 0-8l4-4a5.66 5.66 0 0 1 8 8l-4 4a5.66 5.66 0 0 1-8 0Z',
  usuarios: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M15 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
  gafete: 'M9 4H5a2 2 0 0 0-2 2v14h18V6a2 2 0 0 0-2-2h-4M9 2h6v5H9zM8 17c0-3 8-3 8 0m-2-6a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
  mas: 'M12 5v14M5 12h14',
  buscar: 'm21 21-5-5m2-6a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  editar: 'm15 5 4 4M4 20l5-1L20 8a2.8 2.8 0 0 0-4-4L5 15z',
  basura: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
  cerrar: 'm6 6 12 12M6 18 18 6',
  palomita: 'm5 12 4 4L19 6',
  flecha: 'M4 12h16m-6-6 6 6-6 6',
  salir: 'M9 4H4v16h5m5-15 7 7-7 7M8 12h13',
  candado: 'M6 10h12v11H6zM8 10V6a4 4 0 0 1 8 0v4m-4 5v2',
  usuario: 'M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  ojo: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  carrito: 'M2 3h3l3 13h11l3-9H6M9 21h.01M18 21h.01',
  recibo: 'M5 3v18l3-2 4 2 4-2 3 2V3l-3 2-4-2-4 2zM9 9h6m-6 4h6',
  corazon: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  objetivo: 'M21 12a9 9 0 1 1-9-9m9 0-9 9m4-9h5v5m-5 4a4 4 0 1 1-4-4',
  reactivar: 'M3 11a9 9 0 1 1 2 7M3 4v7h7',
  alerta: 'm12 3 10 18H2zM12 9v4m0 4h.01',
  siguiente: 'm9 5 7 7-7 7',
  subir: 'M12 16V3m-5 5 5-5 5 5M4 15v6h16v-6',
}

function Icono({ nombre, tamano = 20, className }) {
  return (
    <svg
      className={className}
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={trazos[nombre]} />
    </svg>
  )
}

export default Icono
