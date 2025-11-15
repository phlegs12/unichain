import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'

export default function EmailVerificationContent() {
  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-lg border border-purple-100">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Mail className="w-6 h-6" />
          Email Verification Required
        </CardTitle>
        <CardDescription className="text-purple-100">
          Please check your inbox to complete registration
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-gray-600 mb-4">
          We have sent a verification email to your registered email address. Please click the link in the email to verify your account.
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
          <li>Check your spam or junk folder if you do not see the email</li>
          <li>The link in the email will expire after 24 hours</li>
          <li>You need to verify your email to access all features</li>
        </ul>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 bg-purple-50">
        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
          Resend Verification Email
        </Button>
        <p className="text-sm text-center text-gray-600">
          Did not receive the email? Check your spam folder or contact support.
        </p>
      </CardFooter>
    </Card>
  )
}