import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { Earth } from "./components/Earth";
import { Moon } from "./components/Moon";
import { Sun } from "./components/Sun";

export default function App() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      <Canvas
        shadows
        camera={{ position: [3, 1.5, 5], fov: 45 }}
        gl={{ logDepthBuffer: true }}
        className="h-full w-full"
      >
        <Sun />
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        <Suspense fallback={null}>
          <Earth />
          <Moon />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={3.5}
          maxDistance={30}
        />
      </Canvas>
    </main>
  );
}