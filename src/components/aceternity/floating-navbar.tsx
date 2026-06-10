'use client'
import { useState } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

export function FloatingNav({
  navItems,
  className,
}: {
  navItems: { name: string; link: string; icon?: React.ReactNode }[]
  className?: string
}) {
  const { scrollYProgress } = useScroll()
  const [visible, setVisible] = useState(true)

  useMotionValueEvent(scrollYProgress, 'change', (current) => {
    if (typeof current === 'number') {
      const direction = current - (scrollYProgress.getPrevious() ?? 0)
      if (scrollYProgress.get() < 0.05) {
        setVisible(true)
      } else {
        setVisible(direction < 0)
      }
    }
  })

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 1, y: -100 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'flex max-w-fit fixed top-4 inset-x-0 mx-auto border border-zinc-800 rounded-full bg-zinc-950/80 backdrop-blur-sm shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] px-6 py-3 items-center justify-center space-x-4',
          className
        )}
      >
        <div className="flex items-center space-x-1 text-white font-semibold mr-4">
          <span className="text-purple-500">⬡</span>
          <span>Notes</span>
        </div>
        {navItems.map((navItem, idx) => (
          <a
            key={idx}
            href={navItem.link}
            className={cn(
              'relative text-zinc-400 hover:text-white items-center flex space-x-1 text-sm transition-colors'
            )}
          >
            {navItem.icon && <span className="block sm:hidden">{navItem.icon}</span>}
            <span className="hidden sm:block">{navItem.name}</span>
          </a>
        ))}
        <Link
          to="/auth"
          className="border border-zinc-700 text-white rounded-full px-4 py-1.5 text-sm hover:bg-zinc-800 transition-colors"
        >
          Sign In
        </Link>
      </motion.div>
    </AnimatePresence>
  )
}
