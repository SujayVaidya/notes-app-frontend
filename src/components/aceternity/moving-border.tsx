'use client'
import React, { useRef } from 'react'
import { motion, useAnimationFrame, useMotionTemplate, useMotionValue, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

export function MovingBorder({
  children,
  duration = 2000,
  rx,
  ry,
  ...otherProps
}: {
  children: React.ReactNode
  as?: React.ElementType
  containerClassName?: string
  borderClassName?: string
  duration?: number
  className?: string
  rx?: string
  ry?: string
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <Component
      duration={duration}
      rx={rx}
      ry={ry}
      {...otherProps}
    >
      {children}
    </Component>
  )
}

function Component({
  children,
  duration = 2000,
  className,
  containerClassName,
  borderClassName,
  rx,
  ry,
  ...otherProps
}: {
  children: React.ReactNode
  duration?: number
  className?: string
  containerClassName?: string
  borderClassName?: string
  rx?: string
  ry?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  const pathRef = useRef<SVGRectElement>(null)
  const progress = useMotionValue<number>(0)

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength()
    if (length) {
      const pxPerMillisecond = length / duration
      progress.set((time * pxPerMillisecond) % length)
    }
  })

  const x = useTransform(progress, (val) => pathRef.current?.getPointAtLength(val).x ?? 0)
  const y = useTransform(progress, (val) => pathRef.current?.getPointAtLength(val).y ?? 0)

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`

  return (
    <div
      className={cn('relative h-full w-full p-[1px] overflow-hidden', containerClassName)}
      {...otherProps}
    >
      <div className="absolute inset-0" style={{ borderRadius: rx ? `${rx}px` : undefined }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="absolute h-full w-full"
          width="100%"
          height="100%"
        >
          <rect
            fill="none"
            width="100%"
            height="100%"
            rx={rx ?? '8'}
            ry={ry ?? '8'}
            ref={pathRef}
          />
        </svg>
        <motion.div
          style={{ position: 'absolute', top: 0, left: 0, display: 'inline-block', transform }}
          className={cn(
            'h-20 w-20 opacity-[0.8] bg-[radial-gradient(circle_at_center,_#9333ea_0%,_transparent_60%)]',
            borderClassName
          )}
        />
      </div>
      <div
        className={cn('relative', className)}
        style={{ borderRadius: rx ? `calc(${rx}px - 1px)` : undefined }}
      >
        {children}
      </div>
    </div>
  )
}
