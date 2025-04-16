"use client"

import { usePathname as useNextPathname } from 'next/navigation'

export const usePathname = () => {
  const pathname = useNextPathname()
  return pathname || ''
} 