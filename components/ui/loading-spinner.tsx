"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"

interface LoadingSpinnerProps {
  text?: string
  showProgress?: boolean
}

export function LoadingSpinner({ text = "Loading", showProgress = true }: LoadingSpinnerProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return prev
        }
        return prev + Math.random() * 15
      })
    }, 200)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      {/* Animated Spinner */}
      <div className="relative">
        <motion.div
          className="w-16 h-16 rounded-full border-4 border-[#3d3f56]"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-[#F7E733]"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 w-12 h-12 rounded-full border-4 border-transparent border-t-[#1BE7FF]"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="w-48 space-y-2">
          <div className="h-1.5 w-full bg-[#3d3f56] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#F7E733] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-center text-gray-500 font-mono">
            {Math.round(Math.min(progress, 100))}%
          </p>
        </div>
      )}

      {/* Loading Text */}
      <motion.p
        className="text-gray-400 font-medium text-sm"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {text}...
      </motion.p>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#3d3f56] bg-[#2B2D42] p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 bg-[#3d3f56] rounded" />
        <div className="h-10 w-10 bg-[#3d3f56] rounded-xl" />
      </div>
      <div className="h-8 w-20 bg-[#3d3f56] rounded" />
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="rounded-xl border border-[#3d3f56] bg-[#2B2D42] p-6 space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center space-x-3 pb-4 border-b border-[#3d3f56]">
        <div className="h-8 w-8 bg-[#3d3f56] rounded-lg animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-32 bg-[#3d3f56] rounded animate-pulse" />
          <div className="h-3 w-48 bg-[#3d3f56] rounded animate-pulse" />
        </div>
      </div>
      {/* Table header skeleton */}
      <div className="flex items-center space-x-4 py-2">
        <div className="h-3 w-10 bg-[#3d3f56] rounded animate-pulse" />
        <div className="flex-1 h-3 bg-[#3d3f56] rounded animate-pulse" />
        <div className="h-3 w-14 bg-[#3d3f56] rounded animate-pulse" />
        <div className="h-3 w-8 bg-[#3d3f56] rounded animate-pulse" />
        <div className="h-3 w-8 bg-[#3d3f56] rounded animate-pulse" />
        <div className="h-3 w-8 bg-[#3d3f56] rounded animate-pulse" />
        <div className="h-3 w-8 bg-[#3d3f56] rounded animate-pulse" />
      </div>
      {/* Rows skeleton */}
      <div className="space-y-3 pt-2">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className="flex items-center space-x-4 py-2 animate-pulse" 
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="h-6 w-12 bg-[#3d3f56] rounded-md" />
            <div className="flex-1 h-4 bg-[#3d3f56] rounded" />
            <div className="h-6 w-14 bg-[#3d3f56] rounded" />
            <div className="h-7 w-7 bg-[#3d3f56] rounded-lg" />
            <div className="h-7 w-7 bg-[#3d3f56] rounded-lg" />
            <div className="h-7 w-7 bg-[#3d3f56] rounded-lg" />
            <div className="h-7 w-7 bg-[#3d3f56] rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
