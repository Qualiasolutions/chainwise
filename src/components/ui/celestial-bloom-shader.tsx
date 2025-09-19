"use client"

import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'

interface CelestialBloomShaderProps {
  className?: string
}

const CelestialBloomShader: React.FC<CelestialBloomShaderProps> = ({ className }) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const animationRef = useRef<number>()

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    rendererRef.current = renderer
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setClearColor(0x000000, 0)
    mountRef.current.appendChild(renderer.domElement)

    // Shader material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(mountRef.current.clientWidth, mountRef.current.clientHeight) }
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;

        vec3 palette(float t) {
          vec3 a = vec3(0.5, 0.5, 0.5);
          vec3 b = vec3(0.5, 0.5, 0.5);
          vec3 c = vec3(1.0, 1.0, 1.0);
          vec3 d = vec3(0.263, 0.416, 0.557);
          return a + b * cos(6.28318 * (c * t + d));
        }

        void main() {
          vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / resolution.y;
          vec2 uv0 = uv;
          vec3 finalColor = vec3(0.0);

          for (float i = 0.0; i < 4.0; i++) {
            uv = fract(uv * 1.5) - 0.5;

            float d = length(uv) * exp(-length(uv0));

            vec3 col = palette(length(uv0) + i * 0.4 + time * 0.4);

            d = sin(d * 8.0 + time) / 8.0;
            d = abs(d);

            d = pow(0.01 / d, 1.2);

            finalColor += col * d;
          }

          // Add subtle gradient overlay
          vec2 center = vec2(0.5, 0.5);
          float gradient = 1.0 - length((gl_FragCoord.xy / resolution.xy) - center) * 1.4;
          gradient = smoothstep(0.0, 1.0, gradient);

          // Mix with cosmic purple/blue gradient
          vec3 bgGradient = mix(
            vec3(0.1, 0.0, 0.2),  // Deep purple
            vec3(0.0, 0.1, 0.3),  // Deep blue
            (gl_FragCoord.y / resolution.y)
          );

          finalColor = mix(bgGradient, finalColor, 0.7);
          finalColor *= gradient;

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    })

    // Create geometry
    const geometry = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Animation loop
    const animate = () => {
      material.uniforms.time.value += 0.01
      renderer.render(scene, camera)
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !renderer) return

      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight

      renderer.setSize(width, height)
      material.uniforms.resolution.value.set(width, height)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      geometry.dispose()
      material.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className={`w-full h-full ${className || ''}`}
      style={{ position: 'absolute', top: 0, left: 0, zIndex: -1 }}
    />
  )
}

export default CelestialBloomShader