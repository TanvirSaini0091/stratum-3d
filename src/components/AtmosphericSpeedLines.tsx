import React, { useEffect, useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Html, Billboard } from "@react-three/drei"
import * as THREE from "three"
import type { DescentState } from "../types/descent"

// ==========================================
// 1. STARFIELD COMPONENT (Transpiled & Fixed for React)
// ==========================================
const generateUUID = () => {
  const lut = Array(256)
    .fill("")
    .map((_, i) => (i < 16 ? "0" : "") + i.toString(16))
  const d0 = (Math.random() * 0xffffffff) | 0
  const d1 = (Math.random() * 0xffffffff) | 0
  const d2 = (Math.random() * 0xffffffff) | 0
  const d3 = (Math.random() * 0xffffffff) | 0
  return (
    lut[d0 & 0xff] +
    lut[(d0 >> 8) & 0xff] +
    lut[(d0 >> 16) & 0xff] +
    lut[(d0 >> 24) & 0xff] +
    "-" +
    lut[d1 & 0xff] +
    lut[(d1 >> 8) & 0xff] +
    "-" +
    lut[((d1 >> 16) & 0x0f) | 0x40] +
    lut[(d1 >> 24) & 0xff] +
    "-" +
    lut[(d2 & 0x3f) | 0x80] +
    lut[(d2 >> 8) & 0xff] +
    "-" +
    lut[(d2 >> 16) & 0xff] +
    lut[(d2 >> 24) & 0xff] +
    lut[d3 & 0xff] +
    lut[(d3 >> 8) & 0xff] +
    lut[(d3 >> 16) & 0xff] +
    lut[(d3 >> 24) & 0xff]
  )
}

interface StarfieldProps {
  starColor?: string
  mouseAdjust?: boolean
  tiltAdjust?: boolean
  easing?: number
  clickToWarp?: boolean
  hyperspace?: boolean
  warpFactor?: number
  speed?: number
  quantity?: number
}

const Starfield: React.FC<StarfieldProps> = ({
  starColor = "rgba(255,255,255,1)",
  easing = 1,
  hyperspace = false,
  warpFactor = 10,
  speed = 1,
  quantity = 512,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Use a ref to ensure requestAnimationFrame always reads the latest props
  const propsRef = useRef({ hyperspace, speed, warpFactor, quantity })
  useEffect(() => {
    propsRef.current = { hyperspace, speed, warpFactor, quantity }
  }, [hyperspace, speed, warpFactor, quantity])

  const [state, setState] = useState({
    init: true,
    canvas: true,
    start: true,
    stop: false,
    destroy: false,
    reset: false,
    uid: generateUUID(),
    running: false,
  })

  const mouse = useRef({ x: 0, y: 0 })
  const cursor = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number | null>(null)

  const sd = useRef({
    w: 0,
    h: 0,
    ctx: null as CanvasRenderingContext2D | null,
    cw: 0,
    ch: 0,
    x: 0,
    y: 0,
    z: 0,
    star: { colorRatio: 0, arr: [] as any[] },
    prevTime: 0,
  })

  const measureViewport = () => {
    const el = canvasRef.current?.parentElement
    if (el) {
      sd.current.w = el.clientWidth
      sd.current.h = el.clientHeight
      sd.current.x = Math.round(sd.current.w / 2)
      sd.current.y = Math.round(sd.current.h / 2)
      sd.current.z = (sd.current.w + sd.current.h) / 2
      sd.current.star.colorRatio = 1 / sd.current.z

      if (cursor.current.x === 0 || cursor.current.y === 0) {
        cursor.current.x = sd.current.x
        cursor.current.y = sd.current.y
      }
      if (mouse.current.x === 0 || mouse.current.y === 0) {
        mouse.current.x = cursor.current.x - sd.current.x
        mouse.current.y = cursor.current.y - sd.current.y
      }
    }
  }

  const setupCanvas = () => {
    measureViewport()
    const canvas = canvasRef.current
    if (canvas) {
      sd.current.ctx = canvas.getContext("2d")
      canvas.width = sd.current.w
      canvas.height = sd.current.h
      if (sd.current.ctx) {
        sd.current.ctx.strokeStyle = starColor
      }
    }
  }

  const bigBang = () => {
    const qty = propsRef.current.quantity
    if (sd.current.star.arr.length !== qty) {
      sd.current.star.arr = new Array(qty)
        .fill(0)
        .map(() => [
          Math.random() * sd.current.w * 2 - sd.current.x * 2,
          Math.random() * sd.current.h * 2 - sd.current.y * 2,
          Math.round(Math.random() * sd.current.z),
          0,
          0,
          0,
          0,
          true,
        ])
    }
  }

  const resize = () => {
    const oldStar = { ...sd.current.star }
    measureViewport()
    sd.current.cw = sd.current.ctx?.canvas.width || 0
    sd.current.ch = sd.current.ctx?.canvas.height || 0

    if (sd.current.cw !== sd.current.w || sd.current.ch !== sd.current.h) {
      sd.current.x = Math.round(sd.current.w / 2)
      sd.current.y = Math.round(sd.current.h / 2)
      sd.current.z = (sd.current.w + sd.current.h) / 2
      sd.current.star.colorRatio = 1 / sd.current.z

      const rw = sd.current.w / sd.current.cw
      const rh = sd.current.h / sd.current.ch

      if (sd.current.ctx) {
        sd.current.ctx.canvas.width = sd.current.w
        sd.current.ctx.canvas.height = sd.current.h
        sd.current.ctx.strokeStyle = starColor
      }

      if (!sd.current.star.arr.length) {
        bigBang()
      } else {
        const ratio = propsRef.current.quantity / 2
        sd.current.star.arr = sd.current.star.arr.map((star, i) => {
          const newStar = [...star]
          if (oldStar.arr[i]) {
            newStar[0] = oldStar.arr[i][0] * rw
            newStar[1] = oldStar.arr[i][1] * rh
          }
          newStar[3] = sd.current.x + (newStar[0] / newStar[2]) * ratio
          newStar[4] = sd.current.y + (newStar[1] / newStar[2]) * ratio
          return newStar
        })
      }
    }
  }

  const update = () => {
    mouse.current.x = (cursor.current.x - sd.current.x) / easing
    mouse.current.y = (cursor.current.y - sd.current.y) / easing

    const currentProps = propsRef.current
    const compSpeed = currentProps.hyperspace
      ? currentProps.speed * currentProps.warpFactor
      : currentProps.speed
    const ratio = currentProps.quantity / 2

    if (sd.current.star.arr.length > 0) {
      sd.current.star.arr = sd.current.star.arr.map((star) => {
        const newStar = [...star]
        newStar[7] = true
        newStar[5] = newStar[3]
        newStar[6] = newStar[4]
        newStar[0] += mouse.current.x >> 4

        if (newStar[0] > sd.current.x << 1) {
          newStar[0] -= sd.current.w << 1
          newStar[7] = false
        }
        if (newStar[0] < -sd.current.x << 1) {
          newStar[0] += sd.current.w << 1
          newStar[7] = false
        }

        newStar[1] += mouse.current.y >> 4
        if (newStar[1] > sd.current.y << 1) {
          newStar[1] -= sd.current.h << 1
          newStar[7] = false
        }
        if (newStar[1] < -sd.current.y << 1) {
          newStar[1] += sd.current.h << 1
          newStar[7] = false
        }

        newStar[2] -= compSpeed
        if (newStar[2] > sd.current.z) {
          newStar[2] -= sd.current.z
          newStar[7] = false
        }
        if (newStar[2] < 0) {
          newStar[2] += sd.current.z
          newStar[7] = false
        }

        newStar[3] = sd.current.x + (newStar[0] / newStar[2]) * ratio
        newStar[4] = sd.current.y + (newStar[1] / newStar[2]) * ratio
        return newStar
      })
    }
  }

  const draw = () => {
    const ctx = sd.current.ctx
    if (!ctx) return

    // ClearRect explicitly keeps the canvas background entirely transparent
    // so the 3D scene (Earth, Sun, etc.) beneath it is visible.
    ctx.clearRect(0, 0, sd.current.w, sd.current.h)
    ctx.strokeStyle = starColor

    sd.current.star.arr.forEach((star) => {
      if (
        star[5] > 0 &&
        star[5] < sd.current.w &&
        star[6] > 0 &&
        star[6] < sd.current.h &&
        star[7]
      ) {
        ctx.lineWidth = (1 - sd.current.star.colorRatio * star[2]) * 2
        ctx.beginPath()
        ctx.moveTo(star[5], star[6])
        ctx.lineTo(star[3], star[4])
        ctx.stroke()
        ctx.closePath()
      }
    })
  }

  const animate = () => {
    if (sd.current.prevTime === 0) {
      sd.current.prevTime = Date.now()
    }
    resize()
    update()
    draw()
    animationFrameRef.current = requestAnimationFrame(animate)
  }

  const init = () => {
    measureViewport()
    setupCanvas()
    bigBang()
    animate()
    setState((prev) => ({ ...prev, running: true }))
  }

  const stop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      setState((prev) => ({ ...prev, running: false }))
    }
  }

  const reset = () => {
    stop()
    sd.current.star.arr = []
    init()
  }

  const destroy = () => {
    stop()
    sd.current = {
      w: 0,
      h: 0,
      ctx: null,
      cw: 0,
      ch: 0,
      x: 0,
      y: 0,
      z: 0,
      star: { colorRatio: 0, arr: [] },
      prevTime: 0,
    }
  }

  useEffect(() => {
    init()
    return () => {
      destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (state.reset) {
      reset()
      setState((prev) => ({ ...prev, reset: false }))
    }
    if (state.stop) {
      stop()
      setState((prev) => ({ ...prev, stop: false }))
    }
    if (state.start) {
      init()
      setState((prev) => ({ ...prev, start: false }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.reset, state.stop, state.start])

  return (
    <div style={{ position: "absolute", width: "100%", height: "100%" }}>
      <canvas ref={canvasRef} />
    </div>
  )
}

// ==========================================
// 2. WARP DRIVE SHADER (R3F implementation)
// ==========================================
function WarpDriveTunnel({ active }: { active: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.iTime.value = clock.getElapsedTime()

      // Slowly fade in/out based on active state
      materialRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uOpacity.value,
        active ? 1.0 : 0.0,
        0.02
      )
    }
  })

  return (
    <Billboard position={[0, 0, 0]} renderOrder={1}>
      <mesh>
        {/* A large plane that will cover the screen but physically exist at the Earth's center */}
        <planeGeometry args={[30, 30]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv; // Standard Three.js UV from 0 to 1
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            precision highp float;
            uniform float iTime;
            uniform float uOpacity;
            
            varying vec2 vUv;

            void main() {
              // Center UV from -0.5 to 0.5
              // No aspect ratio scaling needed because the plane is a perfect 30x30 square!
              // This guarantees the tunnel is perfectly circular and physically locked to the Earth.
              vec2 uv = vUv - 0.5;
              
              // Time warp
              float t = iTime * 0.5;

              // Tunnel effect (Original RGB split style)
              vec3 finalColor = vec3(0.0);
              float offset = 0.01;
              finalColor.r = pow(fract(0.5 / length(uv + vec2(offset, 0.0)) + t * 2.0), 15.0);
              finalColor.g = pow(fract(0.5 / length(uv)                  + t * 2.0), 15.0);
              finalColor.b = pow(fract(0.5 / length(uv - vec2(offset, 0.0)) + t * 2.0), 15.0);

              // Perfect hole in the center for the Earth!
              // Plane is 30x30. length(uv) = 0.5 is 15 units.
              // Earth radius is ~2.0. So radius in UV space is 2.0 / 30.0 = 0.066.
              // We make the hole smoothly fade out between 0.08 and 0.12 so the Earth sits perfectly inside.
              float fade = smoothstep(0.08, 0.12, length(uv));
              finalColor *= fade;

              // To make the black background transparent, use the color intensity for alpha
              float intensity = max(finalColor.r, max(finalColor.g, finalColor.b));
              
              gl_FragColor = vec4(finalColor, intensity * uOpacity);
            }
          `}
          uniforms={{
            iTime: { value: 0 },
            uOpacity: { value: 0 },
          }}
          transparent
          depthWrite={false}
          depthTest={false} // Disable depth test so it draws over the Earth, the hole reveals the Earth
          // We use default NormalBlending now so colors stay exactly as originally coded
        />
      </mesh>
    </Billboard>
  )
}

// ==========================================
// 3. MAIN COMPONENT EXPORT
// ==========================================
export function AtmosphericSpeedLines({
  descentState,
}: {
  descentState: DescentState
}) {
  const isDiving = descentState === "diving"

  return (
    <>
      <WarpDriveTunnel active={isDiving} />

      <Html fullscreen pointerEvents="none" zIndexRange={[0, 0]}>
        <div
          className="h-full w-full transition-opacity duration-[2000ms] ease-in-out"
          style={{ opacity: isDiving ? 1 : 0 }}
        >
          <Starfield
            hyperspace={isDiving}
            speed={isDiving ? 3 : 0.5}
            warpFactor={8}
            quantity={800}
          />
        </div>
      </Html>
    </>
  )
}
