import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

const carpetaTemporal = mkdtempSync(join(tmpdir(), 'sicefa-pruebas-'))

const proceso = spawn(process.execPath, ['scripts/desarrollo.js'], {
  stdio: 'inherit',
  env: { ...process.env, RUTA_BD: join(carpetaTemporal, 'pruebas.sqlite'), PUERTO: '3003', PUERTO_CLIENTE: '5175' },
})

process.on('SIGINT', () => proceso.kill('SIGTERM'))
process.on('SIGTERM', () => proceso.kill('SIGTERM'))
proceso.on('exit', () => rmSync(carpetaTemporal, { recursive: true, force: true }))
