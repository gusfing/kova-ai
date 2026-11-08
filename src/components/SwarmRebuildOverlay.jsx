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
                    // 1. Draw subtle bounding box when drawing a component
                    if (boid.box && boid.boxProgress > 0) {
                        ctx.save()
                        ctx.strokeStyle = boid.color
                        ctx.lineWidth = 1.2
                        ctx.setLineDash([4, 4])
                        ctx.strokeRect(
                            boid.box.x,
                            boid.box.y,
                            boid.box.w * boid.boxProgress,
                            boid.box.h * boid.boxProgress
                        )
                        ctx.restore()
                    }

                    // 2. Draw Figma-Style Cursor Arrow
                    ctx.save()
                    ctx.translate(boid.x, boid.y)

                    ctx.shadowColor = 'rgba(0,0,0,0.4)'
                    ctx.shadowBlur = 6
                    ctx.shadowOffsetY = 2

                    ctx.beginPath()
                    ctx.moveTo(0, 0)
                    ctx.lineTo(0, 15)
                    ctx.lineTo(4, 11)
                    ctx.lineTo(8, 18)
                    ctx.lineTo(11, 16)
                    ctx.lineTo(7, 9)
                    ctx.lineTo(13, 9)
                    ctx.closePath()

                    ctx.fillStyle = boid.color
                    ctx.fill()
                    ctx.strokeStyle = '#ffffff'
                    ctx.lineWidth = 1.2
                    ctx.stroke()
                    ctx.restore()

                    // 3. Draw Agent Name & Activity Pill Badge
                    ctx.save()
                    const badgeX = boid.x + 14
                    const badgeY = boid.y + 12
                    const text = `${boid.name}: ${boid.actionLabel}`
                    ctx.font = '600 11px system-ui, -apple-system, sans-serif'
                    const textWidth = ctx.measureText(text).width
                    const badgeWidth = textWidth + 16
                    const badgeHeight = 22

                    ctx.beginPath()
                    if (ctx.roundRect) {
                        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 11)
                    } else {
                        ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight)
                    }
                    ctx.fillStyle = boid.color
                    ctx.fill()
                    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
                    ctx.lineWidth = 1
                    ctx.stroke()

                    // Text
                    ctx.fillStyle = '#ffffff'
                    ctx.fillText(text, badgeX + 8, badgeY + 15)

                    // Blinking caret
                    if (boid.caretBlink < 30) {
                        ctx.fillStyle = '#ffffff'
                        ctx.fillRect(badgeX + 8 + textWidth + 2, badgeY + 6, 2, 10)
                    }

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
