import { Link } from 'react-router-dom'
import { BackgroundBeamsWithCollision } from '@/components/aceternity/background-beams-with-collision'

export default function NotFoundPage() {
  return (
    <BackgroundBeamsWithCollision className="min-h-screen">
      <div className="relative z-20 text-center">
        <h1 className="text-8xl font-bold text-white mb-4">404</h1>
        <p className="text-zinc-400 text-xl mb-8">Page not found</p>
        <Link
          to="/"
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors font-medium"
        >
          Go home
        </Link>
      </div>
    </BackgroundBeamsWithCollision>
  )
}
