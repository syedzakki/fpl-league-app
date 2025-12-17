"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogContextValue {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined)

const Dialog = ({ 
  open, 
  onOpenChange, 
  children 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode 
}) => {
  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  )
}

const DialogTrigger = ({ 
  children, 
  asChild 
}: { 
  children: React.ReactNode
  asChild?: boolean 
}) => {
  const context = React.useContext(DialogContext)
  if (!context) throw new Error("DialogTrigger must be used within Dialog")
  
  return (
    <div onClick={() => context.onOpenChange(true)}>
      {children}
    </div>
  )
}

const DialogOverlay = ({ className }: { className?: string }) => {
  const context = React.useContext(DialogContext)
  if (!context) return null
  
  if (!context.open) return null
  
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in-0",
        className
      )}
      onClick={() => context.onOpenChange(false)}
    />
  )
}

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(DialogContext)
  if (!context) return null
  
  if (!context.open) return null
  
  return (
    <>
      <DialogOverlay />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={ref}
          className={cn(
            "relative z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto gap-4 border bg-white dark:bg-[#1A1F16] border-[#DBC2CF] dark:border-[#19297C] p-6 shadow-lg rounded-lg animate-in fade-in-0 zoom-in-95",
            className
          )}
          {...props}
        >
          {children}
          <button
            onClick={() => context.onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#19297C] focus:ring-offset-2"
          >
            <X className="h-4 w-4 text-[#1A1F16] dark:text-[#FFFCF2]" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </div>
    </>
  )
})
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left mb-4",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-[#1A1F16] dark:text-[#FFFCF2]",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-[#19297C] dark:text-[#DBC2CF]", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}

