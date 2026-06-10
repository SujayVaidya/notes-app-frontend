import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const hoverColors = [
  '#7c3aed', // violet-600
  '#9333ea', // purple-600
  '#6366f1', // indigo-500
  '#a855f7', // purple-500
  '#8b5cf6', // violet-500
  '#4f46e5', // indigo-600
  '#c026d3', // fuchsia-600
]

function randomColor() {
  return hoverColors[Math.floor(Math.random() * hoverColors.length)]
}

export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
  const rows = new Array(100).fill(1)
  const cols = new Array(70).fill(1)

  return (
    <div
      style={{
        transform:
          'translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)',
      }}
      className={cn(
        'absolute -top-1/4 left-1/4 z-0 flex -translate-x-1/2 -translate-y-1/2 w-full h-full p-4',
        className
      )}
      {...rest}
    >
      {rows.map((_, i) => (
        <motion.div
          key={`row-${i}`}
          className="w-16 h-8 border-l border-zinc-800 relative"
        >
          {cols.map((_, j) => (
            <motion.div
              whileHover={{
                backgroundColor: randomColor(),
                transition: { duration: 0 },
              }}
              animate={{ transition: { duration: 2 } }}
              key={`col-${j}`}
              className="w-16 h-8 border-r border-t border-zinc-800 relative"
            >
              {j % 2 === 0 && i % 2 === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="absolute h-6 w-10 -top-[14px] -left-[22px] text-zinc-800 stroke-[1px] pointer-events-none"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                </svg>
              ) : null}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  )
}

export const Boxes = React.memo(BoxesCore)
