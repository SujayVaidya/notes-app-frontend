'use client'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export function WavyBackground({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = 'fast',
  waveOpacity = 0.5,
  ...props
}: {
  children?: React.ReactNode
  className?: string
  containerClassName?: string
  colors?: string[]
  waveWidth?: number
  backgroundFill?: string
  blur?: number
  speed?: 'slow' | 'fast'
  waveOpacity?: number
} & React.HTMLProps<HTMLDivElement>) {
  const noise = useRef<{ simplex2: (x: number, y: number) => number } | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationId = useRef<number>(0)

  const getSpeed = () => (speed === 'fast' ? 0.002 : 0.001)

  const waveColors = colors ?? [
    '#38bdf8',
    '#818cf8',
    '#c084fc',
    '#e879f9',
    '#22d3ee',
  ]

  let nt = 0

  function drawWave(ctx: CanvasRenderingContext2D, w: number, h: number, n: number) {
    nt += getSpeed()
    for (let i = 0; i < n; i++) {
      ctx.beginPath()
      ctx.lineWidth = waveWidth ?? 50
      ctx.strokeStyle = waveColors[i % waveColors.length]
      for (let x = 0; x < w; x += 5) {
        const y = Math.sin(x / 100 + nt * (i + 1)) * 100 + h / 2
        ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.closePath()
    }
  }

  function render() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = (canvas.width = canvas.offsetWidth)
    const h = (canvas.height = canvas.offsetHeight)
    ctx.filter = `blur(${blur}px)`
    ctx.fillStyle = backgroundFill ?? 'rgb(9,9,11)'
    ctx.fillRect(0, 0, w, h)
    ctx.globalAlpha = waveOpacity
    drawWave(ctx, w, h, 5)
    animationId.current = requestAnimationFrame(render)
  }

  useEffect(() => {
    render()
    return () => cancelAnimationFrame(animationId.current)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={cn('flex flex-col items-center justify-center', containerClassName)}>
      <canvas
        className="absolute inset-0 z-0 w-full h-full"
        ref={canvasRef}
        style={{ ...(props.style ?? {}) }}
      />
      <div className={cn('relative z-10', className)} {...props}>
        {children}
      </div>
    </div>
  )
}
