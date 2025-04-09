import Link from "next/link"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  linkClassName?: string
  showText?: boolean
  size?: "sm" | "md" | "lg"
}

export function Logo({ className, linkClassName, showText = true, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <div className={cn("flex items-center", className)}>
      <Link href="/" className={cn("flex items-center gap-2 font-bold", linkClassName)}>
        <div className="relative flex items-center">
          {showText && (
            <div className={cn("flex items-center font-bold", sizeClasses[size])}>
              <span className="text-[#f58220]">Uni</span>
              <span className="text-[#0a2472]">store</span>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}
