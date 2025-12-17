"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Toast {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "success" | "error" | "warning"
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { ...toast, id }
    setToasts((prev) => [...prev, newToast])

    // Auto remove after duration
    const duration = toast.duration || 3000
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[]
  removeToast: (id: string) => void
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none sm:bottom-6 sm:right-6">
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
          style={{ animationDelay: `${index * 100}ms` }}
        />
      ))}
    </div>
  )
}

function ToastItem({
  toast,
  onClose,
  style,
}: {
  toast: Toast
  onClose: () => void
  style?: React.CSSProperties
}) {
  const variantStyles = {
    default: "bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C]",
    success: "bg-[#028090]/10 dark:bg-[#028090]/20 border-[#028090]",
    error: "bg-[#F26430]/10 dark:bg-[#F26430]/20 border-[#F26430]",
    warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500",
  }

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-md gap-3 rounded-lg border p-4 shadow-lg",
        "animate-in slide-in-from-right-full",
        variantStyles[toast.variant || "default"]
      )}
      style={style}
    >
      <div className="flex-1 space-y-1">
        {toast.title && (
          <div className="text-sm font-semibold text-[#1A1F16] dark:text-[#FFFCF2]">
            {toast.title}
          </div>
        )}
        {toast.description && (
          <div className="text-sm text-[#19297C] dark:text-[#DBC2CF]">
            {toast.description}
          </div>
        )}
        {toast.action && <div className="mt-2">{toast.action}</div>}
      </div>
      <button
        onClick={onClose}
        className="text-[#19297C] dark:text-[#DBC2CF] hover:text-[#F26430] transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

