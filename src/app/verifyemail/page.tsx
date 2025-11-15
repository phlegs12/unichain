import { Metadata } from 'next'
import Link from 'next/link'
import EmailVerificationContent from '@/components/verifyemail'

export const metadata: Metadata = {
  title: 'Verify Your Email | Unichain',
  description: 'Please verify your email to complete your registration with Unichain',
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-purple-50 to-white">
      <header className="w-full py-4 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-indigo-600">
        <div className="container mx-auto">
          <Link href="/" className="text-2xl font-bold text-white">
            Unichain
          </Link>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 md:py-16">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-purple-800">Verify Your Email</h1>
        <EmailVerificationContent />
      </main>
    </div>
  )
}