'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isTokenValid } from '../../utils/auth'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const ok = await isTokenValid()
      if (!mounted) return
      if (!ok) {
        router.replace('/login')
      } else {
        setChecking(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [router])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return <>{children}</>
}


