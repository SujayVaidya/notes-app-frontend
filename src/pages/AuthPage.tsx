import { Navigate, Link } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BackgroundBeams } from '@/components/aceternity/background-beams'
import { LampContainer } from '@/components/aceternity/lamp'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignupForm } from '@/components/auth/SignupForm'
import { useAuthStore } from '@/stores/authStore'

export default function AuthPage() {
  const session = useAuthStore((s) => s.session)
  if (session) return <Navigate to="/app" replace />

  return (
    <div className="min-h-screen bg-zinc-950 relative flex flex-col items-center justify-start">
      <BackgroundBeams className="absolute inset-0 z-0" />

      <div className="relative z-10 w-full">
        <LampContainer className="min-h-[16rem]">
          <div className="text-center">
            <span className="text-purple-400 text-4xl">⬡</span>
            <h1 className="text-2xl font-bold text-white mt-2">Notes</h1>
            <p className="text-zinc-400 text-sm mt-1">Write without friction</p>
          </div>
        </LampContainer>
      </div>

      <div className="relative z-10 w-full max-w-sm px-4 -mt-16 pb-10">
        <Card className="bg-zinc-900/90 backdrop-blur-sm border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Welcome</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin">
              <TabsList className="w-full bg-zinc-800/60 border border-zinc-700">
                <TabsTrigger
                  value="signin"
                  className="flex-1 text-zinc-400 data-[state=active]:!bg-purple-600 data-[state=active]:!text-white data-[state=active]:shadow-md transition-colors"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="flex-1 text-zinc-400 data-[state=active]:!bg-purple-600 data-[state=active]:!text-white data-[state=active]:shadow-md transition-colors"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              <TabsContent value="signin" className="mt-4">
                <LoginForm />
              </TabsContent>
              <TabsContent value="signup" className="mt-4">
                <SignupForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <div className="text-center mt-4">
          <Link to="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
