import { Metadata } from 'next'
import KeplrLayout from '@/components/profile/keplrLayout'
export const metadata: Metadata = {
  title: 'User Profile | Noderectification',
  description: 'Manage your CryptoSolutions account and settings',
}

export default function ProfilePage() {
  return (
    <KeplrLayout />
  )
}