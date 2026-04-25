"use client";

import { useRef, useEffect, useState, memo } from "react";
import Image from "next/image";
import { ORBIT_TRACKS } from "@/constants/meteorBustersGame/gameConfig";
import { StarVisual } from "@/components/game/common/starShield/starVisual";
import { STAR_POSITION } from "@/components/game/phases/starShieldGame/playing/protectedStar";
import type { MeteorBulletType } from "@/types";

// tilt の cos/sin は起動時に一度計算（ゲームの meteorRenderer と同じ）
const TRACK_TRIG = ORBIT_TRACKS.map((t) => ({
	cos: Math.cos(t.tilt),
	sin: Math.sin(t.tilt),
}));

/** 装飾用スケール倍率。ゲームの rx/ry はゲーム画面用の値なので拡大して使う */
const ORBIT_SCALE = 1.6;

// 装飾用ボス隕石。STAR_POSITION に合わせて外側のトラックを使う
const DECO_METEORS: {
	type: MeteorBulletType;
	trackIdx: number;
	sizeFactor: number;
	initialAngle: number;
	periodMs: number;
}[] = [
	{ type: "A", trackIdx: 2, sizeFactor: 1.5, initialAngle: 0.5,           periodMs: 16000 },
	{ type: "C", trackIdx: 3, sizeFactor: 1.5, initialAngle: Math.PI * 0.8, periodMs: 13000 },
	{ type: "B", trackIdx: 4, sizeFactor: 1.5, initialAngle: Math.PI * 1.4, periodMs: 10000 },
];

/** STAR_POSITION から星の数学的中心を求める（コンテナ座標系） */
function getStarCenter(cw: number, ch: number) {
	const vmax = Math.max(cw, ch);
	return {
		cx: cw * -0.45 + vmax * 0.45,
		cy: ch * 2.2 - vmax * 0.45,
	};
}

/** ゲームの getMeteorScreenPos と同等だが軌道中心を星位置に変更 */
function getMeteorPos(
	angle: number,
	cw: number,
	trackIdx: number,
	sc: { cx: number; cy: number },
) {
	const track = ORBIT_TRACKS[trackIdx];
	const trig = TRACK_TRIG[trackIdx];
	if (!track || !trig) return { x: 0, y: 0, scale: 1, zIndex: 10 };
	// offsetX/Y は星起点では使わない（ゲームの orbit center 補正のため）
	const rx = cw * track.rx * ORBIT_SCALE;
	const ry = cw * track.ry * ORBIT_SCALE;
	const xLocal = rx * Math.cos(angle);
	const yLocal = ry * Math.sin(angle);
	const x = sc.cx + xLocal * trig.cos - yLocal * trig.sin;
	const y = sc.cy + xLocal * trig.sin + yLocal * trig.cos;
	const depth = Math.sin(angle);
	const scale = track.minScale + (track.maxScale - track.minScale) * ((depth + 1) / 2);
	const zIndex = Math.round(depth * 10) + 10;
	return { x, y, scale, zIndex };
}

/** ゲームの OrbitGuides と同スタイル。軌道中心を星位置に変更 */
const OrbitGuides = memo(function OrbitGuides({
	cw,
	sc,
}: {
	cw: number;
	sc: { cx: number; cy: number };
}) {
	return (
		<>
			{ORBIT_TRACKS.slice(1).map((track, i) => {
				const i_ = i + 1; // 元のインデックス（opacity 計算用）
				const rx = cw * track.rx * ORBIT_SCALE;
				const ry = cw * track.ry * ORBIT_SCALE;
				const opacity = i_ === 3 ? 0.12 : i_ <= 2 ? 0.08 : 0.05;
				return (
					<div
						key={i}
						className="absolute pointer-events-none"
						style={{
							left: sc.cx - rx,
							top: sc.cy - ry,
							width: rx * 2,
							height: ry * 2,
							border: `1px solid rgba(129,140,248,${opacity})`,
							borderRadius: "50%",
							transform: `rotate(${track.tilt * (180 / Math.PI)}deg)`,
						}}
					/>
				);
			})}
		</>
	);
});

export function MeteorOrbitStar() {
	const containerRef = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState({ w: 0, h: 0 });

	// RAF アニメーション用 refs（ゲームと同じパターン）
	const anglesRef = useRef(DECO_METEORS.map((m) => m.initialAngle));
	const lastTimeRef = useRef<number | null>(null);
	const rafRef = useRef<number | null>(null);
	const frameCountRef = useRef(0);
	const [angles, setAngles] = useState(DECO_METEORS.map((m) => m.initialAngle));

	// コンテナサイズ監視
	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const obs = new ResizeObserver((entries) => {
			const r = entries[0];
			if (r) setSize({ w: r.contentRect.width, h: r.contentRect.height });
		});
		obs.observe(el);
		return () => obs.disconnect();
	}, []);

	// RAF ループ（ゲームと同じく 2 フレームに 1 回 React state 更新）
	useEffect(() => {
		const tick = (now: number) => {
			if (lastTimeRef.current !== null) {
				const dt = now - lastTimeRef.current;
				anglesRef.current = anglesRef.current.map((angle, i) => {
					const m = DECO_METEORS[i]!;
					return angle + (dt / m.periodMs) * Math.PI * 2;
				});
				frameCountRef.current++;
				if (frameCountRef.current % 2 === 0) {
					setAngles([...anglesRef.current]);
				}
			}
			lastTimeRef.current = now;
			rafRef.current = requestAnimationFrame(tick);
		};
		rafRef.current = requestAnimationFrame(tick);
		return () => {
			if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
		};
	}, []);

	const sc = size.w > 0 ? getStarCenter(size.w, size.h) : null;

	return (
		<div ref={containerRef} className="absolute inset-0 pointer-events-none">
			{/* inset-0 ラッパーで stacking context を z-10 に固定。
			    depth<0 の隕石 (zIndex<10) は星の裏に隠れ、depth>=0 (zIndex>=10) は手前に出る */}
			<div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
				<StarVisual position={STAR_POSITION} />
			</div>
			{sc && (
				<>
					<OrbitGuides cw={size.w} sc={sc} />
					{DECO_METEORS.map((m, i) => {
						const angle = angles[i] ?? m.initialAngle;
						const { x, y, scale, zIndex } = getMeteorPos(angle, size.w, m.trackIdx, sc);
						// ゲームと同じサイズ計算: 48 * scale * sizeFactor（ボスは 1.5 倍）
						const sizePx = Math.max(4, Math.round(48 * scale * m.sizeFactor));
						return (
							<div
								key={i}
								className="absolute top-0 left-0 pointer-events-none"
								style={{
									transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
									zIndex,
									willChange: "transform",
								}}
							>
								{/* ボス外見 = glow filter なし（ゲームの isBoss と同じ） */}
								<div style={{ width: sizePx, height: sizePx, position: "relative" }}>
									<Image src="/svg/object/metor.svg" alt="" fill className="object-contain" />
								</div>
							</div>
						);
					})}
				</>
			)}
		</div>
	);
}
