"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ArrowRightIcon } from "lucide-react"

interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface BentoCardProps {
  name: string
  description?: string
  Icon?: React.ElementType
  href?: string
  cta?: string
  background?: React.ReactNode
  colSpan?: 1 | 2 | 3
  rowSpan?: 1 | 2
  className?: string
}

export function BentoGrid({ children, className, ...props }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[14rem] grid-cols-3 gap-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function BentoCard({
  name,
  description,
  Icon,
  href,
  cta,
  background,
  className,
  colSpan = 1,
  rowSpan = 1,
}: BentoCardProps) {
  const colSpanClass = {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3",
  }[colSpan]

  const rowSpanClass = {
    1: "md:row-span-1",
    2: "md:row-span-2",
  }[rowSpan]

  const baseClassName = cn(
    "group relative col-span-3 flex flex-col justify-between overflow-hidden rounded-xl",
    // base styles
    "bg-zinc-900/80 border border-zinc-800/60",
    // hover styles
    "transform-gpu transition-all duration-300 hover:scale-[1.02] hover:border-zinc-700 hover:shadow-xl hover:shadow-black/30",
    colSpanClass,
    rowSpanClass,
    className
  )

  const content = (
    <>
      {/* Background layer */}
      <div className="absolute inset-0 overflow-hidden">{background}</div>

      {/* Content layer */}
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-1">
        {Icon && (
          <Icon className="h-10 w-10 origin-left transform-gpu text-zinc-400 transition-all duration-300 ease-in-out group-hover:scale-90 group-hover:text-zinc-200" />
        )}
        <h3 className="text-lg font-semibold text-zinc-100">{name}</h3>
        {description && (
          <p className="max-w-lg text-sm text-zinc-400">{description}</p>
        )}
      </div>

      {/* CTA layer */}
      {cta && (
        <div
          className={cn(
            "pointer-events-none absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          )}
        >
          <span className="text-sm font-medium text-green-400 flex items-center gap-1">
            {cta}
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </span>
        </div>
      )}

      {/* Hover gradient overlay */}
      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-zinc-800/10" />
    </>
  )

  if (href) {
    return (
      <a href={href} className={baseClassName}>
        {content}
      </a>
    )
  }

  return (
    <div className={baseClassName}>
      {content}
    </div>
  )
}

// Compact variant for navigation cards
export function BentoNavCard({
  name,
  Icon,
  href,
  className,
  iconColor = "text-zinc-400",
  ...props
}: {
  name: string
  Icon: React.ElementType
  href: string
  iconColor?: string
} & React.HTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      className={cn(
        "group relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl",
        "bg-zinc-900/60 border border-zinc-800/50",
        "transform-gpu transition-all duration-300",
        "hover:scale-105 hover:bg-zinc-800/60 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20",
        className
      )}
      {...props}
    >
      <Icon
        className={cn(
          "h-6 w-6 transition-all duration-300 group-hover:scale-110",
          iconColor
        )}
      />
      <span className="text-xs font-medium text-zinc-300 group-hover:text-zinc-100 transition-colors">
        {name}
      </span>
    </a>
  )
}
