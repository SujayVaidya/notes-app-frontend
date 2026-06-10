import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LoadingSpinner({ className, fullScreen }: { className?: string; fullScreen?: boolean }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center z-50">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }
  return <Loader2 className={cn('h-5 w-5 animate-spin text-zinc-400', className)} />
}
