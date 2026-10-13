import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

export function cifrarContrasena(contrasena) {
  const sal = randomBytes(16).toString('hex')
  const cifrada = scryptSync(contrasena, sal, 64).toString('hex')
  return `${sal}:${cifrada}`
}

export function contrasenaCorrecta(contrasena, guardada) {
  const [sal, cifrada] = guardada.split(':')
  return timingSafeEqual(Buffer.from(cifrada, 'hex'), scryptSync(contrasena, sal, 64))
}
