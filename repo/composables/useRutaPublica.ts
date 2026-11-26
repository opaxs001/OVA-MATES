/**
 * Devuelve una función que antepone el `baseURL` de Nuxt a los archivos de /public.
 * Así el proyecto funciona igual en la raíz de un dominio o en una subruta
 * (por ejemplo GitHub Pages).
 */
export function useRutaPublica() {
  const base = useRuntimeConfig().app.baseURL || '/'
  const prefijo = base.endsWith('/') ? base : `${base}/`
  return (ruta: string) => prefijo + ruta.replace(/^\/+/, '')
}
