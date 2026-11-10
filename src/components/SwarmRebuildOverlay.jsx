import React, { useEffect, useRef } from 'react'
import { SwarmSimulation } from '../lib/swarmPhysics'

export function SwarmRebuildOverlay({ active = false, currentFile = null, className = '' }) {
    const canvasRef = useRef(null)
    const simRef = useRef(null)
    const animIdRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const updateDimensions = () => {
            const rect = canvas.getBoundingClientRect()
            const w = rect.width || canvas.parentElement?.clientWidth || 800
            const h = rect.height || canvas.parentElement?.clientHeight || 600
            const dpr = window.devicePixelRatio || 1

            canvas.width = w * dpr
            canvas.height = h * dpr

            if (simRef.current) {
                simRef.current.resize(w, h)
            } else {
                simRef.current = new SwarmSimulation(w, h)
            }
        }

        updateDimensions()
        const observer = new ResizeObserver(() => updateDimensions())
        if (canvas.parentElement) {
            observer.observe(canvas.parentElement)
        } else {
            observer.observe(canvas)
        }

        return () => {
            observer.disconnect()
            if (animIdRef.current) cancelAnimationFrame(animIdRef.current)
        }
    }, [])

    useEffect(() => {
        if (!simRef.current) {
            const canvas = canvasRef.current
            const rect = canvas ? canvas.getBoundingClientRect() : { width: 800, height: 600 }
            simRef.current = new SwarmSimulation(rect.width || 800, rect.height || 600)
        }

        if (active) {
            simRef.current.start()
            if (currentFile) {
                simRef.current.triggerBuildStep(currentFile)
            }
        } else {
            simRef.current.stop()
        }
    }, [active, currentFile])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')

        const render = () => {
            const dpr = window.devicePixelRatio || 1
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            if (simRef.current && (active || simRef.current.active)) {
                simRef.current.update()

                ctx.save()
                ctx.scale(dpr, dpr)

                simRef.current.boids.forEach(boid => {
                    // 1. Draw Figma-Style Pointer Arrow
                    ctx.save()
                    ctx.translate(boid.x, boid.y)

                    ctx.shadowColor = 'rgba(0,0,0,0.35)'
                    ctx.shadowBlur = 4
                    ctx.shadowOffsetY = 2

                    ctx.beginPath()
                    ctx.moveTo(0, 0)
                    ctx.lineTo(0, 13)
                    ctx.lineTo(3.5, 9.5)
                    ctx.lineTo(7, 15)
                    ctx.lineTo(9.5, 13.5)
                    ctx.lineTo(6, 8)
                    ctx.lineTo(11, 8)
                    ctx.closePath()

                    ctx.fillStyle = boid.color
                    ctx.fill()
                    ctx.strokeStyle = '#ffffff'
                    ctx.lineWidth = 1
                    ctx.stroke()
                    ctx.restore()

                    // 2. Draw Compact Name Pill (Figma style, no bulky box)
                    ctx.save()
                    const badgeX = boid.x + 10
                    const badgeY = boid.y + 10
                    const displayName = boid.name.split(' ')[0] // e.g. "Architect", "UI", "Tailwind", "WordPress"
                    ctx.font = '600 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    const textWidth = ctx.measureText(displayName).width
                    const badgeWidth = textWidth + 10
                    const badgeHeight = 16

                    ctx.beginPath()
                    if (ctx.roundRect) {
                        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 4)
                    } else {
                        ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight)
                    }
                    ctx.fillStyle = boid.color
                    ctx.fill()
                    ctx.shadowColor = 'rgba(0,0,0,0.25)'
                    ctx.shadowBlur = 3

                    // Text inside badge
                    ctx.fillStyle = '#ffffff'
                    ctx.fillText(displayName, badgeX + 5, badgeY + 12)

                    ctx.restore()
                })

                ctx.restore()
            }

            animIdRef.current = requestAnimationFrame(render)
        }

        animIdRef.current = requestAnimationFrame(render)

        return () => {
            if (animIdRef.current) cancelAnimationFrame(animIdRef.current)
        }
    }, [active])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 40,
                display: active ? 'block' : 'none'
            }}
            className={className}
        />
    )
}

export default SwarmRebuildOverlay
