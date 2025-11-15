import { Metadata } from 'next'
import LoginForm from '@/components/signin'

export const metadata: Metadata = {
  title: 'Login | Unichain',
  description: 'Log in to your Unichain account',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-purple-800">Log in to your <span className="italic">Unichain account</span></h1>
        <LoginForm />
      </main>
    </div>
  )
}