import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { abrirBaseDeDatos } from '../servidor/baseDeDatos.js'
import { crearAplicacion } from '../servidor/aplicacion.js'

const carpetaTemporal = mkdtempSync(join(tmpdir(), 'sicefa-api-'))
const rutaDeLaBase = join(carpetaTemporal, 'pruebas.sqlite')

let baseDeDatos, servidor, direccion
let sesionCentral, sesionSucursal

async function encender() {
  baseDeDatos = abrirBaseDeDatos(rutaDeLaBase)
  await new Promise(listo => {
    servidor = crearAplicacion(baseDeDatos).listen(0, '127.0.0.1', listo)
  })
  direccion = `http://127.0.0.1:${servidor.address().port}/api`
}

async function apagar() {
  await new Promise(listo => servidor.close(listo))
  baseDeDatos.close()
}

async function pedir(ruta, { metodo = 'GET', cuerpo, sesion } = {}) {
  const encabezados = {}
  if (sesion) encabezados.Cookie = sesion
  if (cuerpo) encabezados['Content-Type'] = 'application/json'

  const respuesta = await fetch(direccion + ruta, {
    method: metodo,
    headers: encabezados,
    body: typeof cuerpo === 'string' ? cuerpo : cuerpo && JSON.stringify(cuerpo),
  })
  const cookie = respuesta.headers.get('set-cookie')

  return { estado: respuesta.status, datos: await respuesta.json(), cookie: cookie && cookie.split(';')[0] }
}

function entrar(area, usuario = 'AG20230901', contrasena = usuario) {
  return pedir('/sesion/entrar', { metodo: 'POST', cuerpo: { usuario, contrasena, area } })
}

const productoNuevo = { nombre: 'Producto de prueba', nombreGenerico: 'Genérico de prueba', precioUnitario: '19.999' }

before(async () => {
  await encender()
  sesionCentral = (await entrar('central')).cookie
  sesionSucursal = (await entrar('sucursal')).cookie
})

after(async () => {
  await apagar()
  rmSync(carpetaTemporal, { recursive: true, force: true })
})

test('una base nueva se llena con los datos iniciales y las contraseñas quedan cifradas', () => {
  const contar = tabla => baseDeDatos.prepare(`SELECT COUNT(*) AS total FROM ${tabla}`).get().total
  assert.equal(contar('productos'), 48)
  assert.equal(contar('clientes'), 6)
  assert.equal(contar('empleados'), 4)
  assert.equal(contar('sucursales'), 1)
  assert.equal(contar('usuarios'), 4)

  const usuario = baseDeDatos.prepare('SELECT * FROM usuarios LIMIT 1').get()
  assert.match(usuario.contrasena, /^[a-f0-9]{32}:[a-f0-9]{128}$/)

  const sinFoto = baseDeDatos.prepare("SELECT COUNT(*) AS total FROM productos WHERE foto IS NULL OR foto = ''").get().total
  assert.equal(sinFoto, 0)
})

test('sin sesión, con contraseña equivocada o en un área sin permiso no se puede entrar', async () => {
  assert.equal((await pedir('/estado')).estado, 200)
  assert.equal((await pedir('/productos')).estado, 401)
  assert.equal((await pedir('/sesion/usuario')).estado, 401)
  assert.equal((await pedir('/productos', { sesion: 'sicefa_sesion=inventada' })).estado, 401)

  assert.equal((await entrar('central', 'AG20230901', 'incorrecta')).estado, 401)
  assert.equal((await entrar('central', 'noexiste')).estado, 401)
  assert.equal((await entrar('central', 'MZ20230901')).estado, 401)
  assert.equal((await entrar('sucursal', 'MZ20230901')).estado, 200)
  assert.equal((await entrar('almacen')).estado, 400)
  assert.equal((await pedir('/sesion/entrar', { metodo: 'POST', cuerpo: '{mal json' })).estado, 400)
})

test('la sesión viaja en una cookie HttpOnly y el perfil no incluye la contraseña', async () => {
  const respuesta = await fetch(`${direccion}/sesion/entrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario: 'DP20230901', contrasena: 'DP20230901', area: 'central' }),
  })
  const cookie = respuesta.headers.get('set-cookie')
  assert.match(cookie, /HttpOnly/)
  assert.match(cookie, /SameSite=Strict/)

  const perfil = await pedir('/sesion/usuario', { sesion: cookie.split(';')[0] })
  assert.deepEqual(perfil.datos.usuario, {
    id: 2, usuario: 'DP20230901', nombre: 'Diego Perez', area: 'central', idSucursal: 1, nombreSucursal: 'Oxxo SA.DE.CV',
  })
})

test('agregar, consultar, editar, dar de baja y reactivar un producto', async () => {
  const agregado = await pedir('/productos', { metodo: 'POST', cuerpo: productoNuevo, sesion: sesionCentral })
  assert.equal(agregado.estado, 201)
  assert.equal(agregado.datos.precioUnitario, 20)
  assert.equal(agregado.datos.estatus, 1)
  const id = agregado.datos.id

  const editado = await pedir(`/productos/${id}`, { metodo: 'PUT', cuerpo: { ...productoNuevo, precioUnitario: 35.75, foto: '/img/medicamentos/naproxeno.jpg' }, sesion: sesionCentral })
  assert.equal(editado.estado, 200)
  assert.equal(editado.datos.precioUnitario, 35.75)
  assert.equal((await pedir(`/productos/${id}`, { sesion: sesionCentral })).datos.foto, '/img/medicamentos/naproxeno.jpg')

  assert.equal((await pedir(`/productos/${id}`, { metodo: 'DELETE', sesion: sesionCentral })).datos.estatus, 0)
  const activos = (await pedir('/productos', { sesion: sesionCentral })).datos
  const todos = (await pedir('/productos?estatus=todos', { sesion: sesionCentral })).datos
  assert.equal(activos.some(producto => producto.id === id), false)
  assert.equal(todos.some(producto => producto.id === id), true)

  assert.equal((await pedir(`/productos/${id}/reactivar`, { metodo: 'PATCH', sesion: sesionCentral })).datos.estatus, 1)
  assert.equal((await pedir('/productos/999999', { sesion: sesionCentral })).estado, 404)
  assert.equal((await pedir('/medicinas', { sesion: sesionCentral })).estado, 404)
})

test('los formularios se validan campo por campo', async () => {
  const revisar = async (catalogo, cuerpo) => (await pedir(`/${catalogo}`, { metodo: 'POST', cuerpo, sesion: sesionCentral }))

  const vacio = await revisar('productos', { nombre: '  ' })
  assert.equal(vacio.estado, 400)
  assert.deepEqual(Object.keys(vacio.datos.campos).sort(), ['nombre', 'nombreGenerico', 'precioUnitario'])

  assert.ok((await revisar('productos', { ...productoNuevo, precioUnitario: -1 })).datos.campos.precioUnitario)
  assert.ok((await revisar('productos', { ...productoNuevo, precioUnitario: 'caro' })).datos.campos.precioUnitario)
  assert.ok((await revisar('productos', { ...productoNuevo, unidadesEnEnvase: 2.5 })).datos.campos.unidadesEnEnvase)
  assert.ok((await revisar('productos', { ...productoNuevo, foto: 'https://otro.sitio/foto.png' })).datos.campos.foto)
  assert.ok((await revisar('productos', { ...productoNuevo, nombre: 'x'.repeat(251) })).datos.campos.nombre)

  const cliente = { nombre: 'Ana', apellidoPaterno: 'Ruiz', fechaRegistro: '2026-10-13' }
  assert.ok((await revisar('clientes', { ...cliente, correo: 'sin-arroba' })).datos.campos.correo)
  assert.ok((await revisar('clientes', { ...cliente, fechaRegistro: '2026-02-31' })).datos.campos.fechaRegistro)
  assert.ok((await revisar('clientes', { ...cliente, genero: 'Otra cosa' })).datos.campos.genero)
  assert.ok((await revisar('sucursales', { nombre: 'Norte', telefono: '1', calle: 'A', ciudad: 'León', estado: 'Gto', latitud: 120 })).datos.campos.latitud)
  assert.equal((await revisar('clientes', cliente)).estado, 201)

  const empleado = { nombre: 'Luis', apellidoPaterno: 'Mora', clave: 'AG20230901' }
  assert.equal((await revisar('empleados', empleado)).estado, 409)
})

test('la sucursal solo puede lo que le toca', async () => {
  const comoSucursal = (ruta, metodo, cuerpo) => pedir(ruta, { metodo, cuerpo, sesion: sesionSucursal })

  assert.equal((await comoSucursal('/productos')).estado, 200)
  assert.equal((await comoSucursal('/productos', 'POST', productoNuevo)).estado, 403)
  assert.equal((await comoSucursal('/productos/1', 'PUT', productoNuevo)).estado, 403)
  assert.equal((await comoSucursal('/productos/1', 'DELETE')).estado, 403)

  assert.equal((await comoSucursal('/sucursales')).estado, 403)

  const empleado = (await comoSucursal('/empleados/3')).datos
  assert.equal((await comoSucursal('/empleados/3', 'PUT', { ...empleado, puesto: 'Cajero' })).datos.puesto, 'Cajero')
  assert.equal((await comoSucursal('/empleados', 'POST', empleado)).estado, 403)
  assert.equal((await comoSucursal('/empleados/3', 'DELETE')).estado, 403)

  const cliente = await comoSucursal('/clientes', 'POST', { nombre: 'Eva', apellidoPaterno: 'Luna', fechaRegistro: '2026-10-13' })
  assert.equal(cliente.estado, 201)
  assert.equal((await comoSucursal(`/clientes/${cliente.datos.id}`, 'DELETE')).datos.estatus, 0)

  assert.equal((await pedir('/compras', { sesion: sesionCentral })).estado, 403)
  assert.equal((await pedir('/sucursales/1', { metodo: 'DELETE', sesion: sesionCentral })).estado, 409)
})

test('las ventas calculan el total en el servidor y conservan el precio aunque el producto cambie', async () => {
  const venta = await pedir('/ventas', { metodo: 'POST', cuerpo: { idProducto: 1, idCliente: 1, cantidad: 2, precio: 1 }, sesion: sesionSucursal })
  assert.equal(venta.estado, 201)
  assert.equal(venta.datos.precio, 466.9)
  assert.equal(venta.datos.total, 933.8)
  assert.equal(venta.datos.estado, 'Registrada')
  assert.equal(venta.datos.nombreProducto, 'Donepezilo')
  assert.equal(venta.datos.nombreCliente, 'Juan Alberto Juarez')
  assert.equal(venta.datos.nombreEmpleado, 'Alvaro Gomez')

  const producto = (await pedir('/productos/1', { sesion: sesionCentral })).datos
  await pedir('/productos/1', { metodo: 'PUT', cuerpo: { ...producto, precioUnitario: 500 }, sesion: sesionCentral })
  const ventas = (await pedir('/ventas', { sesion: sesionSucursal })).datos
  assert.equal(ventas.find(fila => fila.id === venta.datos.id).total, 933.8)
  await pedir('/productos/1', { metodo: 'PUT', cuerpo: producto, sesion: sesionCentral })

  const cancelar = () => pedir(`/ventas/${venta.datos.id}`, { metodo: 'PATCH', cuerpo: { estado: 'Cancelada' }, sesion: sesionSucursal })
  assert.equal((await cancelar()).datos.estado, 'Cancelada')
  assert.equal((await cancelar()).estado, 409)
})

test('las compras se reciben o cancelan, y se rechazan datos inválidos o productos inactivos', async () => {
  const comprar = cuerpo => pedir('/compras', { metodo: 'POST', cuerpo, sesion: sesionSucursal })

  const compra = await comprar({ idProducto: 2, cantidad: 3 })
  assert.equal(compra.estado, 201)
  assert.equal(compra.datos.estado, 'Pendiente')

  const cambiar = estado => pedir(`/compras/${compra.datos.id}`, { metodo: 'PATCH', cuerpo: { estado }, sesion: sesionSucursal })
  assert.equal((await cambiar('Perdido')).estado, 400)
  assert.equal((await cambiar('Recibido')).datos.estado, 'Recibido')
  assert.equal((await cambiar('Cancelado')).estado, 409)

  assert.equal((await comprar({ idProducto: 2, cantidad: 0 })).estado, 400)
  assert.equal((await comprar({ idProducto: 2, cantidad: 1.5 })).estado, 400)
  assert.equal((await comprar({ idProducto: '2', cantidad: 1 })).estado, 400)
  assert.equal((await comprar({ idProducto: 999999, cantidad: 1 })).estado, 404)

  await pedir('/productos/3', { metodo: 'DELETE', sesion: sesionCentral })
  assert.equal((await comprar({ idProducto: 3, cantidad: 1 })).estado, 400)
  await pedir('/productos/3/reactivar', { metodo: 'PATCH', sesion: sesionCentral })

  assert.equal((await pedir('/ventas', { metodo: 'POST', cuerpo: { idProducto: 2, cantidad: 1 }, sesion: sesionSucursal })).estado, 400)
})

test('una búsqueda con comillas no rompe la base de datos', async () => {
  const peligroso = { ...productoNuevo, nombre: "Robert'); DROP TABLE productos;--" }
  const agregado = await pedir('/productos', { metodo: 'POST', cuerpo: peligroso, sesion: sesionCentral })
  assert.equal(agregado.datos.nombre, peligroso.nombre)
  assert.equal((await pedir("/productos/1 OR 1=1", { sesion: sesionCentral })).estado, 404)
  assert.ok((await pedir('/productos', { sesion: sesionCentral })).datos.length >= 48)
})

test('los datos y la sesión se conservan al reiniciar el servidor, sin duplicar los iniciales', async () => {
  const antes = (await pedir('/productos?estatus=todos', { sesion: sesionCentral })).datos.length

  await apagar()
  await encender()

  assert.equal((await pedir('/sesion/usuario', { sesion: sesionCentral })).estado, 200)
  assert.equal((await pedir('/productos?estatus=todos', { sesion: sesionCentral })).datos.length, antes)
  assert.equal(baseDeDatos.prepare('SELECT COUNT(*) AS total FROM usuarios').get().total, 4)
})

test('al salir o al vencer la sesión se pierde el acceso', async () => {
  const sesion = (await entrar('central', 'DP20230901')).cookie
  assert.equal((await pedir('/resumen', { sesion })).estado, 200)
  assert.equal((await pedir('/sesion/salir', { metodo: 'POST', sesion })).estado, 200)
  assert.equal((await pedir('/resumen', { sesion })).estado, 401)

  baseDeDatos.prepare('UPDATE sesiones SET expira = 1').run()
  assert.equal((await pedir('/resumen', { sesion: sesionCentral })).estado, 401)
})
