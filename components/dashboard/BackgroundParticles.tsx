'use client'

import React, { useEffect, useRef } from 'react'

export function BackgroundParticles() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let ww = window.innerWidth
        let wh = window.innerHeight
        const partCount = 150 // Increased count for a more dense effect
        let particles: Particle[] = []
        let animationFrameId: number

        class Particle {
            x: number
            y: number
            direction: { x: number; y: number }
            vx: number
            vy: number
            radius: number
            color: string

            constructor() {
                this.color = `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.1})`
                this.x = Math.random() * ww
                this.y = Math.random() * wh
                this.direction = {
                    x: -1 + Math.random() * 2,
                    y: -1 + Math.random() * 2
                }
                this.vx = 0.2 * Math.random() + 0.1
                this.vy = 0.2 * Math.random() + 0.1
                this.radius = Math.random() * 1.5 + 1
            }

            float() {
                this.x += this.vx * this.direction.x
                this.y += this.vy * this.direction.y
            }

            boundaryCheck() {
                if (this.x >= ww) {
                    this.x = ww
                    this.direction.x *= -1
                } else if (this.x <= 0) {
                    this.x = 0
                    this.direction.x *= -1
                }
                if (this.y >= wh) {
                    this.y = wh
                    this.direction.y *= -1
                } else if (this.y <= 0) {
                    this.y = 0
                    this.direction.y *= -1
                }
            }

            draw() {
                if (!ctx) return
                ctx.beginPath()
                ctx.fillStyle = this.color
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
                ctx.fill()
            }
        }

        const init = () => {
            ww = window.innerWidth
            wh = window.innerHeight
            canvas.width = ww
            canvas.height = wh
            particles = []
            for (let i = 0; i < partCount; i++) {
                particles.push(new Particle())
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, ww, wh)
            for (const p of particles) {
                p.float()
                p.boundaryCheck()
                p.draw()
            }
            animationFrameId = requestAnimationFrame(animate)
        }

        const handleResize = () => {
            init()
        }

        init()
        animate()
        window.addEventListener('resize', handleResize)

        return () => {
            cancelAnimationFrame(animationFrameId)
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: 0.6 }}
        />
    )
}
