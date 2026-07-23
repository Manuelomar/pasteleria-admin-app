import React from "react"
import { Loader } from "./loader"
import { cn } from "@/lib/utils"

export function LoadingOverlay({ active, className }: { active: boolean; className?: string }) {
  if (!active) return null;
  return (
    <div className={cn("fixed inset-0 z-[100] flex items-center justify-center bg-background/20", className)}>
      <div className="flex items-center justify-center">
        <Loader />
      </div>
    </div>
  )
}
