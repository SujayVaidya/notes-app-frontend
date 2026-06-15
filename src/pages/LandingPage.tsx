import { Link } from 'react-router-dom'
import { PenLine, Tag, FileCode, Search, NotepadText } from 'lucide-react'
import { Boxes } from '@/components/aceternity/background-boxes'
import { ShimmerButton } from '@/components/aceternity/shimmer-button'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: PenLine,
    title: 'Easy Writing',
    desc: 'Create notes with a clean, distraction-free interface',
  },
  {
    icon: Tag,
    title: 'Categories',
    desc: 'Organize your notes with custom categories',
  },
  {
    icon: FileCode,
    title: 'Markdown',
    desc: 'Full GFM markdown with live split-view preview',
  },
  {
    icon: Search,
    title: 'Quick Search',
    desc: 'Find any note instantly as you type',
  },
]

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-950 flex flex-col items-center justify-center">
      {/* Background boxes grid */}
      <Boxes />

      {/* Radial mask overlay — transparent at center so boxes show through, dark at edges */}
      <div className="absolute inset-0 z-10 bg-zinc-950 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center text-center px-4 w-full max-w-4xl mx-auto gap-14">

        {/* Brand */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <NotepadText className="h-10 w-10 text-white" strokeWidth={1.5} />
            <h1 className={cn('text-5xl md:text-6xl font-bold text-white tracking-tight')}>
              JayNotes
            </h1>
          </div>
          <p className="text-zinc-400 text-lg mt-1">
            Your simple, beautiful note-taking solution
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm p-6 flex flex-col items-center text-center gap-3 hover:border-zinc-600 transition-colors"
            >
              <Icon className="h-8 w-8 text-zinc-200" strokeWidth={1.5} />
              <h3 className="font-semibold text-white text-sm">{title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-4">
          <Link to="/auth">
            <ShimmerButton
              shimmerColor="#9333ea"
              background="rgb(88 28 135)"
              className="px-8 py-3 text-sm font-medium"
            >
              Get Started
            </ShimmerButton>
          </Link>
          <Link
            to="/auth"
            className="px-8 py-3 rounded-full border border-zinc-700 text-zinc-300 text-sm font-medium hover:text-white hover:border-zinc-500 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-5 text-zinc-600 text-xs z-20">
        © 2025 JayNotes · Built with care
      </footer>
    </div>
  )
}
