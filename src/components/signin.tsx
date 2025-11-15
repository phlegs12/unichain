'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (res.ok) {
        const data = await res.json()
        console.log('Sign in successful:', data.user)
        router.push('/profile') // Redirect to profile page after successful login
      } else {
        const data = await res.json()
        setError(data.message || 'An error occurred during sign in')
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError('An error occurred during sign in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-lg border border-purple-100">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription className="text-purple-100">Log in to your account</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-purple-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-purple-700">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-purple-200 focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Log In'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between bg-purple-50">
        <Link href="/forgotpassword" className="text-sm text-indigo-600 hover:underline">
          Forgot password?
        </Link>
        <p className="text-sm text-purple-700">
          Need an account? <Link href="/get-started" className="text-indigo-600 hover:underline">Sign up</Link>
        </p>
      </CardFooter>
    </Card>
  )
}