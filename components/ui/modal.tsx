"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { X } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  const [isClosing, setIsClosing] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const startY = useRef<number | null>(null)
  const currentY = useRef<number | null>(null)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      setIsClosing(false)
      onClose()
    }, 300)
  }

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose()
    }
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
    currentY.current = startY.current
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current === null) return
    currentY.current = e.touches[0].clientY

    const diff = currentY.current - startY.current
    if (diff > 0) {
      modalRef.current!.style.transform = `translateY(${diff}px)`
    }
  }

  const handleTouchEnd = () => {
    if (startY.current === null || currentY.current === null) return

    const diff = currentY.current - startY.current
    if (diff > 100) {
      handleClose()
    } else {
      modalRef.current!.style.transform = ""
    }

    startY.current = null
    currentY.current = null
  }

  if (!isOpen && !isClosing) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleOutsideClick}
    >
      {isMobile ? (
        <div
          ref={modalRef}
          className={`bottom-sheet w-full max-h-[90vh] overflow-auto ${
            isClosing ? "animate-slide-down" : "animate-slide-up"
          }`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="bottom-sheet-handle" />
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold">{title}</h2>
              <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">{children}</div>
        </div>
      ) : (
        <div
          ref={modalRef}
          className={`bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto transition-all duration-300 ${
            isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-semibold">{title}</h2>
              <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">{children}</div>
        </div>
      )}
    </div>
  )
}
