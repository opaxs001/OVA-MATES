// Tipos compartidos por el motor 3D de la galaxia.

/** Datos mínimos de un mundo (vienen de data/mundos.js). */
export interface PlanetaDato {
  id: string
  titulo: string
  subtitulo: string
  icono: string
  color: string
}

export type EstiloPlaneta = 'oceano' | 'rocoso' | 'gaseoso'

/** Apariencia y órbita de cada planeta. */
export interface ConfigPlaneta {
  radio: number
  /** Semieje mayor de la órbita (unidades de escena). */
  orbita: number
  /** Velocidad angular en rad/s. */
  velocidad: number
  /** Ángulo inicial en radianes. */
  fase: number
  /** Inclinación del plano orbital en radianes (x, z). */
  inclinacion: [number, number]
  /** Rotación sobre su propio eje en rad/s. */
  rotacion: number
  inclinacionAxial: number
  estilo: EstiloPlaneta
  /** Rampa de colores de oscuro a claro. */
  colores: [string, string, string, string]
  atmosfera: string
  acento: string
  nubes?: boolean
  anillo?: boolean
  luna?: boolean
}

export interface OpcionesMotor {
  contenedor: HTMLElement
  planetas: PlanetaDato[]
  etiquetas: Map<string, HTMLElement>
  alSeleccionar: (id: string) => void
  alPasarPor: (id: string | null) => void
  alProgreso?: (valor: number) => void
}

export interface MotorGalaxia {
  enfocar: (id: string) => void
  liberar: () => void
  recentrar: () => void
  pausarOrbitas: (pausa: boolean) => void
  resaltar: (id: string | null) => void
  destruir: () => void
}
