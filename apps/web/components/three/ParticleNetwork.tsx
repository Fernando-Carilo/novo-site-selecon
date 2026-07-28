"use client";

import { useEffect, useRef } from "react";

/**
 * Particle Network — WebGL background for the hero section.
 * Represents connectivity, scale and technology (network of municipalities,
 * candidates, institutions). Particles form an organic mesh that reacts
 * to the user's mouse position.
 *
 * Uses Three.js with custom shaders for performance (no post-processing).
 */
export function ParticleNetwork({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current) return;

    let animationId: number;
    let renderer: any;
    let disposed = false;

    async function init() {
      const THREE = await import("three") as any;

      if (disposed || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      // Renderer
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Scene & Camera
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
      camera.position.z = 30;

      // Particles
      const PARTICLE_COUNT = 120;
      const positions = new Float32Array(PARTICLE_COUNT * 3);
      const velocities: number[][] = [];
      const spread = 25;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * spread * 2;
        positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 1.2;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        velocities.push([
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.01,
        ]);
      }

      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

      const particleMaterial = new THREE.PointsMaterial({
        color: 0x00a783,
        size: 0.15,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });

      const particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);

      // Lines (connections between nearby particles)
      const linesMaterial = new THREE.LineBasicMaterial({
        color: 0x00a783,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
      });

      let linesMesh: any = null;
      const CONNECTION_DISTANCE = 6;

      function updateLines() {
        if (linesMesh) scene.remove(linesMesh);

        const linePositions: number[] = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          for (let j = i + 1; j < PARTICLE_COUNT; j++) {
            const dx = positions[i * 3] - positions[j * 3];
            const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
            const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < CONNECTION_DISTANCE) {
              linePositions.push(
                positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
              );
            }
          }
        }

        if (linePositions.length > 0) {
          const linesGeo = new THREE.BufferGeometry();
          linesGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
          linesMesh = new THREE.LineSegments(linesGeo, linesMaterial);
          scene.add(linesMesh);
        }
      }

      // Central glow sphere
      const glowGeo = new THREE.SphereGeometry(2, 32, 32);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x00a783,
        transparent: true,
        opacity: 0.06,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      scene.add(glow);

      // Outer ring
      const ringGeo = new THREE.TorusGeometry(8, 0.03, 8, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00a783,
        transparent: true,
        opacity: 0.15,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 3;
      scene.add(ring);

      let frameCount = 0;

      function animate() {
        if (disposed) return;
        animationId = requestAnimationFrame(animate);
        frameCount++;

        // Move particles
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          positions[i * 3] += velocities[i][0];
          positions[i * 3 + 1] += velocities[i][1];
          positions[i * 3 + 2] += velocities[i][2];

          // Wrap around
          if (Math.abs(positions[i * 3]) > spread) velocities[i][0] *= -1;
          if (Math.abs(positions[i * 3 + 1]) > spread * 0.6) velocities[i][1] *= -1;
          if (Math.abs(positions[i * 3 + 2]) > 5) velocities[i][2] *= -1;
        }
        particleGeometry.attributes.position.needsUpdate = true;

        // Update lines every 3rd frame for performance
        if (frameCount % 3 === 0) updateLines();

        // Mouse influence on camera
        const targetX = mouseRef.current.x * 2;
        const targetY = mouseRef.current.y * 1.5;
        camera.position.x += (targetX - camera.position.x) * 0.02;
        camera.position.y += (-targetY - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);

        // Rotate ring
        ring.rotation.z += 0.002;

        // Pulse glow
        glow.scale.setScalar(1 + Math.sin(frameCount * 0.02) * 0.1);

        renderer.render(scene, camera);
      }

      animate();

      // Resize
      function onResize() {
        if (!canvasRef.current || disposed) return;
        const w = canvasRef.current.clientWidth;
        const h = canvasRef.current.clientHeight;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
      };
    }

    init();

    function onMouseMove(e: MouseEvent) {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    }
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      disposed = true;
      cancelAnimationFrame(animationId);
      window.removeEventListener("mousemove", onMouseMove);
      renderer?.dispose?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full ${className}`}
      style={{ pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}
