import * as THREE from 'three'
import type { ConfigPlaneta } from './tipos'

/* ------------------------------------------------------------------ *
 *  Texturas procedurales generadas en canvas: no requieren archivos.
 * ------------------------------------------------------------------ */

function hash(ix: number, iy: number, semilla: number) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(semilla, 1442695041)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967295
}

/** Ruido de valor periódico en X (la textura es continua al dar la vuelta a la esfera). */
function ruido(x: number, y: number, periodoX: number, semilla: number) {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const fx = x - x0
  const fy = y - y0
  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)
  const xa = ((x0 % periodoX) + periodoX) % periodoX
  const xb = (xa + 1) % periodoX
  const a = hash(xa, y0, semilla)
  const b = hash(xb, y0, semilla)
  const c = hash(xa, y0 + 1, semilla)
  const d = hash(xb, y0 + 1, semilla)
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy
}

function fbm(x: number, y: number, periodoX: number, semilla: number, octavas = 5) {
  let amp = 0.5
  let frec = 1
  let suma = 0
  let norma = 0
  for (let i = 0; i < octavas; i++) {
    suma += amp * ruido(x * frec, y * frec, periodoX * frec, semilla + i * 17)
    norma += amp
    frec *= 2
    amp *= 0.5
  }
  return suma / norma
}

type RGB = [number, number, number]

function hexARgb(hex: string): RGB {
  const c = new THREE.Color(hex)
  return [c.r * 255, c.g * 255, c.b * 255]
}

function rampa(colores: RGB[], t: number): RGB {
  const v = Math.min(0.9999, Math.max(0, t)) * (colores.length - 1)
  const i = Math.floor(v)
  const f = v - i
  const a = colores[i]
  const b = colores[i + 1]
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f]
}

const suave = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function lienzo(ancho: number, alto: number) {
  const canvas = document.createElement('canvas')
  canvas.width = ancho
  canvas.height = alto
  const ctx = canvas.getContext('2d')!
  return { canvas, ctx }
}

function aTextura(canvas: HTMLCanvasElement, repetirX = false) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  if (repetirX) tex.wrapS = THREE.RepeatWrapping
  return tex
}

/** Superficie del planeta (océanos, continentes o bandas gaseosas). */
export function texturaPlaneta(config: ConfigPlaneta, semilla: number) {
  const W = 640
  const H = 320
  const { canvas, ctx } = lienzo(W, H)
  const img = ctx.createImageData(W, H)
  const colores = config.colores.map(hexARgb)
  const nuevoColor = colores[3]
  const P = 6

  for (let y = 0; y < H; y++) {
    const v = y / H
    const lat = Math.abs(v - 0.5) * 2
    for (let x = 0; x < W; x++) {
      const nx = (x / W) * P
      const ny = v * (P / 2)
      let t: number
      if (config.estilo === 'gaseoso') {
        const deformacion = fbm(nx * 0.9, ny * 1.6, P, semilla, 4) * 5.5
        const bandas = Math.sin(v * Math.PI * 2 * 6.5 + deformacion) * 0.5 + 0.5
        const fino = fbm(nx * 2.4, ny * 9, P * 2, semilla + 90, 3)
        t = bandas * 0.72 + fino * 0.42
      } else {
        const n = fbm(nx, ny, P, semilla, 5)
        t = suave(0.3, 0.72, n) * 0.95 + (config.estilo === 'oceano' ? 0 : 0.03)
        // Océanos profundos: la mayor parte del planeta es la parte oscura de la rampa.
        if (config.estilo === 'oceano') t = 0.22 + t * 0.78
      }
      let [r, g, b] = rampa(colores, t)
      if (config.estilo !== 'gaseoso') {
        // Casquetes polares
        const hielo = suave(0.84, 0.97, lat + (ruido(nx * 3, ny * 3, P * 3, semilla + 7) - 0.5) * 0.18)
        r += (nuevoColor[0] - r) * hielo
        g += (nuevoColor[1] - g) * hielo
        b += (nuevoColor[2] - b) * hielo
      }
      const k = (y * W + x) * 4
      img.data[k] = r
      img.data[k + 1] = g
      img.data[k + 2] = b
      img.data[k + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return aTextura(canvas, true)
}

/** Capa de nubes (blanco con alfa variable). */
export function texturaNubes(semilla: number) {
  const W = 512
  const H = 256
  const { canvas, ctx } = lienzo(W, H)
  const img = ctx.createImageData(W, H)
  const P = 5
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const n = fbm((x / W) * P, (y / H) * (P / 2), P, semilla + 301, 5)
      const a = suave(0.5, 0.78, n)
      const k = (y * W + x) * 4
      img.data[k] = 255
      img.data[k + 1] = 255
      img.data[k + 2] = 255
      img.data[k + 3] = a * 215
    }
  }
  ctx.putImageData(img, 0, 0)
  return aTextura(canvas, true)
}

/** Superficie granulada del sol. */
export function texturaSol() {
  const W = 512
  const H = 256
  const { canvas, ctx } = lienzo(W, H)
  const img = ctx.createImageData(W, H)
  const colores = ['#c2410c', '#f97316', '#fbbf24', '#fff4b8'].map(hexARgb)
  const P = 8
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const n = fbm((x / W) * P, (y / H) * (P / 2), P, 5, 5)
      const [r, g, b] = rampa(colores, suave(0.25, 0.8, n))
      const k = (y * W + x) * 4
      img.data[k] = r
      img.data[k + 1] = g
      img.data[k + 2] = b
      img.data[k + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return aTextura(canvas, true)
}

/** Anillos con bandas radiales (la coordenada U recorre el radio). */
export function texturaAnillo(color: string) {
  const W = 512
  const { canvas, ctx } = lienzo(W, 4)
  const base = new THREE.Color(color)
  const claro = base.clone().lerp(new THREE.Color('#ffffff'), 0.55)
  const img = ctx.createImageData(W, 4)
  for (let x = 0; x < W; x++) {
    const u = x / W
    const banda = fbm(u * 26, 0.5, 1000, 11, 4)
    const huecos = suave(0.34, 0.4, banda) * (1 - suave(0.62, 0.7, banda) * 0.7)
    const borde = suave(0, 0.06, u) * (1 - suave(0.92, 1, u))
    const mezcla = new THREE.Color().lerpColors(base, claro, banda)
    for (let y = 0; y < 4; y++) {
      const k = (y * W + x) * 4
      img.data[k] = mezcla.r * 255
      img.data[k + 1] = mezcla.g * 255
      img.data[k + 2] = mezcla.b * 255
      img.data[k + 3] = Math.min(1, (0.25 + huecos * 0.75) * borde) * 235
    }
  }
  ctx.putImageData(img, 0, 0)
  return aTextura(canvas)
}

/** Resplandor radial suave para sprites aditivos. */
export function texturaResplandor(color: string, intensidad = 1) {
  const S = 256
  const { canvas, ctx } = lienzo(S, S)
  const c = new THREE.Color(color)
  const rgb = `${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)}`
  const grad = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
  grad.addColorStop(0, `rgba(${rgb},${intensidad})`)
  grad.addColorStop(0.25, `rgba(${rgb},${0.45 * intensidad})`)
  grad.addColorStop(0.6, `rgba(${rgb},${0.12 * intensidad})`)
  grad.addColorStop(1, `rgba(${rgb},0)`)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, S, S)
  return aTextura(canvas)
}

/** Nube de gas (nebulosa) con ruido y caída radial. */
export function texturaNebulosa(color: string, semilla: number) {
  const S = 256
  const { canvas, ctx } = lienzo(S, S)
  const img = ctx.createImageData(S, S)
  const c = new THREE.Color(color)
  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const dx = (x / S - 0.5) * 2
      const dy = (y / S - 0.5) * 2
      const d = Math.sqrt(dx * dx + dy * dy)
      const caida = Math.pow(Math.max(0, 1 - d), 1.6)
      const n = fbm((x / S) * 4, (y / S) * 4, 4096, semilla, 5)
      const a = caida * suave(0.28, 0.85, n)
      const k = (y * S + x) * 4
      img.data[k] = c.r * 255
      img.data[k + 1] = c.g * 255
      img.data[k + 2] = c.b * 255
      img.data[k + 3] = a * 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return aTextura(canvas)
}

/** Símbolo matemático brillante (+, −, ×, ÷, =, números…) para sprites flotantes. */
export function texturaSimbolo(texto: string, color: string) {
  const S = 128
  const { canvas, ctx } = lienzo(S, S)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = "800 84px Orbitron, 'Nunito', sans-serif"
  ctx.shadowColor = color
  ctx.shadowBlur = 22
  ctx.fillStyle = color
  ctx.fillText(texto, S / 2, S / 2 + 4)
  ctx.shadowBlur = 8
  ctx.fillStyle = '#ffffff'
  ctx.fillText(texto, S / 2, S / 2 + 4)
  return aTextura(canvas)
}
