import { spawn } from 'node:child_process'

const procesos = [
  spawn(process.execPath, ['--watch', 'servidor/index.js'], { stdio: 'inherit' }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js'], { stdio: 'inherit' }),
]

function detenerTodo() {
  for (const proceso of procesos) proceso.kill('SIGTERM')
}

for (const proceso of procesos) proceso.on('exit', detenerTodo)
process.on('SIGINT', detenerTodo)
process.on('SIGTERM', detenerTodo)
