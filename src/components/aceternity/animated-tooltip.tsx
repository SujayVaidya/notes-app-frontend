'use client'
import React, { useState } from 'react'
import { motion, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'

export function AnimatedTooltip({
  items,
}: {
  items: { id: number; name: string; designation?: string; image?: string; icon?: React.ReactNode; onClick?: () => void }[]
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const springConfig = { stiffness: 100, damping: 5 }
  const x = useMotionValue(0)
  const rotate = useSpring(useTransform(x, [-100, 100], [-45, 45]), springConfig)
  const translateX = useSpring(useTransform(x, [-100, 100], [-50, 50]), springConfig)

  const handleMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    const halfWidth = event.currentTarget.offsetWidth / 2
    x.set(event.nativeEvent.offsetX - halfWidth)
  }

  return (
    <>
      {items.map((item) => (
        <div className="relative group" key={item.name}>
          <AnimatePresence mode="wait">
            {hoveredIndex === item.id && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 10 } }}
                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                style={{ translateX: translateX, rotate: rotate, whiteSpace: 'nowrap' }}
                className="absolute -top-14 -left-1/2 translate-x-1/2 flex text-xs flex-col items-center justify-center rounded-md bg-zinc-800 border border-zinc-700 z-50 shadow-xl px-4 py-2"
              >
                <div className="font-bold text-white relative z-30 text-sm">{item.name}</div>
                {item.designation && (
                  <div className="text-zinc-400 text-xs">{item.designation}</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setHoveredIndex(item.id)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={item.onClick}
            className="p-2 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
          >
            {item.icon}
          </button>
        </div>
      ))}
    </>
  )
}
