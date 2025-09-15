import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const animationIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!mountRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 5

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0) // Transparent background
    rendererRef.current = renderer
    mountRef.current.appendChild(renderer.domElement)

    // Create floating geometric shapes
    const geometries = [
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.SphereGeometry(0.3, 32, 32),
      new THREE.ConeGeometry(0.3, 0.8, 8),
      new THREE.OctahedronGeometry(0.4),
    ]

    const materials = [
      new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.1 
      }),
      new THREE.MeshBasicMaterial({ 
        color: 0x000000, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.15 
      }),
    ]

    const meshes: THREE.Mesh[] = []

    // Create multiple floating objects
    for (let i = 0; i < 15; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)]
      const material = materials[Math.floor(Math.random() * materials.length)]
      const mesh = new THREE.Mesh(geometry, material)

      // Random positioning
      mesh.position.x = (Math.random() - 0.5) * 20
      mesh.position.y = (Math.random() - 0.5) * 20
      mesh.position.z = (Math.random() - 0.5) * 10

      // Random rotation
      mesh.rotation.x = Math.random() * Math.PI
      mesh.rotation.y = Math.random() * Math.PI
      mesh.rotation.z = Math.random() * Math.PI

      // Store initial position for animation
      mesh.userData = {
        initialX: mesh.position.x,
        initialY: mesh.position.y,
        initialZ: mesh.position.z,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02,
        },
        floatSpeed: Math.random() * 0.02 + 0.01,
        floatRange: Math.random() * 2 + 1,
      }

      meshes.push(mesh)
      scene.add(mesh)
    }

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)

      const time = Date.now() * 0.001

      meshes.forEach((mesh) => {
        const { rotationSpeed, floatSpeed, floatRange, initialY } = mesh.userData

        // Rotation animation
        mesh.rotation.x += rotationSpeed.x
        mesh.rotation.y += rotationSpeed.y
        mesh.rotation.z += rotationSpeed.z

        // Floating animation
        mesh.position.y = initialY + Math.sin(time * floatSpeed) * floatRange
      })

      renderer.render(scene, camera)
    }

    animate()

    // Handle window resize
    const handleResize = () => {
      if (!camera || !renderer) return
      
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      
      // Dispose of Three.js objects
      meshes.forEach((mesh) => {
        if (mesh.geometry) mesh.geometry.dispose()
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((material) => material.dispose())
          } else {
            mesh.material.dispose()
          }
        }
        scene.remove(mesh)
      })
      
      renderer.dispose()
    }
  }, [])

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}