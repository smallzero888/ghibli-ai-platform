'use client'

import { useEffect, useRef, useState } from 'react'

interface Point {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

interface Line {
  from: Point
  to: Point
  opacity: number
}

export function CanvasSpiderWeb() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [points, setPoints] = useState<Point[]>([])
  const [lines, setLines] = useState<Line[]>([])
  const animationRef = useRef<number>(0)
  const mousePos = useRef({ x: -100, y: -100 })
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // 初始化点
  useEffect(() => {
    const initPoints = () => {
      if (!canvasRef.current) return
      
      const width = window.innerWidth
      const height = window.innerHeight
      setDimensions({ width, height })
      
      // 创建随机点
      const newPoints: Point[] = []
      const pointCount = Math.floor((width * height) / 15000) // 根据屏幕大小调整点数量
      
      for (let i = 0; i < pointCount; i++) {
        newPoints.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1
        })
      }
      
      setPoints(newPoints)
    }

    initPoints()
    window.addEventListener('resize', initPoints)
    
    return () => {
      window.removeEventListener('resize', initPoints)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // 鼠标移动事件
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  // 动画循环
  useEffect(() => {
    if (!canvasRef.current || points.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = dimensions.width
    canvas.height = dimensions.height

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 更新点位置
      const updatedPoints = points.map(point => {
        let { x, y, vx, vy, radius } = point
        
        // 边界反弹
        if (x <= 0 || x >= canvas.width) vx = -vx
        if (y <= 0 || y >= canvas.height) vy = -vy
        
        // 更新位置
        x += vx
        y += vy
        
        return { ...point, x, y, vx, vy }
      })

      // 创建线条
      const newLines: Line[] = []
      
      // 点之间的连线
      for (let i = 0; i < updatedPoints.length; i++) {
        for (let j = i + 1; j < updatedPoints.length; j++) {
          const p1 = updatedPoints[i]
          const p2 = updatedPoints[j]
          const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
          
          // 只连接距离较近的点
          if (distance < 150) {
            const opacity = 1 - distance / 150
            newLines.push({ from: p1, to: p2, opacity })
          }
        }
      }

      // 鼠标与点的连线
      for (const point of updatedPoints) {
        const distance = Math.sqrt(
          Math.pow(mousePos.current.x - point.x, 2) + 
          Math.pow(mousePos.current.y - point.y, 2)
        )
        
        if (distance < 200) {
          const opacity = 1 - distance / 200
          newLines.push({
            from: { ...point },
            to: { ...mousePos.current, vx: 0, vy: 0, radius: 0 },
            opacity
          })
        }
      }

      // 绘制线条
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'
      ctx.lineWidth = 1
      
      for (const line of newLines) {
        ctx.globalAlpha = line.opacity * 0.5
        ctx.beginPath()
        ctx.moveTo(line.from.x, line.from.y)
        ctx.lineTo(line.to.x, line.to.y)
        ctx.stroke()
      }

      // 绘制点
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      for (const point of updatedPoints) {
        ctx.globalAlpha = 0.8
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      setPoints(updatedPoints)
      setLines(newLines)
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [points, dimensions])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  )
}