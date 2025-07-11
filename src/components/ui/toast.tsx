"use client"

import * as React from "react"
import { cn } from "../../lib/utils"

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

export function Toast({
  open,
  onOpenChange,
  title,
  description,
  action,
  variant = "default",
  className,
  ...props
}: ToastProps) {
  React.useEffect(() => {
    if (!open) return
    const timeout = setTimeout(() => onOpenChange(false), 3000)
    return () => clearTimeout(timeout)
  }, [open, onOpenChange])

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 min-w-[280px] max-w-xs rounded-lg shadow-lg border p-4 bg-background text-foreground flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-4 duration-300",
        variant === "destructive" && "border-red-500 bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-100",
        className
      )}
      role="alert"
      {...props}
    >
      <div className="font-semibold text-base">{title}</div>
      {description && <div className="text-sm text-muted-foreground">{description}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
} 