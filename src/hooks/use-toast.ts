'use client'

import { useState, useCallback } from 'react'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

interface ToastProps {
  title?: string
  description?: string
  variant?: 'default' | 'destructive'
}

// Simple toast hook implementation
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(({ title, description, variant = 'default' }: ToastProps) => {
    const id = Math.random().toString(36).slice(2)

    const newToast: Toast = {
      id,
      title,
      description,
      variant
    }

    setToasts(prev => [...prev, newToast])

    // Simple alert for now - can be enhanced later with proper toast UI
    const message = title ? `${title}${description ? '\n' + description : ''}` : description || ''

    if (variant === 'destructive') {
      alert('Error: ' + message)
    } else {
      alert(message)
    }

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  return {
    toast,
    toasts
  }
}