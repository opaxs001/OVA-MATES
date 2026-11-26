import * as THREE from 'three'
import { crearAleatorio } from './config'
import { texturaNebulosa, texturaResplandor, texturaSimbolo } from './texturas'

/* ------------------------------------------------------------------ *
 *  Fondo del entorno: estrellas, galaxia espiral, nebulosas y símbolos.
 * ------------------------------------------------------------------ */

const VERTICE_PUNTOS = /* glsl */ `
  attribute float aTam;
  attribute float aFase;
  attribute vec3 aColor;
  uniform float uTiempo;
  uniform float uPixeles;
  uniform float uEscala;
  uniform float uMaxTam;
  varying vec3 vColor;
  varying float vBrillo;
  void main() {
    vColor = aColor;
    vBrillo = 0.72 + 0.28 * sin(uTiempo * 1.5 + aFase * 6.2831);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = min(aTam * uPixeles * uEscala / max(0.1, -mv.z), uMaxTam * uPixeles);
    gl_Position = projectionMatrix * mv;
  }
`

const FRAGMENTO_PUNTOS = /* glsl */ `
  uniform float uOpacidad;
  varying vec3 vColor;
  varying float vBrillo;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = pow(smoothstep(0.5, 0.0, d), 1.7);
    gl_FragColor = vec4(vColor * (0.8 + a * 0.6), a * vBrillo * uOpacidad);
  }
`

export interface MaterialPuntos extends THREE.ShaderMaterial {
  uniforms: {
    uTiempo: { value: number }
    uPixeles: { value: number }
    uEscala: { value: number }
    uMaxTam: { value: number }
    uOpacidad: { value: number }
  }
}

function materialPuntos(escala: number, maxTam: number, opacidad: number): MaterialPuntos {
  return new THREE.ShaderMaterial({
    vertexShader: VERTICE_PUNTOS,
    fragmentShader: FRAGMENTO_PUNTOS,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTiempo: { value: 0 },
      uPixeles: { value: 1 },
      uEscala: { value: escala },
      uMaxTam: { value: maxTam },
      uOpacidad: { value: opacidad }
    }
  }) as MaterialPuntos
}

function geometriaPuntos(pos: Float32Array, col: Float32Array, tam: Float32Array, fase: Float32Array) {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
  g.setAttribute('aTam', new THREE.BufferAttribute(tam, 1))
  g.setAttribute('aFase', new THREE.BufferAttribute(fase, 1))
  return g
}

/** Esfera lejana de estrellas parpadeantes. */
export function crearCampoEstrellas(cantidad: number) {
  const rnd = crearAleatorio(2024)
  const pos = new Float32Array(cantidad * 3)
  const col = new Float32Array(cantidad * 3)
  const tam = new Float32Array(cantidad)
  const fase = new Float32Array(cantidad)
  const tonos = ['#ffffff', '#cfe0ff', '#ffe9c9', '#bde9ff', '#e5d5ff'].map(c => new THREE.Color(c))
  for (let i = 0; i < cantidad; i++) {
    const u = rnd() * 2 - 1
    const t = rnd() * Math.PI * 2
    const s = Math.sqrt(1 - u * u)
    const r = 180 + rnd() * 140
    pos.set([s * Math.cos(t) * r, u * r, s * Math.sin(t) * r], i * 3)
    const c = tonos[Math.floor(rnd() * tonos.length)]
    col.set([c.r, c.g, c.b], i * 3)
    tam[i] = 1.4 + Math.pow(rnd(), 4) * 5
    fase[i] = rnd()
  }
  const material = materialPuntos(260, 7, 0.9)
  const puntos = new THREE.Points(geometriaPuntos(pos, col, tam, fase), material)
  puntos.frustumCulled = false
  return { objeto: puntos, material }
}

/** Galaxia espiral de varios brazos con bulbo central cálido. */
export function crearGalaxiaEspiral(cantidad: number) {
  const rnd = crearAleatorio(7)
  const gauss = () => (rnd() + rnd() + rnd() + rnd() - 2) / 2
  const brazos = 4
  const bulbo = Math.floor(cantidad * 0.05)
  const total = cantidad + bulbo
  const pos = new Float32Array(total * 3)
  const col = new Float32Array(total * 3)
  const tam = new Float32Array(total)
  const fase = new Float32Array(total)

  const interior = new THREE.Color('#ffcf9a')
  const medio = new THREE.Color('#d98bff')
  const exterior = new THREE.Color('#5f8cff')
  const tmp = new THREE.Color()
  const R_MIN = 15
  const R_MAX = 88

  for (let i = 0; i < cantidad; i++) {
    const f = Math.pow(rnd(), 1.35)
    const r = R_MIN + f * (R_MAX - R_MIN)
    const brazo = i % brazos
    const ang = (brazo / brazos) * Math.PI * 2 + r * 0.115
    const dispersion = (0.25 + (r / R_MAX) * 0.9) * (0.5 + rnd() * 0.9)
    const dx = gauss() * dispersion * 3.2
    const dz = gauss() * dispersion * 3.2
    const y = gauss() * (1.6 - (r / R_MAX) * 0.9) * 0.8
    pos.set([Math.cos(ang) * r + dx, y, Math.sin(ang) * r + dz], i * 3)
    const k = r / R_MAX
    if (k < 0.5) tmp.copy(interior).lerp(medio, k * 2)
    else tmp.copy(medio).lerp(exterior, (k - 0.5) * 2)
    // Algunas estrellas blancas más brillantes
    if (rnd() < 0.08) tmp.set('#ffffff')
    col.set([tmp.r, tmp.g, tmp.b], i * 3)
    tam[i] = 0.35 + Math.pow(rnd(), 3) * 1.1
    fase[i] = rnd()
  }

  for (let j = 0; j < bulbo; j++) {
    const i = cantidad + j
    const r = Math.pow(rnd(), 1.8) * 9
    const t = rnd() * Math.PI * 2
    pos.set([Math.cos(t) * r, gauss() * 1.4 * (1 - r / 12), Math.sin(t) * r], i * 3)
    tmp.copy(interior).lerp(new THREE.Color('#ff9ed0'), rnd() * 0.5)
    col.set([tmp.r, tmp.g, tmp.b], i * 3)
    tam[i] = 0.3 + rnd() * 0.5
    fase[i] = rnd()
  }

  const material = materialPuntos(200, 9, 0.5)
  const puntos = new THREE.Points(geometriaPuntos(pos, col, tam, fase), material)
  puntos.frustumCulled = false
  return { objeto: puntos, material }
}

/** Grandes nubes de gas detrás de la escena. */
export function crearNebulosas() {
  const grupo = new THREE.Group()
  const definiciones = [
    { color: '#6a4dff', pos: [-70, 18, -110], escala: 120, opacidad: 0.5, semilla: 3 },
    { color: '#10b6e8', pos: [95, -22, -85], escala: 105, opacidad: 0.38, semilla: 9 },
    { color: '#c040d8', pos: [20, 40, -150], escala: 140, opacidad: 0.3, semilla: 15 },
    { color: '#3b6bff', pos: [-100, -35, 40], escala: 100, opacidad: 0.28, semilla: 21 },
    { color: '#ff6aa8', pos: [90, 30, 60], escala: 85, opacidad: 0.2, semilla: 27 }
  ]
  for (const d of definiciones) {
    const material = new THREE.SpriteMaterial({
      map: texturaNebulosa(d.color, d.semilla),
      transparent: true,
      opacity: d.opacidad,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
    const sprite = new THREE.Sprite(material)
    sprite.position.set(d.pos[0], d.pos[1], d.pos[2])
    sprite.scale.setScalar(d.escala)
    grupo.add(sprite)
  }
  return grupo
}

export interface SimboloFlotante {
  sprite: THREE.Sprite
  radio: number
  angulo: number
  vel: number
  y: number
  fase: number
  base: number
}

/** Símbolos matemáticos que flotan alrededor de la galaxia. */
export function crearSimbolosFlotantes(cantidad: number, colores: string[]) {
  const rnd = crearAleatorio(99)
  const grupo = new THREE.Group()
  const glifos = ['+', '−', '×', '÷', '=', '1', '2', '3', '5', '7', '9', '?', '✧', '%', '<', '>']
  const cache = new Map<string, THREE.CanvasTexture>()
  const items: SimboloFlotante[] = []
  for (let i = 0; i < cantidad; i++) {
    const glifo = glifos[Math.floor(rnd() * glifos.length)]
    const color = colores[Math.floor(rnd() * colores.length)]
    const clave = glifo + color
    if (!cache.has(clave)) cache.set(clave, texturaSimbolo(glifo, color))
    const material = new THREE.SpriteMaterial({
      map: cache.get(clave),
      transparent: true,
      opacity: 0.35 + rnd() * 0.4,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
    const sprite = new THREE.Sprite(material)
    const base = 0.7 + rnd() * 0.9
    sprite.scale.setScalar(base)
    grupo.add(sprite)
    items.push({
      sprite,
      radio: 7 + rnd() * 26,
      angulo: rnd() * Math.PI * 2,
      vel: (0.012 + rnd() * 0.03) * (rnd() < 0.5 ? 1 : -1),
      y: (rnd() - 0.5) * 12,
      fase: rnd() * Math.PI * 2,
      base
    })
  }
  const actualizar = (dt: number, t: number) => {
    for (const s of items) {
      s.angulo += s.vel * dt
      s.sprite.position.set(
        Math.cos(s.angulo) * s.radio,
        s.y + Math.sin(t * 0.6 + s.fase) * 0.5,
        Math.sin(s.angulo) * s.radio
      )
    }
  }
  actualizar(0, 0)
  return { objeto: grupo, actualizar }
}

export function crearResplandorSol() {
  const grupo = new THREE.Group()
  const capas = [
    { color: '#ffd27a', escala: 9, opacidad: 0.95 },
    { color: '#ff9a4a', escala: 20, opacidad: 0.5 },
    { color: '#a56bff', escala: 46, opacidad: 0.22 }
  ]
  for (const c of capas) {
    const material = new THREE.SpriteMaterial({
      map: texturaResplandor(c.color),
      transparent: true,
      opacity: c.opacidad,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
    const sprite = new THREE.Sprite(material)
    sprite.scale.setScalar(c.escala)
    grupo.add(sprite)
  }
  return grupo
}
