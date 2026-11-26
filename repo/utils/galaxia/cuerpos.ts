import * as THREE from 'three'
import { crearAleatorio } from './config'
import type { ConfigPlaneta } from './tipos'
import { texturaAnillo, texturaNubes, texturaPlaneta, texturaSol } from './texturas'

/* ------------------------------------------------------------------ *
 *  Sol, planetas, órbitas, cinturón de asteroides y satélite.
 * ------------------------------------------------------------------ */

export const RADIO_SOL = 1.9

export function crearSol() {
  const grupo = new THREE.Group()
  const mapa = texturaSol()
  const cuerpo = new THREE.Mesh(
    new THREE.SphereGeometry(RADIO_SOL, 64, 48),
    new THREE.MeshBasicMaterial({ map: mapa })
  )
  grupo.add(cuerpo)

  // Corona: esfera ligeramente mayor con fresnel
  const corona = new THREE.Mesh(
    new THREE.SphereGeometry(RADIO_SOL * 1.12, 48, 32),
    atmosferaMaterial('#ffb457', 1.0, 2.4)
  )
  grupo.add(corona)

  const luz = new THREE.PointLight('#fff1d6', 3.2, 0, 0)
  grupo.add(luz)

  const actualizar = (dt: number) => {
    cuerpo.rotation.y += dt * 0.05
  }
  return { objeto: grupo, actualizar }
}

/** Resplandor fresnel (se ve en el borde de la esfera). */
export function atmosferaMaterial(color: string, intensidad = 1, potencia = 3) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uIntensidad: { value: intensidad },
      uPotencia: { value: potencia }
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uIntensidad;
      uniform float uPotencia;
      varying vec3 vNormal;
      void main() {
        float f = pow(max(0.0, 0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0))), uPotencia);
        gl_FragColor = vec4(uColor, 1.0) * f * uIntensidad * 1.15;
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false
  })
}

export interface Planeta {
  id: string
  config: ConfigPlaneta
  radio: number
  /** Grupo con la inclinación del plano orbital. */
  grupoOrbita: THREE.Group
  /** Punto que recorre la órbita. */
  anclaje: THREE.Group
  /** Cuerpo + atmósfera + anillo (se escala al resaltar). */
  pivote: THREE.Group
  cuerpo: THREE.Mesh
  /** Esfera invisible, más grande, usada para el raycast. */
  pick: THREE.Mesh
  atmosfera: THREE.Mesh
  angulo: number
  resalte: number
  actualizar: (dt: number, t: number, velocidad: number) => void
  posicionMundo: (destino: THREE.Vector3) => THREE.Vector3
}

export async function crearPlaneta(id: string, config: ConfigPlaneta, indice: number): Promise<Planeta> {
  const semilla = 11 + indice * 37
  const grupoOrbita = new THREE.Group()
  grupoOrbita.rotation.set(config.inclinacion[0], 0, config.inclinacion[1])

  const anclaje = new THREE.Group()
  grupoOrbita.add(anclaje)

  const pivote = new THREE.Group()
  pivote.rotation.z = config.inclinacionAxial
  anclaje.add(pivote)

  const cuerpo = new THREE.Mesh(
    new THREE.SphereGeometry(config.radio, 64, 48),
    new THREE.MeshStandardMaterial({
      map: texturaPlaneta(config, semilla),
      roughness: config.estilo === 'gaseoso' ? 0.7 : 0.82,
      metalness: 0
    })
  )
  pivote.add(cuerpo)

  let nubes: THREE.Mesh | undefined
  if (config.nubes) {
    await new Promise(r => setTimeout(r))
    nubes = new THREE.Mesh(
      new THREE.SphereGeometry(config.radio * 1.015, 48, 32),
      new THREE.MeshStandardMaterial({
        map: texturaNubes(semilla),
        transparent: true,
        depthWrite: false,
        roughness: 1
      })
    )
    pivote.add(nubes)
  }

  const atmosfera = new THREE.Mesh(
    new THREE.SphereGeometry(config.radio * 1.1, 48, 32),
    atmosferaMaterial(config.atmosfera, 0.8, 3.4)
  )
  pivote.add(atmosfera)

  if (config.anillo) {
    const interno = config.radio * 1.45
    const externo = config.radio * 2.45
    const geo = new THREE.RingGeometry(interno, externo, 128, 1)
    // Reasigna UV: U recorre el radio para aplicar la textura de bandas.
    const p = geo.attributes.position
    const uv = geo.attributes.uv
    const v = new THREE.Vector3()
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i)
      uv.setXY(i, (v.length() - interno) / (externo - interno), 0.5)
    }
    const anillo = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({
        map: texturaAnillo(config.colores[2]),
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        roughness: 1
      })
    )
    anillo.rotation.x = Math.PI / 2 + 0.12
    pivote.add(anillo)
  }

  let luna: { malla: THREE.Mesh; angulo: number; distancia: number } | undefined
  if (config.luna) {
    const malla = new THREE.Mesh(
      new THREE.IcosahedronGeometry(config.radio * 0.24, 2),
      new THREE.MeshStandardMaterial({ color: '#d9e2ff', roughness: 0.95, flatShading: true })
    )
    luna = { malla, angulo: 1.2, distancia: config.radio * 2.1 }
    anclaje.add(malla)
  }

  const pick = new THREE.Mesh(
    new THREE.SphereGeometry(config.radio * 1.55, 12, 8),
    new THREE.MeshBasicMaterial()
  )
  pick.visible = false
  pivote.add(pick)

  const a = config.orbita
  const b = config.orbita * 0.94
  const planeta: Planeta = {
    id,
    config,
    radio: config.radio,
    grupoOrbita,
    anclaje,
    pivote,
    cuerpo,
    pick,
    atmosfera,
    angulo: config.fase,
    resalte: 0,
    actualizar(dt, t, velocidad) {
      planeta.angulo += config.velocidad * velocidad * dt
      anclaje.position.set(Math.cos(planeta.angulo) * a, 0, Math.sin(planeta.angulo) * b)
      cuerpo.rotation.y += config.rotacion * dt
      if (nubes) nubes.rotation.y += config.rotacion * dt * 1.35
      if (luna) {
        luna.angulo += dt * 0.9
        luna.malla.position.set(
          Math.cos(luna.angulo) * luna.distancia,
          Math.sin(luna.angulo * 0.7) * 0.25,
          Math.sin(luna.angulo) * luna.distancia
        )
        luna.malla.rotation.y += dt * 0.5
      }
      const escala = 1 + planeta.resalte * 0.14
      pivote.scale.setScalar(escala)
      ;(atmosfera.material as THREE.ShaderMaterial).uniforms.uIntensidad.value = 0.8 + planeta.resalte * 1.0
      void t
    },
    posicionMundo(destino) {
      return anclaje.getWorldPosition(destino)
    }
  }
  planeta.actualizar(0, 0, 0)
  return planeta
}

/** Línea de la órbita elíptica. */
export function crearOrbita(config: ConfigPlaneta, indice: number) {
  const a = config.orbita
  const b = config.orbita * 0.94
  const puntos: THREE.Vector3[] = []
  const N = 180
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * Math.PI * 2
    puntos.push(new THREE.Vector3(Math.cos(t) * a, 0, Math.sin(t) * b))
  }
  const geo = new THREE.BufferGeometry().setFromPoints(puntos)
  const punteada = indice % 2 === 1
  const material = punteada
    ? new THREE.LineDashedMaterial({ color: '#a4b9ff', transparent: true, opacity: 0.28, dashSize: 0.35, gapSize: 0.28 })
    : new THREE.LineBasicMaterial({ color: '#a4b9ff', transparent: true, opacity: 0.3 })
  const linea = new THREE.Line(geo, material)
  if (punteada) linea.computeLineDistances()
  return linea
}

/** Cinturón de asteroides entre dos órbitas. */
export function crearCinturon(radio: number, ancho: number, cantidad: number) {
  const rnd = crearAleatorio(404)
  const geo = new THREE.IcosahedronGeometry(0.05, 0)
  const mat = new THREE.MeshStandardMaterial({ color: '#9aa3c7', roughness: 1, flatShading: true })
  const malla = new THREE.InstancedMesh(geo, mat, cantidad)
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const e = new THREE.Euler()
  const s = new THREE.Vector3()
  const p = new THREE.Vector3()
  const c = new THREE.Color()
  for (let i = 0; i < cantidad; i++) {
    const ang = rnd() * Math.PI * 2
    const r = radio + (rnd() - 0.5) * ancho
    p.set(Math.cos(ang) * r, (rnd() - 0.5) * 0.35, Math.sin(ang) * r * 0.94)
    e.set(rnd() * 6, rnd() * 6, rnd() * 6)
    q.setFromEuler(e)
    const k = 0.5 + Math.pow(rnd(), 2.5) * 2.2
    s.set(k * (0.8 + rnd() * 0.5), k, k * (0.8 + rnd() * 0.5))
    m.compose(p, q, s)
    malla.setMatrixAt(i, m)
    c.set('#8a93b8').lerp(new THREE.Color('#d8c7b0'), rnd())
    malla.setColorAt(i, c)
  }
  const grupo = new THREE.Group()
  grupo.add(malla)
  const actualizar = (dt: number) => {
    grupo.rotation.y += dt * 0.012
  }
  return { objeto: grupo, actualizar }
}

/** Satélite de baja poligonación que orbita el sistema. */
export function crearSatelite(radioOrbita: number) {
  const orbita = new THREE.Group()
  const sat = new THREE.Group()
  const cuerpo = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.34, 0.46),
    new THREE.MeshStandardMaterial({ color: '#d7deff', metalness: 0.6, roughness: 0.35 })
  )
  const matPanel = new THREE.MeshStandardMaterial({
    color: '#2a4fd0',
    emissive: '#1b3aa8',
    emissiveIntensity: 0.6,
    metalness: 0.7,
    roughness: 0.3
  })
  const panelI = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.02, 0.32), matPanel)
  panelI.position.x = -0.65
  const panelD = panelI.clone()
  panelD.position.x = 0.65
  const antena = new THREE.Mesh(
    new THREE.CylinderGeometry(0.01, 0.01, 0.3, 6),
    new THREE.MeshStandardMaterial({ color: '#ffffff' })
  )
  antena.position.y = 0.3
  const punta = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 8, 8),
    new THREE.MeshBasicMaterial({ color: '#ff5d6c' })
  )
  punta.position.y = 0.46
  sat.add(cuerpo, panelI, panelD, antena, punta)
  sat.scale.setScalar(0.9)
  orbita.add(sat)
  orbita.rotation.set(0.22, 0, -0.1)

  let ang = 3.2
  const actualizar = (dt: number, t: number) => {
    ang += dt * 0.045
    sat.position.set(Math.cos(ang) * radioOrbita, 1.2 + Math.sin(t * 0.7) * 0.15, Math.sin(ang) * radioOrbita * 0.94)
    sat.rotation.y += dt * 0.4
    sat.rotation.z = Math.sin(t * 0.5) * 0.15
    ;(punta.material as THREE.MeshBasicMaterial).color.setRGB(1, 0.35 + 0.3 * Math.sin(t * 4), 0.4)
  }
  actualizar(0, 0)
  return { objeto: orbita, actualizar }
}
