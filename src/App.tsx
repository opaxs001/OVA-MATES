// Contenedor de Arena: muestra la versión estática (nuxt generate) del OVA
// "AstroMat: números a bordo" con la galaxia 3D, y ofrece el código fuente en .zip.
export default function App() {
  return (
    <div className="fixed inset-0 bg-[#070b22]">
      <iframe
        title="AstroMat: números a bordo — galaxia 3D"
        src="./ova/index.html"
        allow="autoplay; fullscreen"
        className="h-full w-full border-0"
      />
      <a
        href="./ova-mision-matematica-3d.zip"
        download
        className="fixed bottom-3 left-3 z-50 rounded-full border border-white/20 bg-[#0f1738]/80 px-3 py-1.5 text-xs font-bold text-slate-200 backdrop-blur transition hover:bg-[#26306a]"
      >
        ⬇ Descargar proyecto Nuxt (.zip)
      </a>
    </div>
  );
}
