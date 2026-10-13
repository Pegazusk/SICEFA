function campo(clave, etiqueta, tipo = 'texto', reglas = {}) {
  return { clave, etiqueta, tipo, ...reglas }
}

const opcionesDeGenero = ['Masculino', 'Femenino', 'Otro', 'Prefiero no decirlo']

const camposDePersona = [
  campo('nombre', 'Nombre', 'texto', { obligatorio: true }),
  campo('apellidoPaterno', 'Apellido paterno', 'texto', { obligatorio: true }),
  campo('apellidoMaterno', 'Apellido materno'),
  campo('genero', 'Género', 'lista', { opciones: opcionesDeGenero }),
  campo('fechaNacimiento', 'Fecha de nacimiento', 'fecha'),
  campo('rfc', 'RFC'),
  campo('curp', 'CURP'),
  campo('domicilio', 'Domicilio'),
  campo('codPostal', 'Código postal'),
  campo('ciudad', 'Ciudad'),
  campo('estado', 'Estado'),
  campo('telefono', 'Teléfono', 'telefono'),
  campo('correo', 'Correo electrónico', 'correo'),
]

export const catalogos = {
  sucursales: {
    titulo: 'Sucursales',
    singular: 'Sucursal',
    icono: 'edificio',
    descripcion: 'Administra la información de tus sucursales.',
    campos: [
      campo('nombre', 'Nombre', 'texto', { obligatorio: true }),
      campo('telefono', 'Teléfono', 'telefono', { obligatorio: true }),
      campo('calle', 'Calle y número', 'texto', { obligatorio: true }),
      campo('colonia', 'Colonia'),
      campo('ciudad', 'Ciudad', 'texto', { obligatorio: true }),
      campo('estado', 'Estado', 'texto', { obligatorio: true }),
      campo('codPostal', 'Código postal'),
      campo('latitud', 'Latitud', 'numero', { minimo: -90, maximo: 90, paso: 'any' }),
      campo('longitud', 'Longitud', 'numero', { minimo: -180, maximo: 180, paso: 'any' }),
    ],
    columnas: [
      ['nombre', 'Nombre'],
      ['calle', 'Calle'],
      ['colonia', 'Colonia'],
      ['ciudad', 'Ciudad'],
      ['estado', 'Estado'],
      ['codPostal', 'C.P.'],
      ['telefono', 'Teléfono'],
    ],
  },

  productos: {
    titulo: 'Productos',
    singular: 'Producto',
    icono: 'pastilla',
    descripcion: 'Consulta y organiza el catálogo de medicamentos.',
    campos: [
      campo('nombre', 'Nombre', 'texto', { obligatorio: true }),
      campo('nombreGenerico', 'Nombre genérico', 'texto', { obligatorio: true }),
      campo('formaFarmaceutica', 'Forma farmacéutica'),
      campo('unidadDeMedida', 'Unidad de medida'),
      campo('presentacion', 'Presentación'),
      campo('concentracion', 'Concentración'),
      campo('unidadesEnEnvase', 'Unidades en envase', 'numero', { minimo: 1, paso: 1 }),
      campo('precioUnitario', 'Precio unitario (MXN)', 'numero', { obligatorio: true, minimo: 0, maximo: 1000000, paso: '0.01' }),
      campo('principalIndicacion', 'Principal indicación', 'parrafo'),
      campo('contraindicaciones', 'Contraindicaciones', 'parrafo'),
      campo('codigoDeBarras', 'Código de barras'),
      campo('foto', 'Foto del producto', 'imagen'),
    ],
    columnas: [],
  },

  empleados: {
    titulo: 'Empleados',
    singular: 'Empleado',
    icono: 'gafete',
    descripcion: 'Mantén actualizada la información de tu equipo.',
    campos: [
      ...camposDePersona,
      campo('clave', 'Clave de empleado', 'texto', { obligatorio: true }),
      campo('puesto', 'Puesto'),
      campo('fechaIngreso', 'Fecha de ingreso', 'fecha'),
      campo('salarioMensual', 'Salario mensual (MXN)', 'numero', { minimo: 0, maximo: 1000000, paso: '0.01' }),
      campo('foto', 'Fotografía', 'imagen'),
    ],
    columnas: [
      ['nombre', 'Nombre'],
      ['apellidoPaterno', 'Apellido paterno'],
      ['apellidoMaterno', 'Apellido materno'],
      ['clave', 'Clave de empleado'],
      ['puesto', 'Puesto'],
      ['telefono', 'Teléfono'],
    ],
  },

  clientes: {
    titulo: 'Clientes',
    singular: 'Cliente',
    icono: 'usuarios',
    descripcion: 'Toda la información de tus clientes en un solo lugar.',
    campos: [
      ...camposDePersona,
      campo('fechaRegistro', 'Fecha de registro', 'fecha', { obligatorio: true }),
      campo('foto', 'Fotografía', 'imagen'),
    ],
    columnas: [
      ['nombreCompleto', 'Nombre completo'],
      ['rfc', 'RFC'],
      ['domicilio', 'Domicilio'],
      ['telefono', 'Teléfono'],
      ['correo', 'Correo'],
      ['fechaRegistro', 'Fecha de registro'],
    ],
  },
}

export function puedeAdministrar(area, catalogo, accion) {
  if (area === 'central') return true
  if (catalogo === 'clientes') return true
  return catalogo === 'empleados' && accion === 'editar'
}

export function fechaDeHoy() {
  const hoy = new Date()
  const mes = String(hoy.getMonth() + 1).padStart(2, '0')
  const dia = String(hoy.getDate()).padStart(2, '0')
  return `${hoy.getFullYear()}-${mes}-${dia}`
}

export function nombreCompleto(persona) {
  return [persona.nombre, persona.apellidoPaterno, persona.apellidoMaterno].filter(Boolean).join(' ')
}
