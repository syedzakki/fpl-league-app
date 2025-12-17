"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface BorderBeamProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the beam in pixels
   * @default 200
   */
  size?: number
  /**
   * Duration of the animation in seconds
   * @default 15
   */
  duration?: number
  /**
   * Anchor position of the beam (0-100)
   * @default 90
   */
  anchor?: number
  /**
   * Width of the border in pixels
   * @default 1.5
   */
  borderWidth?: number
  /**
   * Color from - start of gradient
   * @default "#ffaa40"
   */
  colorFrom?: string
  /**
   * Color to - end of gradient
   * @default "#9c40ff"
   */
  colorTo?: string
  /**
   * Delay before animation starts (in seconds)
   * @default 0
   */
  delay?: number
}

export function BorderBeam({
  className,
  size = 200,
  duration = 15,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  delay = 0,
  ...props
}: BorderBeamProps) {
  return (
    <div
      style={
        {
          "--size": size,
          "--duration": duration,
          "--anchor": anchor,
          "--border-width": borderWidth,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--delay": `-${delay}s`,
        } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent]",
        // mask styles
        "![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]",
        // pseudo element styles
        "after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-border-beam after:[animation-delay:var(--delay)] after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] after:[offset-anchor:calc(var(--anchor)*1%)_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]",
        className
      )}
      {...props}
    />
  )
}

// Preset configurations for common use cases
export const BorderBeamGold = (props: Omit<BorderBeamProps, "colorFrom" | "colorTo">) => (
  <BorderBeam colorFrom="#fbbf24" colorTo="#f59e0b" {...props} />
)

export const BorderBeamSilver = (props: Omit<BorderBeamProps, "colorFrom" | "colorTo">) => (
  <BorderBeam colorFrom="#d1d5db" colorTo="#9ca3af" {...props} />
)

export const BorderBeamBronze = (props: Omit<BorderBeamProps, "colorFrom" | "colorTo">) => (
  <BorderBeam colorFrom="#f59e0b" colorTo="#cd7f32" {...props} />
)

export const BorderBeamGreen = (props: Omit<BorderBeamProps, "colorFrom" | "colorTo">) => (
  <BorderBeam colorFrom="#22c55e" colorTo="#10b981" {...props} />
)

export const BorderBeamPurple = (props: Omit<BorderBeamProps, "colorFrom" | "colorTo">) => (
  <BorderBeam colorFrom="#a855f7" colorTo="#7c3aed" {...props} />
)

