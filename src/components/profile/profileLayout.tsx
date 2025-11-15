'use client'

import { useState, useEffect } from 'react'
// import ProfileContent from './profileContent'
import IssuesContent from './issueContent'
// import SupportContent from './supportContent'
import { AlertCircle } from 'lucide-react'

 /* eslint-disable no-unused-vars */
 /* eslint-disable @typescript-eslint/no-unused-vars */
const tabs = [
  // { id: 'profile', label: 'Profile', icon: User },
  { id: 'issues', label: 'Issues', icon: AlertCircle },
  // { id: 'support', label: 'Support', icon: HeadphonesIcon },
]

export default function ProfileLayout() {
   /* eslint-disable no-unused-vars */
 /* eslint-disable @typescript-eslint/no-unused-vars */
  const [activeTab, setActiveTab] = useState('profile')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

 

   /* eslint-disable no-unused-vars */
 /* eslint-disable @typescript-eslint/no-unused-vars */
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    if (isMobile) {
      setIsMobileMenuOpen(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <IssuesContent />
        </div>
      </main>
    </div>
  )
}