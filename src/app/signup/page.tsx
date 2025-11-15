import { Metadata } from 'next'
import SignUpForm from '@/components/signup'

export const metadata: Metadata = {
  title: 'Get Started | Unichain',
  description: 'Sign up for Unichain and start your crypto journey',
}

export default function GetStartedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-purple-800">Get Started with <span className="italic">Unichain</span></h1>
        <SignUpForm />
      </main>
    </div>
  )
}