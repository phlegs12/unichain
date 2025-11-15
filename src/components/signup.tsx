'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'

export default function SignUpForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      })

      if (res.ok) {
        router.push('/profile') // Redirect to email verification page
      } else {
        const data = await res.json()
        setError(data.message || 'An error occurred during sign-up')
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError('An error occurred during sign up')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-lg border border-purple-100">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription className="text-purple-100">Enter your details to get started</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <Label htmlFor="username" className="text-purple-700">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="cooluser123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center bg-purple-50">
        <p className="text-sm text-purple-700">
          Already have an account? <a href="/login" className="text-indigo-600 hover:underline">Log in</a>
        </p>
      </CardFooter>
    </Card>
  )
}