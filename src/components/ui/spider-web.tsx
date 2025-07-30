'use client'

import { useEffect, useRef } from 'react'

interface SpiderWebProps {
  className?: string
}

export function SpiderWeb({ className = '' }: SpiderWebProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Mouse tracking
    const mouse = {
      x: null as number | null,
      y: null as number | null,
      max: 20000
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    const handleMouseOut = () => {
      mouse.x = null
      mouse.y = null
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseout', handleMouseOut)

    // Create particles
    const dots: Array<{
      x: number
      y: number
      xv: number
      yv: number
      max: number
    }> = []

    for (let i = 0; i < 150; i++) {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      const xv = Math.random() * 2 - 1
      const yv = Math.random() * 2 - 1
      dots.push({
        x,
        y,
        xv,
        yv,
        max: 6000
      })
    }

    // Animation function
    const create = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const ndots = [mouse].concat(dots)

      dots.forEach((dot) => {
        // Update particle position
        dot.x += dot.xv
        dot.y += dot.yv

        // Bounce off walls
        dot.xv *= (dot.x > canvas.width || dot.x < 0) ? -1 : 1
        dot.yv *= (dot.y > canvas.height || dot.y < 0) ? -1 : 1

        // Draw particle
        // Use theme colors for particles
        ctx.fillStyle = 'rgba(34, 197, 94, 0.8)' // ghibli-green
        ctx.fillRect(dot.x - 0.5, dot.y - 0.5, 1, 1)

        // Draw connections
        for (let i = 0; i < ndots.length; i++) {
          const now = ndots[i]
          if (dot === now || now.x === null || now.y === null) {
            continue
          }

          const disX = dot.x - now.x
          const disY = dot.y - now.y
          const dis = disX * disX + disY * disY

          if (dis < now.max) {
            // Move particles towards mouse
            if (now === mouse && dis > now.max / 2) {
              dot.x -= disX * 0.03
              dot.y -= disY * 0.03
            }

            const scale = (now.max - dis) / now.max
            ctx.beginPath()
            ctx.lineWidth = scale / 2
            
            const gradient = ctx.createLinearGradient(dot.x, dot.y, now.x, now.y)
            gradient.addColorStop(0, 'rgba(34, 197, 94, 0.6)') // ghibli-green
            gradient.addColorStop(0.3, 'rgba(34, 197, 94, 0.1)')
            gradient.addColorStop(0.6, 'rgba(34, 197, 94, 0.1)')
            gradient.addColorStop(1, 'rgba(34, 197, 94, 0.6)')
            ctx.strokeStyle = gradient
            
            ctx.moveTo(dot.x, dot.y)
            ctx.lineTo(now.x, now.y)
            ctx.stroke()
          }
        }

        ndots.splice(ndots.indexOf(dot), 1)
      })

      animationId = requestAnimationFrame(create)
    }

    let animationId = requestAnimationFrame(create)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseout', handleMouseOut)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className={`fixed inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  )
}
