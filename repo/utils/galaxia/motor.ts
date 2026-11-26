import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { configDe } from './config'
import { crearCinturon, crearOrbita, crearPlaneta, crearSatelite, crearSol, type Planeta } from './cuerpos'
import {
  crearCampoEstrellas,
  crearGalaxiaEspiral,
  crearNebulosas,
  crearResplandorSol,
  crearSimbolosFlotantes,
  type MaterialPuntos
} from './fondo'
import type { MotorGalaxia, OpcionesMotor } from './tipos'

/**
 * Motor 3D de la galaxia. No depende de Vue: recibe un contenedor, los datos de los
 * planetas y callbacks, y devuelve una API mínima para controlarlo.
 * Lanza una excepción si el navegador no soporta WebGL (el componente muestra una alternativa).
 */

type Vista = { pos: THREE.Vector3; target: THREE.Vector3 }
type Vuelo = { t0: number; dur: number; desde: Vista; hasta: () => Vista; alTerminar: () => void }

const EJE_Y = new THREE.Vector3(0, 1, 0)
const suavizar = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2)
const mezclar = (a: number, b: number, k: number) => a + (b - a) * k

export async function crearMotor(op: OpcionesMotor): Promise<MotorGalaxia> {
  const { contenedor } = op
  const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const movil = Math.min(window.innerWidth, window.innerHeight) < 640

  /* ---------- Renderizador, escena y cámara ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' })
  const ratio = Math.min(window.devicePixelRatio || 1, movil ? 1.5 : 1.75)
  renderer.setPixelRatio(ratio)
  renderer.setClearColor('#050818')
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  const canvas = renderer.domElement
  canvas.className = 'galaxia-canvas'
  canvas.setAttribute('aria-hidden', 'true')
  contenedor.appendChild(canvas)

  const escena = new THREE.Scene()
  escena.fog = null
  const camara = new THREE.PerspectiveCamera(48, 1, 0.1, 900)

  escena.add(new THREE.HemisphereLight('#8fa8ff', '#1b1038', 0.55))
  escena.add(new THREE.AmbientLight('#4a5aa8', 0.35))

  /* ---------- Fondo ---------- */
  const estrellas = crearCampoEstrellas(movil ? 2500 : 5000)
  escena.add(estrellas.objeto)
  const galaxia = crearGalaxiaEspiral(movil ? 16000 : 34000)
  galaxia.objeto.position.y = -2.2
  galaxia.objeto.rotation.x = -0.1
  escena.add(galaxia.objeto)
  const materialesPuntos: MaterialPuntos[] = [estrellas.material, galaxia.material]
  escena.add(crearNebulosas())

  /* ---------- Sistema ---------- */
  const sol = crearSol()
  escena.add(sol.objeto)
  escena.add(crearResplandorSol())

  const cinturon = crearCinturon(12.45, 0.9, movil ? 450 : 900)
  escena.add(cinturon.objeto)
  const satelite = crearSatelite(20.4)
  escena.add(satelite.objeto)

  const simbolos = crearSimbolosFlotantes(
    movil ? 18 : 34,
    op.planetas.map((p, i) => configDe(p.color, i).acento)
  )
  escena.add(simbolos.objeto)

  const planetas: Planeta[] = []
  const porId = new Map<string, Planeta>()
  const grupoSistema = new THREE.Group()
  escena.add(grupoSistema)
  for (let i = 0; i < op.planetas.length; i++) {
    const dato = op.planetas[i]
    const cfg = configDe(dato.color, i)
    grupoSistema.add(crearOrbita(cfg, i))
    // Se cede el hilo entre planetas para que la interfaz no se congele al generar texturas.
    await new Promise(r => setTimeout(r, 0))
    const planeta = await crearPlaneta(dato.id, cfg, i)
    grupoSistema.add(planeta.grupoOrbita)
    planetas.push(planeta)
    porId.set(dato.id, planeta)
    op.alProgreso?.((i + 1) / op.planetas.length)
  }

  /* ---------- Controles ---------- */
  const controles = new OrbitControls(camara, canvas)
  controles.enableDamping = true
  controles.dampingFactor = 0.06
  controles.enablePan = false
  controles.rotateSpeed = 0.55
  controles.zoomSpeed = 0.7
  const DIST_MIN = 9
  const DIST_MAX = 72
  controles.minDistance = DIST_MIN
  controles.maxDistance = 200 // se limita a DIST_MAX al terminar la introducción
  controles.minPolarAngle = 0.25
  controles.maxPolarAngle = 1.5
  controles.autoRotate = !reducirMovimiento
  controles.autoRotateSpeed = 0.28

  function vistaInicial(): Vista {
    const aspecto = camara.aspect || 1.6
    const dist = THREE.MathUtils.clamp(34 / Math.pow(aspecto, 0.55), 23, 56)
    const phi = 1.12
    const theta = 0.35
    return {
      pos: new THREE.Vector3(dist * Math.sin(phi) * Math.sin(theta), dist * Math.cos(phi), dist * Math.sin(phi) * Math.cos(theta)),
      target: new THREE.Vector3(0, -0.4, 0)
    }
  }

  /* ---------- Tamaño ---------- */
  function ajustarTamano() {
    const w = Math.max(1, contenedor.clientWidth)
    const h = Math.max(1, contenedor.clientHeight)
    renderer.setSize(w, h)
    camara.aspect = w / h
    camara.updateProjectionMatrix()
    for (const m of materialesPuntos) m.uniforms.uPixeles.value = ratio
  }
  ajustarTamano()
  const observador = new ResizeObserver(ajustarTamano)
  observador.observe(contenedor)

  /* ---------- Estado ---------- */
  type Modo = 'libre' | 'volando' | 'foco'
  let modo: Modo = 'libre'
  let vuelo: Vuelo | null = null
  let vistaLibre = vistaInicial()
  let enfocado: Planeta | null = null
  let anguloFoco = 0
  let pausado = false
  let velocidadGlobal = reducirMovimiento ? 0.3 : 1
  let hoverCanvas: Planeta | null = null
  let hoverExterno: string | null = null
  let reanudarAuto: ReturnType<typeof setTimeout> | undefined

  const vistaActual = (): Vista => ({ pos: camara.position.clone(), target: controles.target.clone() })

  function iniciarVuelo(hasta: () => Vista, dur: number, alTerminar: () => void) {
    vuelo = { t0: performance.now(), dur: dur * 1000, desde: vistaActual(), hasta, alTerminar }
    modo = 'volando'
    controles.enabled = false
    controles.autoRotate = false
  }

  function destinoFoco(p: Planeta): Vista {
    const pos = p.posicionMundo(new THREE.Vector3())
    const radial = new THREE.Vector3(pos.x, 0, pos.z).normalize()
    const lateral = new THREE.Vector3(-radial.z, 0, radial.x)
    const dir = radial.multiplyScalar(-0.45).add(lateral.multiplyScalar(0.9))
    dir.applyAxisAngle(EJE_Y, anguloFoco).normalize()
    dir.y = 0.26
    dir.normalize()
    const dist = p.radio * (p.config.anillo ? 5.8 : 3.9)
    return { pos: pos.clone().add(dir.multiplyScalar(dist)), target: pos }
  }

  function terminarVueloLibre() {
    modo = 'libre'
    controles.enabled = true
    controles.minDistance = DIST_MIN
    controles.maxDistance = DIST_MAX
    controles.autoRotate = !reducirMovimiento
  }

  /* ---------- Cámara: introducción ---------- */
  if (!reducirMovimiento) {
    const home = vistaLibre
    const lejos: Vista = {
      pos: new THREE.Vector3(-home.pos.x * 1.6 - 18, home.pos.y * 2.2 + 12, home.pos.z * 2.1),
      target: home.target.clone()
    }
    camara.position.copy(lejos.pos)
    controles.target.copy(lejos.target)
    controles.update()
    iniciarVuelo(() => vistaLibre, 3.2, terminarVueloLibre)
  } else {
    camara.position.copy(vistaLibre.pos)
    controles.target.copy(vistaLibre.target)
    controles.update()
    terminarVueloLibre()
  }

  /* ---------- Puntero ---------- */
  const rayo = new THREE.Raycaster()
  const puntero = new THREE.Vector2()
  let punteroDentro = false
  let arrastrando = false
  let inicio = { x: 0, y: 0, t: 0 }

  function actualizarPuntero(e: PointerEvent) {
    const r = canvas.getBoundingClientRect()
    puntero.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
  }
  const alMover = (e: PointerEvent) => {
    actualizarPuntero(e)
    punteroDentro = true
  }
  const alSalir = () => {
    punteroDentro = false
  }
  const alPulsar = (e: PointerEvent) => {
    inicio = { x: e.clientX, y: e.clientY, t: performance.now() }
    arrastrando = true
    actualizarPuntero(e)
  }
  const alSoltar = (e: PointerEvent) => {
    arrastrando = false
    if (modo !== 'libre') return
    const movido = Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y)
    if (movido > 6 || performance.now() - inicio.t > 600) return
    actualizarPuntero(e)
    const p = elegir()
    if (p) op.alSeleccionar(p.id)
  }
  canvas.addEventListener('pointermove', alMover)
  canvas.addEventListener('pointerleave', alSalir)
  canvas.addEventListener('pointerdown', alPulsar)
  canvas.addEventListener('pointerup', alSoltar)

  const alIniciarControl = () => {
    clearTimeout(reanudarAuto)
    controles.autoRotate = false
  }
  const alTerminarControl = () => {
    clearTimeout(reanudarAuto)
    if (reducirMovimiento) return
    reanudarAuto = setTimeout(() => {
      if (modo === 'libre') controles.autoRotate = true
    }, 6000)
  }
  controles.addEventListener('start', alIniciarControl)
  controles.addEventListener('end', alTerminarControl)

  function elegir(): Planeta | null {
    rayo.setFromCamera(puntero, camara)
    const golpes = rayo.intersectObjects(planetas.map(p => p.pick), false)
    if (!golpes.length) return null
    return planetas.find(p => p.pick === golpes[0].object) ?? null
  }

  /* ---------- Etiquetas HTML proyectadas ---------- */
  const vec = new THREE.Vector3()
  function actualizarEtiquetas(ancho: number, alto: number) {
    for (const p of planetas) {
      const el = op.etiquetas.get(p.id)
      if (!el) continue
      p.posicionMundo(vec)
      const distancia = camara.position.distanceTo(vec)
      vec.y += p.radio * 1.3 * (1 + p.resalte * 0.14)
      vec.project(camara)
      const visible = vec.z < 1 && modo === 'libre' && Math.abs(vec.x) < 1.15 && Math.abs(vec.y) < 1.15
      const x = (vec.x * 0.5 + 0.5) * ancho
      const y = (-vec.y * 0.5 + 0.5) * alto
      const escala = THREE.MathUtils.clamp(26 / distancia, 0.66, 1.08)
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%) scale(${escala.toFixed(3)})`
      el.style.zIndex = String(Math.round(1000 - distancia * 10))
      el.dataset.visible = visible ? 'true' : 'false'
    }
  }

  /* ---------- Bucle ---------- */
  const reloj = new THREE.Clock()
  let tiempo = 0
  let raf = 0
  let destruido = false

  function bucle() {
    if (destruido) return
    raf = requestAnimationFrame(bucle)
    const dt = Math.min(0.05, reloj.getDelta())
    tiempo += dt

    // Velocidad orbital global suavizada
    const objetivoVel = pausado ? 0 : reducirMovimiento ? 0.3 : modo === 'libre' ? 1 : 0.7
    velocidadGlobal = mezclar(velocidadGlobal, objetivoVel, 1 - Math.exp(-dt * 3))

    // Hover por raycast (solo en vista libre)
    if (modo === 'libre' && punteroDentro && !arrastrando) {
      const p = elegir()
      if (p !== hoverCanvas) {
        hoverCanvas = p
        op.alPasarPor(p ? p.id : null)
        canvas.style.cursor = p ? 'pointer' : 'grab'
      }
    } else if (hoverCanvas && (modo !== 'libre' || !punteroDentro)) {
      hoverCanvas = null
      op.alPasarPor(null)
      canvas.style.cursor = 'grab'
    }

    const idResaltado = hoverCanvas?.id ?? hoverExterno
    for (const p of planetas) {
      const objetivo = modo === 'libre' && p.id === idResaltado ? 1 : 0
      p.resalte = mezclar(p.resalte, objetivo, 1 - Math.exp(-dt * 8))
      const detenido = p === enfocado
      const vel = detenido ? 0 : velocidadGlobal * (1 - p.resalte * 0.92)
      p.actualizar(dt, tiempo, vel)
    }

    sol.actualizar(dt)
    cinturon.actualizar(dt)
    satelite.actualizar(dt * (pausado ? 0 : 1), tiempo)
    simbolos.actualizar(dt * (pausado ? 0 : 1), tiempo)
    galaxia.objeto.rotation.y += dt * 0.006 * (pausado ? 0 : 1)
    for (const m of materialesPuntos) m.uniforms.uTiempo.value = tiempo

    // Cámara
    if (vuelo) {
      const k = Math.min(1, (performance.now() - vuelo.t0) / vuelo.dur)
      const e = suavizar(k)
      const destino = vuelo.hasta()
      camara.position.lerpVectors(vuelo.desde.pos, destino.pos, e)
      controles.target.lerpVectors(vuelo.desde.target, destino.target, e)
      if (k >= 1) {
        const fin = vuelo.alTerminar
        vuelo = null
        fin()
      }
    } else if (modo === 'foco' && enfocado) {
      anguloFoco += dt * (reducirMovimiento ? 0 : 0.07)
      const d = destinoFoco(enfocado)
      camara.position.copy(d.pos)
      controles.target.copy(d.target)
    }
    controles.update()

    renderer.render(escena, camara)
    actualizarEtiquetas(contenedor.clientWidth, contenedor.clientHeight)
  }
  canvas.style.cursor = 'grab'
  bucle()

  /* ---------- API pública ---------- */
  return {
    enfocar(id) {
      const p = porId.get(id)
      if (!p) return
      if (modo === 'libre') vistaLibre = vistaActual()
      clearTimeout(reanudarAuto)
      enfocado = p
      anguloFoco = 0
      controles.minDistance = 0.5
      iniciarVuelo(() => destinoFoco(p), 1.6, () => {
        modo = 'foco'
      })
    },
    liberar() {
      if (!enfocado) return
      enfocado = null
      iniciarVuelo(() => vistaLibre, 1.4, terminarVueloLibre)
    },
    recentrar() {
      if (modo !== 'libre') return
      vistaLibre = vistaInicial()
      iniciarVuelo(() => vistaLibre, 1.2, terminarVueloLibre)
    },
    pausarOrbitas(valor) {
      pausado = valor
    },
    resaltar(id) {
      hoverExterno = id
    },
    destruir() {
      destruido = true
      cancelAnimationFrame(raf)
      clearTimeout(reanudarAuto)
      observador.disconnect()
      canvas.removeEventListener('pointermove', alMover)
      canvas.removeEventListener('pointerleave', alSalir)
      canvas.removeEventListener('pointerdown', alPulsar)
      canvas.removeEventListener('pointerup', alSoltar)
      controles.removeEventListener('start', alIniciarControl)
      controles.removeEventListener('end', alTerminarControl)
      controles.dispose()
      const texturas = new Set<THREE.Texture>()
      escena.traverse(obj => {
        const malla = obj as THREE.Mesh
        malla.geometry?.dispose()
        const materiales = Array.isArray(malla.material) ? malla.material : malla.material ? [malla.material] : []
        for (const m of materiales) {
          const mm = m as THREE.Material & { map?: THREE.Texture | null }
          if (mm.map) texturas.add(mm.map)
          m.dispose()
        }
      })
      texturas.forEach(t => t.dispose())
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    }
  }
}
