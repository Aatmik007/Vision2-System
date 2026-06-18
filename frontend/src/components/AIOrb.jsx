import React, { useRef, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';

function isWebGLSupported() {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ThreeJS WebGL Canvas Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function AnimatedSphere() {
  const sphereRef = useRef();

  useFrame(({ clock }) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.x = clock.getElapsedTime() * 0.15;
      sphereRef.current.rotation.y = clock.getElapsedTime() * 0.25;
    }
  });

  return (
    <Sphere ref={sphereRef} args={[1, 64, 64]} scale={1.8}>
      <MeshDistortMaterial
        color="#8b5cf6"
        attach="material"
        distort={0.45}
        speed={2.5}
        roughness={0.15}
        metalness={0.85}
        clearcoat={1}
        clearcoatRoughness={0.1}
      />
    </Sphere>
  );
}

export default function AIOrb() {
  const hasWebGL = isWebGLSupported();

  const fallbackOrb = (
    <div className="w-full h-[400px] relative flex items-center justify-center">
      {/* 2D CSS Glowing Orb Fallback */}
      <div className="absolute w-[250px] h-[250px] bg-accent-purple/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute w-[200px] h-[200px] bg-accent-cyan/10 rounded-full blur-2xl animate-pulse"></div>
      
      <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-accent-purple via-[#8b5cf6] to-accent-cyan opacity-80 animate-pulse relative flex items-center justify-center border border-white/20 shadow-glow-purple">
        <div className="w-40 h-40 rounded-full bg-[#030014] flex flex-col items-center justify-center text-center p-4">
          <span className="text-white text-xs font-bold tracking-widest uppercase animate-pulse">AI Core Engine</span>
          <span className="text-slate-500 text-[8px] mt-1 uppercase font-mono">Running (2D Mode)</span>
        </div>
      </div>
    </div>
  );

  if (!hasWebGL) {
    return fallbackOrb;
  }

  return (
    <div className="w-full h-[400px] relative flex items-center justify-center">
      {/* Background glow behind 3D sphere */}
      <div className="absolute w-[250px] h-[250px] bg-accent-purple/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute w-[200px] h-[200px] bg-accent-cyan/10 rounded-full blur-2xl animate-pulse"></div>

      <CanvasErrorBoundary fallback={fallbackOrb}>
        <Canvas camera={{ position: [0, 0, 4] }} className="w-full h-full">
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#8b5cf6" />
          <pointLight position={[-10, -10, -10]} intensity={1.2} color="#06b6d4" />
          <directionalLight position={[0, 5, 0]} intensity={1} color="#ffffff" />
          <AnimatedSphere />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}
