import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { QuestData, AnswerResult } from '../types';
import { submitAnswer } from '../api';
import ResultDisplay from '../components/ResultDisplay';

interface Props { quest: QuestData }

export default function ThreeJsQuest({ quest }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState(false);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mountRef.current || result?.correct) return;

    const el = mountRef.current;
    const w = el.clientWidth;
    const h = 320;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.set(0, 0, 3);

    const materials = [
      new THREE.MeshStandardMaterial({ color: 0x1e40af }),
      new THREE.MeshStandardMaterial({ color: 0x1e40af }),
      new THREE.MeshStandardMaterial({ color: 0x1e40af }),
      new THREE.MeshStandardMaterial({ color: 0x1e40af }),
      new THREE.MeshStandardMaterial({ color: 0x7f1d1d, emissive: 0x3b0000 }),
      new THREE.MeshStandardMaterial({ color: 0x1e40af }),
    ];

    const cube = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), materials);
    scene.add(cube);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    scene.add(dirLight);

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = async (e: MouseEvent) => {
      if (loading || result?.correct) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObject(cube);
      if (!hits.length) return;
      const faceIndex = Math.floor(hits[0].faceIndex! / 2);
      if (faceIndex === 4) {
        setLoading(true);
        const res = await submitAnswer(quest.productId, quest.step, quest.walletAddress, {
          secretCode: '3DAVAX',
        });
        setResult(res);
        setLoading(false);
      } else {
        setHint(true);
        setTimeout(() => setHint(false), 1500);
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      cube.rotation.x += 0.005;
      cube.rotation.y += 0.008;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.domElement.removeEventListener('click', handleClick);
      el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [quest, loading, result]);

  return (
    <div className="max-w-lg w-full mx-auto px-4 py-12">
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
        <span className="text-xs text-pink-400 uppercase tracking-widest">Quest {quest.step} · 3D 인터랙션</span>
        <h1 className="text-xl font-bold mt-2 mb-1">{quest.name}</h1>
        <p className="text-slate-400 text-sm mb-4">
          회전하는 큐브에서 <span className="text-red-400 font-medium">비밀 면</span>을 찾아 클릭하세요!
          {hint && <span className="text-yellow-400 ml-2">← 다른 면입니다</span>}
        </p>

        {!result?.correct && (
          <div ref={mountRef} className="w-full h-80 rounded-xl overflow-hidden bg-gray-950 cursor-pointer" />
        )}

        {result && <ResultDisplay correct={result.correct} message={result.message} />}
      </div>
    </div>
  );
}
