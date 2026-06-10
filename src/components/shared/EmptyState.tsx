import React from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 text-center p-8', className)}>
      {icon && <div className="text-zinc-600 mb-2">{icon}</div>}
      <h3 className="text-zinc-300 font-medium">{title}</h3>
      {description && <p className="text-zinc-500 text-sm max-w-xs">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
