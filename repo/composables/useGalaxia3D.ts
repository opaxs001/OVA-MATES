import { onBeforeUnmount, ref, shallowRef, type Ref } from 'vue'
import type { MotorGalaxia, PlanetaDato } from '../utils/galaxia/tipos'

type Estado = 'cargando' | 'listo' | 'error'

interface Opciones {
  contenedor: Ref<HTMLElement | null>
  planetas: () => PlanetaDato[]
  /** Elementos HTML de las etiquetas, indexados por id de planeta (los posiciona el motor). */
  etiquetas: Map<string, HTMLElement>
  alSeleccionar: (id: string) => void
}

/**
 * Puente entre el motor three.js y los componentes Vue.
 * - Importa three de forma dinámica, solo en el navegador (compatible con SSR de Nuxt).
 * - Expone estado reactivo y la API de cámara del motor.
 */
export function useGalaxia3D(opciones: Opciones) {
  const estado = ref<Estado>('cargando')
  const progreso = ref(0)
  const idResaltado = ref<string | null>(null)
  const motor = shallowRef<MotorGalaxia | null>(null)

  let desmontado = false
  let idPendiente: string | null = null

  async function iniciar() {
    const contenedor = opciones.contenedor.value
    if (!contenedor) return
    try {
      const { crearMotor } = await import('../utils/galaxia/motor')
      const instancia = await crearMotor({
        contenedor,
        planetas: opciones.planetas(),
        etiquetas: opciones.etiquetas,
        alSeleccionar: opciones.alSeleccionar,
        alPasarPor: id => {
          idResaltado.value = id
        },
        alProgreso: valor => {
          progreso.value = valor
        }
      })
      if (desmontado) {
        instancia.destruir()
        return
      }
      motor.value = instancia
      estado.value = 'listo'
      if (idPendiente) instancia.enfocar(idPendiente)
    } catch (error) {
      console.warn('[Galaxia 3D] No se pudo iniciar WebGL; se usa la lista de planetas.', error)
      estado.value = 'error'
    }
  }

  function enfocar(id: string) {
    idPendiente = id
    motor.value?.enfocar(id)
  }

  function liberar() {
    idPendiente = null
    motor.value?.liberar()
  }

  function resaltar(id: string | null) {
    idResaltado.value = id
    motor.value?.resaltar(id)
  }

  onBeforeUnmount(() => {
    desmontado = true
    motor.value?.destruir()
    motor.value = null
  })

  return {
    estado,
    progreso,
    idResaltado,
    iniciar,
    enfocar,
    liberar,
    resaltar,
    recentrar: () => motor.value?.recentrar(),
    pausarOrbitas: (pausa: boolean) => motor.value?.pausarOrbitas(pausa)
  }
}
