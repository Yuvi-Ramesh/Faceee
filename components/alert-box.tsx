import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface AlertBoxProps {
  type: 'success' | 'warning' | 'info' | 'error'
  message: string
  duration?: number
}

export function AlertBox({ type, message, duration = 5000 }: AlertBoxProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration)
    return () => clearTimeout(timer)
  }, [duration])

  if (!isVisible) return null

  const config = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: CheckCircle,
      textColor: 'text-green-500',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: AlertTriangle,
      textColor: 'text-yellow-500',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
      textColor: 'text-blue-500',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: AlertCircle,
      textColor: 'text-red-500',
    },
  }

  const cfg = config[type]
  const Icon = cfg.icon

  return (
    <div className={`fade-in ${cfg.bg} border-l-4 ${cfg.border} p-4 rounded mb-4 flex items-center gap-3`}>
      <Icon className={`w-5 h-5 flex-shrink-0 ${cfg.textColor}`} />
      <p className={`${cfg.text} text-sm font-medium`}>{message}</p>
    </div>
  )
}
