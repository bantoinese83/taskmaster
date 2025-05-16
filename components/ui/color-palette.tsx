"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

// Predefined color palette
export const colorPalette = [
  // Blues
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  // Greens
  "#16a34a",
  "#22c55e",
  "#4ade80",
  "#86efac",
  // Reds
  "#dc2626",
  "#ef4444",
  "#f87171",
  "#fca5a5",
  // Yellows
  "#ca8a04",
  "#eab308",
  "#facc15",
  "#fde047",
  // Purples
  "#7c3aed",
  "#8b5cf6",
  "#a78bfa",
  "#c4b5fd",
  // Pinks
  "#db2777",
  "#ec4899",
  "#f472b6",
  "#f9a8d4",
  // Oranges
  "#ea580c",
  "#f97316",
  "#fb923c",
  "#fdba74",
  // Teals
  "#0d9488",
  "#14b8a6",
  "#2dd4bf",
  "#5eead4",
  // Grays
  "#4b5563",
  "#6b7280",
  "#9ca3af",
  "#d1d5db",
]

interface ColorPaletteProps {
  value: string
  onChange: (color: string) => void
  className?: string
}

export function ColorPalette({ value, onChange, className }: ColorPaletteProps) {
  return (
    <div className={cn("grid grid-cols-8 gap-2", className)}>
      {colorPalette.map((color) => (
        <button
          key={color}
          type="button"
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center border transition-all",
            value === color ? "border-2 border-primary" : "border-muted hover:scale-110",
          )}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
          aria-label={`Select color ${color}`}
        >
          {value === color && <Check className="h-4 w-4 text-white" />}
        </button>
      ))}
    </div>
  )
}
