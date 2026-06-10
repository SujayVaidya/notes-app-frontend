import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function HoverEffect({
  items,
  className,
}: {
  items: { title: string; description: string; link?: string }[]
  className?: string
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-10', className)}>
      {items.map((item, idx) => (
        <div
          key={idx}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-zinc-800/[0.8] block rounded-2xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.2 } }}
              />
            )}
          </AnimatePresence>
          <Card>
            <CardTitle>{item.title}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </Card>
        </div>
      ))}
    </div>
  )
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-2xl h-full w-full p-4 overflow-hidden bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 relative z-20 transition-colors',
        className
      )}
    >
      <div className="relative z-50 p-4">{children}</div>
    </div>
  )
}

function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h4 className={cn('text-zinc-100 font-bold tracking-wide mt-4', className)}>{children}</h4>
  )
}

function CardDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <p className={cn('mt-2 text-zinc-400 tracking-wide leading-relaxed text-sm', className)}>
      {children}
    </p>
  )
}
