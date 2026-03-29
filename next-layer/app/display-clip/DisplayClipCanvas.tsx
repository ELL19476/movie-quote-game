"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense } from "react";

const MODEL = "/models/fernseher.glb";

useGLTF.preload(MODEL);

function DummyModel() {
    const { scene } = useGLTF(MODEL);
    return <primitive object={scene} position={[0, -0.5, 0]} scale={0.35} />;
}

function Scene() {
    return (
        <>
            <color attach="background" args={["#0a0a0a"]} />
            <ambientLight intensity={0.55} />
            <directionalLight position={[4, 6, 4]} intensity={1.2} castShadow />
            <directionalLight position={[-3, 2, -2]} intensity={0.35} />
            <Suspense fallback={null}>
                <DummyModel />
            </Suspense>
            <OrbitControls enableDamping dampingFactor={0.05} />
        </>
    );
}

export default function DisplayClipCanvas() {
    return (
        <Canvas
            className="h-full w-full"
            camera={{ position: [2.2, 1.4, 2.8], fov: 45 }}
            gl={{ antialias: true }}
        >
            <Scene />
        </Canvas>
    );
}
