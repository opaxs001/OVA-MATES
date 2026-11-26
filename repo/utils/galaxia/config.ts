import type { ConfigPlaneta } from './tipos'

/**
 * Apariencia de cada planeta según el campo `color` de data/mundos.js.
 * Los colores replican las paletas del mapa 2D original.
 */
export const CONFIG_PLANETAS: Record<string, ConfigPlaneta> = {
  azul: {
    radio: 1.14, orbita: 5.4, velocidad: 0.17, fase: 0.7,
    inclinacion: [0.04, 0.02], rotacion: 0.35, inclinacionAxial: 0.18,
    estilo: 'oceano', colores: ['#16409a', '#3b82e0', '#7fd0ff', '#f0fcff'],
    atmosfera: '#6fc7ff', acento: '#70cfff', nubes: true
  },
  rosa: {
    radio: 1.08, orbita: 8.1, velocidad: 0.125, fase: 2.5,
    inclinacion: [-0.05, 0.03], rotacion: 0.28, inclinacionAxial: 0.35,
    estilo: 'rocoso', colores: ['#3f2a78', '#9e519e', '#e88f95', '#fff0c0'],
    atmosfera: '#f2a0cc', acento: '#ed9bc8', nubes: true
  },
  violeta: {
    radio: 1.38, orbita: 11, velocidad: 0.092, fase: 4.1,
    inclinacion: [0.06, -0.03], rotacion: 0.45, inclinacionAxial: 0.3,
    estilo: 'gaseoso', colores: ['#241f68', '#5642a8', '#9564e8', '#e8cbff'],
    atmosfera: '#b896ff', acento: '#b38cff', anillo: true
  },
  verde: {
    radio: 1.02, orbita: 13.9, velocidad: 0.072, fase: 5.5,
    inclinacion: [-0.03, 0.05], rotacion: 0.3, inclinacionAxial: 0.12,
    estilo: 'rocoso', colores: ['#123f72', '#20809f', '#4dc8a8', '#d4ffcc'],
    atmosfera: '#76f0cd', acento: '#6affd7', nubes: true
  },
  dorado: {
    radio: 1.22, orbita: 17, velocidad: 0.056, fase: 1.4,
    inclinacion: [0.03, -0.05], rotacion: 0.5, inclinacionAxial: 0.22,
    estilo: 'gaseoso', colores: ['#3a2f58', '#9b663b', '#d6ac54', '#fff0b8'],
    atmosfera: '#ffd98a', acento: '#ffda8c', luna: true
  }
}

const RESPALDO = Object.values(CONFIG_PLANETAS)

/** Devuelve la configuración del planeta; si el color no existe, reutiliza una por índice. */
export function configDe(color: string, indice: number): ConfigPlaneta {
  return CONFIG_PLANETAS[color] ?? RESPALDO[indice % RESPALDO.length]
}

/** Generador pseudoaleatorio determinista (mulberry32). */
export function crearAleatorio(semilla: number) {
  let a = semilla >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
