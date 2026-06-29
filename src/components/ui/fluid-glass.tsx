'use client'

import { ReactNode } from 'react'
import { FluidGlassFallback } from './fluid-glass-fallback'

interface FluidGlassProps {
  mode?: 'lens' | 'bar' | 'cube'
  lensProps?: any
  barProps?: any
  cubeProps?: any
  className?: string
  children?: ReactNode
}

// For now, we'll use the fallback version until 3D assets are available
// The original complex 3D version requires specific GLB files that need to be created
export function FluidGlass({ mode = 'lens', className, children }: FluidGlassProps) {
  return (
    <FluidGlassFallback mode={mode} className={className}>
      {children}
    </FluidGlassFallback>
  )
}

/* Original implementation preserved for future use when GLB assets are available:

import * as THREE from 'three'
import { useRef, useState, useEffect, memo, Suspense } from 'react'
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber'
import {
  useFBO,
  useGLTF,
  useScroll,
  Image,
  Scroll,
  Preload,
  ScrollControls,
  MeshTransmissionMaterial,
  Text
} from '@react-three/drei'
import { easing } from 'maath'

const ModeWrapper = memo(function ModeWrapper({
  children,
  glb,
  geometryKey,
  lockToBottom = false,
  followPointer = true,
  modeProps = {},
  ...props
}: any) {
  const ref = useRef<THREE.Mesh>(null)
  const { nodes } = useGLTF(glb) as any
  const buffer = useFBO()
  const { viewport: vp } = useThree()
  const [scene] = useState(() => new THREE.Scene())
  const geoWidthRef = useRef(1)

  useEffect(() => {
    const geo = nodes[geometryKey]?.geometry
    if (geo) {
      geo.computeBoundingBox()
      geoWidthRef.current = geo.boundingBox!.max.x - geo.boundingBox!.min.x || 1
    }
  }, [nodes, geometryKey])

  useFrame((state, delta) => {
    if (!ref.current) return
    const { gl, viewport, pointer, camera } = state
    const v = viewport.getCurrentViewport(camera, [0, 0, 15])

    const destX = followPointer ? (pointer.x * v.width) / 2 : 0
    const destY = lockToBottom ? -v.height / 2 + 0.2 : followPointer ? (pointer.y * v.height) / 2 : 0
    easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta)

    if (modeProps.scale == null) {
      const maxWorld = v.width * 0.9
      const desired = maxWorld / geoWidthRef.current
      ref.current.scale.setScalar(Math.min(0.15, desired))
    }

    gl.setRenderTarget(buffer)
    gl.render(scene, camera)
    gl.setRenderTarget(null)

    gl.setClearColor(0x5227ff, 1)
  })

  const { scale, ior, thickness, anisotropy, chromaticAberration, ...extraMat } = modeProps

  return (
    <>
      {createPortal(children, scene)}
      <mesh scale={[vp.width, vp.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} transparent />
      </mesh>
      {nodes[geometryKey]?.geometry && (
        <mesh ref={ref} scale={scale ?? 0.15} rotation-x={Math.PI / 2} geometry={nodes[geometryKey].geometry} {...props}>
          <MeshTransmissionMaterial
            buffer={buffer.texture}
            ior={ior ?? 1.15}
            thickness={thickness ?? 5}
            anisotropy={anisotropy ?? 0.01}
            chromaticAberration={chromaticAberration ?? 0.1}
            {...extraMat}
          />
        </mesh>
      )}
    </>
  )
})

function Lens({ modeProps, ...p }: any) {
  return <ModeWrapper glb="/assets/3d/lens.glb" geometryKey="Cylinder" followPointer modeProps={modeProps} {...p} />
}

function Cube({ modeProps, ...p }: any) {
  return <ModeWrapper glb="/assets/3d/cube.glb" geometryKey="Cube" followPointer modeProps={modeProps} {...p} />
}

function Bar({ modeProps = {}, ...p }: any) {
  const defaultMat = {
    transmission: 1,
    roughness: 0,
    thickness: 10,
    ior: 1.15,
    color: '#ffffff',
    attenuationColor: '#ffffff',
    attenuationDistance: 0.25
  }

  return (
    <ModeWrapper
      glb="/assets/3d/bar.glb"
      geometryKey="Cube"
      lockToBottom
      followPointer={false}
      modeProps={{ ...defaultMat, ...modeProps }}
      {...p}
    />
  )
}

export function FluidGlassAdvanced({ mode = 'lens', lensProps = {}, barProps = {}, cubeProps = {}, className, children }: FluidGlassProps) {
  const [hasError, setHasError] = useState(false)
  
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        setHasError(true)
      }
    } catch (e) {
      setHasError(true)
    }
  }, [])
  
  if (hasError || typeof window === 'undefined') {
    return <FluidGlassSimple mode={mode} className={className}>{children}</FluidGlassSimple>
  }

  const Wrapper = mode === 'bar' ? Bar : mode === 'cube' ? Cube : Lens
  const rawOverrides = mode === 'bar' ? barProps : mode === 'cube' ? cubeProps : lensProps

  const {
    navItems = [
      { label: 'Home', link: '' },
      { label: 'About', link: '' },
      { label: 'Contact', link: '' }
    ],
    ...modeProps
  } = rawOverrides

  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Suspense fallback={<FluidGlassSimple mode={mode}>{children}</FluidGlassSimple>}>
        <Canvas 
          camera={{ position: [0, 0, 20], fov: 15 }} 
          gl={{ alpha: true }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.NoToneMapping
          }}
          onError={() => setHasError(true)}
        >
          <ScrollControls damping={0.2} pages={3} distance={0.4}>
            {mode === 'bar' && <NavItems items={navItems} />}
            <Suspense fallback={null}>
              <Wrapper modeProps={modeProps}>
                <Scroll>
                  <Typography />
                  <Images />
                </Scroll>
                <Scroll html>
                  {children}
                </Scroll>
                <Preload />
              </Wrapper>
            </Suspense>
          </ScrollControls>
        </Canvas>
      </Suspense>
    </div>
  )
}
*/
