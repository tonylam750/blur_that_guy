import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { useWindowSize } from 'react-use';
import Confetti from 'react-confetti';
import * as THREE from "three";

function FaceBlur({ blurred }) {
  const texture = useTexture("/andre.jpeg");
  return (
    <mesh position={[0.7, 1.2, 0.45]}>
      <planeGeometry args={[0.9, 0.6]} />
      <meshBasicMaterial map={texture} transparent opacity={blurred ? 1 : 0} depthTest={false} />
    </mesh>
  );
}

const _headNDC = new THREE.Vector3();

function Robot({ mouse, blurred, setBlurred }) {
  const { scene } = useGLTF("/models/robot13.glb");
  const head = useRef(null);

  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.isBone && obj.name === "Head") {
        head.current = obj;
      }
    });
  }, [scene]);

  useFrame(({ camera }) => {
    if (!head.current) return;
    head.current.getWorldPosition(_headNDC);
    _headNDC.project(camera);
    const dx = mouse.current.x - _headNDC.x;
    const dy = mouse.current.y - _headNDC.y;
    const leftRight = THREE.MathUtils.clamp(dx * 1.9, -0.4, 1);
    const upDown = THREE.MathUtils.clamp(-dy * 0.8, -0.9, 0.1);
    head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, leftRight, 0.1);
    head.current.rotation.z = THREE.MathUtils.lerp(head.current.rotation.z, upDown, 0.1);
  });

  return (
    <group
      position={[0, -1, 0]}
      scale={1}
      rotation={[-0.2, -0.2, 0]}
      onClick={(e) => {
        e.stopPropagation();
        setBlurred((prev) => !prev);
      }}
    >
      <primitive object={scene} />
      <FaceBlur blurred={blurred} />
    </group>
  );
}

export default function RobotPage() {
  const [hovered, setHovered] = useState(false);
  const [blurred, setBlurred] = useState(false);
  const mouse = useRef({ x: 0, y: 0 });
  const { width, height } = useWindowSize();

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      className="w-full h-full"
      style={{ cursor: hovered ? "pointer" : "default" }}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {blurred && (
        <Confetti
          width={width}
          height={height}
          recycle={false}     
          numberOfPieces={300}
        />
      )}
      <Canvas camera={{ position: [0, 1.5, 5], fov: 40 }} gl={{ alpha: true }} style={{ background: "transparent" }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[2, 3, 2]} intensity={1.5} />
        <Robot mouse={mouse} blurred={blurred} setBlurred={setBlurred} />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/robot13.glb");