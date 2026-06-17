"use client"

import React from "react"

export function Loader({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-6 ${className}`}>
      {/* Animated Cake Logo */}
      <div className="relative animate-bounce duration-1000 ease-in-out">
        <svg
          width="100"
          height="100"
          viewBox="0 0 140 140"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-md"
        >
          {/* Swirl / Cream on top */}
          <path
            d="M 68 18 C 68 10, 82 10, 82 22 C 82 30, 68 32, 68 40 C 68 44, 76 46, 80 44"
            stroke="#a2414f"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-pulse"
          />
          
          {/* Cake Slice Body */}
          <path
            d="M 45 42 L 95 42 C 105 42, 115 50, 115 62 L 115 95 C 115 102, 105 106, 95 106 L 45 106 C 41 106, 38 103, 38 98 L 38 50 C 38 45, 41 42, 45 42 Z"
            stroke="#a2414f"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="#fee2e2"
          />

          {/* Isometric slice line */}
          <path
            d="M 38 50 L 68 65 L 115 65"
            stroke="#a2414f"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Layer 1 (Filling) */}
          <path
            d="M 38 68 L 115 68"
            stroke="#a2414f"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="6 4"
          />

          {/* Layer 2 (Filling) */}
          <path
            d="M 38 86 L 115 86"
            stroke="#a2414f"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="6 4"
          />
        </svg>
        
        {/* Shadow under the cake */}
        <div className="absolute -bottom-1 left-1/2 h-1.5 w-16 -translate-x-1/2 rounded-full bg-black/10 blur-[2px] animate-pulse" />
      </div>

      {/* Animated Text */}
      <div className="flex flex-col items-center">
        <span 
          className="font-heading text-lg font-bold tracking-[0.25em] text-[#a2414f] uppercase animate-pulse select-none"
          style={{ animationDuration: "1.8s" }}
        >
          Bizcochao
        </span>
        <span className="text-[10px] tracking-wider text-muted-foreground uppercase mt-0.5">
          Cargando...
        </span>
      </div>
    </div>
  )
}
