"use client";

import { useContext, useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { PukapukaLogo } from "@/components/common/logo/pukapukaLogo";
import { SoundContext } from "@/lib/sound-context";

const OBJECTS = [
	{ src: "/svg/object/blue-star.svg", label: "blue-star" },
	{ src: "/svg/object/earth.svg", label: "earth" },
	{ src: "/svg/object/moon.svg", label: "moon" },
	{ src: "/svg/object/purple-star.svg", label: "purple-star" },
] as const;

// ── 軌道チューニング定数 ──────────────────────────────────────
// 【上下の中心】ORBIT_CENTER_Y (px, 正=下へずらす, 負=上へずらす)
//   text-8xl(96px) + py-2(8px×2) = 行高約112px。
//   コンテナ中央から約-10px上が「Pukapuka」と「Space」の間のギャップ。
//   ずれる場合はここを ±1px 単位で調整する。
const ORBIT_CENTER_Y = 0;

// 【左右の中心】ORBIT_CENTER_X (px, 正=右へずらす, 負=左へずらす)
//   「Space」は5文字中央揃えのため、左-1/2 はすでに "a"(3文字目) と一致する。
//   フォントの字幅が均等でない場合はここで微調整する。
const ORBIT_CENTER_X = 0;

// 【公転速度】PERIOD (ms, 大きくすると遅くなる)
const PERIOD = 10000;

// 【軌道サイズ】A=長半径(px), B=短半径(px)
//   A を大きくすると右下↔左上方向に広がる。
//   B を大きくすると垂直方向の振れ幅が増す（薄くすると線に近くなる）。
const A = 400;
const B = 20;

// 【スケール範囲】SCALE_MIN〜SCALE_MAX
//   SCALE_MAX = 右下(手前)での最大サイズ倍率
//   SCALE_MIN = 左上(奥)での最小サイズ倍率
const SCALE_MIN = 0.5;
const SCALE_MAX = 5;

// 【透明度範囲】OPACITY_MIN〜OPACITY_MAX
const OPACITY_MIN = 1.0;
const OPACITY_MAX = 1.0;
// ─────────────────────────────────────────────────────────────

const TILT = -Math.PI / 6; // -45°（右下↔左上の軌道傾き）
const COS_TILT = Math.cos(TILT);
const SIN_TILT = Math.sin(TILT);

export function LogoWithOrbit() {
	const sound = useContext(SoundContext);
	const [currentIndex, setCurrentIndex] = useState(0);
	const objectRef = useRef<HTMLDivElement>(null);
	const angleRef = useRef(0);
	const lastTimeRef = useRef<number | null>(null);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		const animate = (time: number) => {
			if (lastTimeRef.current !== null) {
				const delta = time - lastTimeRef.current;
				angleRef.current += (delta / PERIOD) * 2 * Math.PI;
			}
			lastTimeRef.current = time;

			const t = angleRef.current;
			const xLocal = A * Math.cos(t);
			const yLocal = B * Math.sin(t);
			const x = xLocal * COS_TILT - yLocal * SIN_TILT + ORBIT_CENTER_X;
			const y = xLocal * SIN_TILT + yLocal * COS_TILT + ORBIT_CENTER_Y;

			// depth: sin(t)ベース
			//   t=π/2 (中心を左移動中) → depth=1 → 最大スケール (Space の "a" の上あたり)
			//   t=3π/2 (中心を右移動中) → depth=0 → 最小スケール (Pukapuka の "ap" あたり)
			const depth = (Math.sin(t) + 1) / 2;
			const scale = SCALE_MIN + depth * (SCALE_MAX - SCALE_MIN);
			const opacity = OPACITY_MIN + depth * (OPACITY_MAX - OPACITY_MIN);
			// z-index は速度方向で判定: sin(t)>0 = 左移動中 = 前面, sin(t)≤0 = 右移動中 = 背面
			// ※切り替わりタイミングを調整したい場合は 0 の部分を ±0.1〜0.3 で微調整する
			const zIndex = Math.sin(t) > 0 ? 10 : 1;

			if (objectRef.current) {
				objectRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`;
				objectRef.current.style.opacity = String(opacity);
				objectRef.current.style.zIndex = String(zIndex);
			}

			rafRef.current = requestAnimationFrame(animate);
		};

		rafRef.current = requestAnimationFrame(animate);

		return () => {
			if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
			lastTimeRef.current = null;
		};
	}, []);

	const handleClick = useCallback(() => {
		const nextIndex = (currentIndex + 1) % OBJECTS.length;
		setCurrentIndex(nextIndex);

		const nextIsPlaying = !sound?.isPlaying;
		sound?.setIsPlaying(nextIsPlaying);

		if (nextIsPlaying) {
			const audio = new Audio("/se/switch-se.mp3");
			audio.volume = 0.1;
			audio.play().catch(() => {});
		}
	}, [currentIndex, sound]);

	const currentObject = OBJECTS[currentIndex];

	return (
		<div className="relative inline-flex items-center justify-center">
			{/* z-5: ロゴ文字のスタッキングコンテキスト。公転オブジェクトが z-10 の時に文字の前面に出る */}
			<PukapukaLogo size="large" className="relative z-5" />
			<div
				ref={objectRef}
				className="absolute top-1/2 left-1/2 w-12 h-12 cursor-pointer"
				onClick={handleClick}
			>
				<Image
					src={currentObject.src}
					alt={currentObject.label}
					fill
					className="object-contain"
				/>
			</div>
		</div>
	);
}
