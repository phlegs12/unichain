import { Metadata } from 'next'
import ProfileLayout from '@/components/profile/profileLayout'

export const metadata: Metadata = {
  title: 'User Profile | Unichain',
  description: 'Manage your CryptoSolutions account and settings',
}

export default function ProfilePage() {
  return (
    <ProfileLayout />
  )
}