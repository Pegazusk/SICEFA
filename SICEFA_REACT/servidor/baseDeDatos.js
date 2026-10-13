import { DatabaseSync } from 'node:sqlite'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { catalogos } from '../compartido/catalogos.js'
import { cifrarContrasena } from './contrasenas.js'

const carpetaDeDatos = join(dirname(fileURLToPath(import.meta.url)), 'datos')

export function abrirBaseDeDatos(ruta = process.env.RUTA_BD || join(carpetaDeDatos, 'sicefa.sqlite')) {
  mkdirSync(dirname(ruta), { recursive: true })

  const baseDeDatos = new DatabaseSync(ruta)
  baseDeDatos.exec('PRAGMA foreign_keys = ON')

  crearTablas(baseDeDatos)

  const totalDeUsuarios = baseDeDatos.prepare('SELECT COUNT(*) AS total FROM usuarios').get().total
  if (totalDeUsuarios === 0) {
    cargarDatosIniciales(baseDeDatos)
  }

  return baseDeDatos
}

function crearTablas(baseDeDatos) {
  for (const [tabla, catalogo] of Object.entries(catalogos)) {
    const columnas = catalogo.campos.map(campo => {
      const tipo = campo.tipo === 'numero' ? 'REAL' : 'TEXT'
      const obligatorio = campo.obligatorio ? 'NOT NULL' : ''
      return `${campo.clave} ${tipo} ${obligatorio}`
    })

    baseDeDatos.exec(`
      CREATE TABLE IF NOT EXISTS ${tabla} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ${columnas.join(', ')},
        estatus INTEGER NOT NULL DEFAULT 1,
        fechaCreacion TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)
  }

  baseDeDatos.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS clave_de_empleado ON empleados(clave);

    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario TEXT NOT NULL UNIQUE,
      contrasena TEXT NOT NULL,
      nombre TEXT NOT NULL,
      esCentral INTEGER NOT NULL DEFAULT 0,
      idSucursal INTEGER NOT NULL REFERENCES sucursales(id)
    );

    CREATE TABLE IF NOT EXISTS sesiones (
      token TEXT PRIMARY KEY,
      idUsuario INTEGER NOT NULL REFERENCES usuarios(id),
      area TEXT NOT NULL,
      expira INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS compras (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idProducto INTEGER NOT NULL REFERENCES productos(id),
      cantidad INTEGER NOT NULL,
      precio REAL NOT NULL,
      idSucursal INTEGER NOT NULL REFERENCES sucursales(id),
      idUsuario INTEGER NOT NULL REFERENCES usuarios(id),
      estado TEXT NOT NULL DEFAULT 'Pendiente',
      fecha TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ventas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      idProducto INTEGER NOT NULL REFERENCES productos(id),
      idCliente INTEGER NOT NULL REFERENCES clientes(id),
      cantidad INTEGER NOT NULL,
      precio REAL NOT NULL,
      total REAL NOT NULL,
      idSucursal INTEGER NOT NULL REFERENCES sucursales(id),
      idUsuario INTEGER NOT NULL REFERENCES usuarios(id),
      estado TEXT NOT NULL DEFAULT 'Registrada',
      fecha TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)
}

function leerDatos(nombre) {
  return JSON.parse(readFileSync(join(carpetaDeDatos, `${nombre}.json`), 'utf8'))
}

function cargarDatosIniciales(baseDeDatos) {
  for (const tabla of ['sucursales', 'productos', 'empleados', 'clientes']) {
    for (const registro of leerDatos(tabla)) {
      insertar(baseDeDatos, tabla, registro)
    }
  }

  for (const usuario of leerDatos('usuarios')) {
    insertar(baseDeDatos, 'usuarios', { ...usuario, contrasena: cifrarContrasena(usuario.usuario) })
  }
}

export function insertar(baseDeDatos, tabla, datos) {
  const columnas = Object.keys(datos)
  const signos = columnas.map(() => '?')
  const sql = `INSERT INTO ${tabla} (${columnas.join(', ')}) VALUES (${signos.join(', ')})`

  const resultado = baseDeDatos.prepare(sql).run(...Object.values(datos))
  return Number(resultado.lastInsertRowid)
}

export function actualizar(baseDeDatos, tabla, id, datos) {
  const cambios = Object.keys(datos).map(columna => `${columna} = ?`)
  const sql = `UPDATE ${tabla} SET ${cambios.join(', ')} WHERE id = ?`

  baseDeDatos.prepare(sql).run(...Object.values(datos), id)
}

export function buscarPorId(baseDeDatos, tabla, id) {
  return baseDeDatos.prepare(`SELECT * FROM ${tabla} WHERE id = ?`).get(id)
}
