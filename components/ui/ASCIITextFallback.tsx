// The plain word the ASCII banner shows instead of its animation: before the animation's
// code has loaded, and whenever the browser has no WebGL or the animation fails. It uses
// neither WebGL nor three.js, so it always renders.
interface ASCIITextFallbackProps {
  text?: string
  color?: string
}

export default function ASCIITextFallback({
  text = 'FOXBUILT',
  color = '#fdf9f3',
}: ASCIITextFallbackProps) {
  return (
    <div
      className="ascii-text-fallback absolute inset-0 flex items-center justify-center font-mono text-4xl font-semibold tracking-widest"
      style={{ color }}
    >
      {text}
    </div>
  )
}
