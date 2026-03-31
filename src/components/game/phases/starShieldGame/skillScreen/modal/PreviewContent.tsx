import { type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import {
	TECHNIQUES,
	TECHNIQUE_STATS,
	type TechniqueId,
} from "@/constants/starShieldGame/techniques";
import {
	LEVEL_STAR_HP,
	LEVEL_BULLET_COUNT,
	LEVEL_PINK_COUNT,
	LEVEL_SPREAD_DEG,
	LEVEL_BLUE_SLOW_MULTIPLIER,
	LEVEL_YELLOW_DAMAGE,
	LEVEL_PURPLE_SIZE,
	LEVEL_ORANGE_CHAIN_COUNT,
	LEVEL_ORANGE_DAMAGE,
} from "@/constants/starShieldGame/gameConfig";
import {
	LEVEL_HEAL_RECOVERY,
	SPECIAL_ATTACK_LEVEL_PARAMS,
	type SpecialAttackLevel,
} from "@/constants/starShieldGame/skillConfig";
import type { StarShieldProgress } from "@/types/starShieldGame";
import type { SpecialAttackChoice } from "@/utils/starShieldGame";
import { TechniquePentagonChart } from "../preview/TechniquePentagonChart";
import { LevelProgressionBarChart } from "../preview/LevelProgressionBarChart";
import { LoadoutAnimPreview } from "../preview/LoadoutAnimPreview";
import { SpecialAttackLoadoutPreview } from "../preview/SpecialAttackLoadoutPreview";
import { HealLoadoutPreview } from "../loadout/HealLoadoutPreview";
import type { PreviewData } from "../types";

const SPECIAL_LABELS: Record<string, string> = {
	spread: "広範囲弾（スプレッド）",
	all_destruction: "全破壊",
};

function StatRow({
	label,
	value,
	color,
}: {
	label: string;
	value: string;
	color: string;
}) {
	return (
		<div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
			<span className="text-white/35 text-xs font-dot-gothic-16">{label}</span>
			<span className={cn("text-xs font-bold", color)}>{value}</span>
		</div>
	);
}

export function PreviewContent({
	preview,
	progress,
	currentLevel,
}: {
	preview: PreviewData;
	progress: StarShieldProgress | null;
	currentLevel: number;
}) {
	if (preview.kind === "normalAttack") {
		const tech = TECHNIQUES[preview.techniqueId];
		const owned = currentLevel > 0;
		const displayLevel = Math.max(1, currentLevel) as 1 | 2 | 3 | 4 | 5;

		const traitByTech: Record<TechniqueId, { label: string; value: string }> = {
			red: { label: "散弾数", value: `${LEVEL_BULLET_COUNT[displayLevel]} 発` },
			blue: {
				label: "減速割合",
				value: `${Math.round((1 - LEVEL_BLUE_SLOW_MULTIPLIER[displayLevel]) * 100)}%`,
			},
			yellow: {
				label: "火力",
				value: `${LEVEL_YELLOW_DAMAGE[displayLevel]} × 30発`,
			},
			purple: {
				label: "球サイズ",
				value: `${LEVEL_PURPLE_SIZE[displayLevel]}x`,
			},
			orange: {
				label: "連鎖数 / ダメージ",
				value: `${LEVEL_ORANGE_CHAIN_COUNT[displayLevel]}体 / ${LEVEL_ORANGE_DAMAGE[displayLevel]}x`,
			},
			pink: { label: "弾数", value: `${LEVEL_PINK_COUNT[displayLevel]} 発` },
		};
		const trait = traitByTech[preview.techniqueId];

		const fx = tech.specialEffect;

		return (
			<div>
				<div className="flex items-center gap-4 mb-6">
					<div
						className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 bg-(--tc-faint) [border:2px_solid_var(--tc-semi)] shadow-[0_0_32px_var(--tc-dim)]"
						style={
							{
								"--tc-faint": `${tech.color}15`,
								"--tc-semi": `${tech.color}50`,
								"--tc-dim": `${tech.color}30`,
							} as CSSProperties
						}
					>
						<div
							className="w-8 h-8 rounded-full bg-(--tc) shadow-[0_0_12px_var(--tc)]"
							style={{ "--tc": tech.color } as CSSProperties}
						/>
					</div>
					<div>
						<p className="text-white font-bold text-xl font-dot-gothic-16 tracking-wide mb-1">
							{tech.label}
						</p>
						<span
							className={cn(
								"inline-block px-2.5 py-0.5 rounded text-[11px] font-bold font-dot-gothic-16 tracking-wider border",
								owned
									? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
									: "bg-white/5 text-white/40 border-white/10",
							)}
						>
							通常攻撃 {owned ? `Lv ${currentLevel}` : "未所持"}
						</span>
					</div>
				</div>

				<div className="flex flex-col gap-3">
					<StatRow
						label="特性"
						value={`${trait.label}：${trait.value}`}
						color="text-indigo-300"
					/>
					{fx && (
						<div className="mt-2 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 p-4">
							<p className="text-indigo-400 text-[13px] font-bold mb-1.5 font-dot-gothic-16 flex items-center gap-1.5">
								⚡ 特殊効果：{fx.label}
							</p>
							<p className="text-white/45 text-xs font-dot-gothic-16 leading-relaxed">
								{fx.desc}
							</p>
						</div>
					)}
				</div>

				<div className="mt-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 p-4 flex justify-center">
					<TechniquePentagonChart
						stats={TECHNIQUE_STATS[preview.techniqueId]}
						color={tech.color}
					/>
				</div>

				{(() => {
					const normLevels = [1, 2, 3, 4, 5] as const;
					const levelValues: Record<TechniqueId, number[]> = {
						red: normLevels.map((l) => LEVEL_BULLET_COUNT[l]),
						blue: normLevels.map((l) =>
							Math.round((1 - LEVEL_BLUE_SLOW_MULTIPLIER[l]) * 100),
						),
						yellow: normLevels.map((l) => LEVEL_YELLOW_DAMAGE[l]),
						purple: normLevels.map((l) => LEVEL_PURPLE_SIZE[l]),
						orange: normLevels.map((l) => LEVEL_ORANGE_CHAIN_COUNT[l]),
						pink: normLevels.map((l) => LEVEL_PINK_COUNT[l]),
					};
					return (
						<div className="mt-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 p-4 flex justify-center">
							<LevelProgressionBarChart
								values={levelValues[preview.techniqueId]}
								currentLevel={displayLevel}
								maxLevel={5}
								color={tech.color}
								formatValue={(v) => `${v}${tech.levelUnit}`}
							/>
						</div>
					);
				})()}

				<div className="mt-6 pt-6 border-t border-white/5">
					<p className="text-white/40 text-xs mb-3 font-dot-gothic-16 font-bold tracking-wider">
						アニメーション デモ (Lv {displayLevel})
					</p>
					<LoadoutAnimPreview
						techniqueId={preview.techniqueId}
						level={displayLevel}
					/>
				</div>
			</div>
		);
	}

	if (preview.kind === "specialAttack") {
		const owned = currentLevel > 0;
		const displayLevel = Math.max(1, currentLevel) as SpecialAttackLevel;
		const params = SPECIAL_ATTACK_LEVEL_PARAMS[displayLevel];
		const totalBullets = params.waveCount * params.bulletsPerWave;

		return (
			<div>
				<div className="flex items-center gap-4 mb-6">
					<div className="w-16 h-16 relative flex items-center justify-center shrink-0 rounded-2xl bg-purple-500/10 border-2 border-purple-500/40">
						{Array.from({ length: 9 }).map((_, i) => {
							const angle = (i / 8) * params.spreadDeg - params.spreadDeg / 2;
							const rad = ((angle - 90) * Math.PI) / 180;
							const r = 24;
							const x = Math.cos(rad) * r;
							const y = Math.sin(rad) * r;
							return (
								<div
									key={i}
									className="absolute w-2 h-2 rounded-full bg-[#a78bfa] translate-x-(--tx) translate-y-(--ty) opacity-(--op) shadow-[0_0_6px_rgba(167,139,250,0.6)]"
									style={
										{
											"--tx": `${x}px`,
											"--ty": `${y}px`,
											"--op": String(0.4 + (i / 8) * 0.6),
										} as CSSProperties
									}
								/>
							);
						})}
					</div>
					<div>
						<p className="text-white font-bold text-xl font-dot-gothic-16 tracking-wide mb-1">
							{SPECIAL_LABELS[preview.id] ?? preview.id}
						</p>
						<span
							className={cn(
								"inline-block px-2.5 py-0.5 rounded text-[11px] font-bold font-dot-gothic-16 tracking-wider border",
								owned
									? "bg-purple-500/20 text-purple-300 border-purple-500/30"
									: "bg-white/5 text-white/40 border-white/10",
							)}
						>
							必殺技 {owned ? `Lv ${currentLevel}` : "未所持"}
						</span>
					</div>
				</div>
				<div className="flex flex-col gap-3">
					<StatRow
						label="総弾数"
						value={`${totalBullets} 発`}
						color="text-orange-400"
					/>
					<StatRow
						label="広がり角度"
						value={`${params.spreadDeg}°`}
						color="text-indigo-300"
					/>
					{params.waveCount > 1 && (
						<StatRow
							label="ウェーブ数"
							value={`${params.waveCount} 波`}
							color="text-purple-300"
						/>
					)}
				</div>
				<div className="mt-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 p-4 flex justify-center">
					<LevelProgressionBarChart
						values={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
							(l) =>
								SPECIAL_ATTACK_LEVEL_PARAMS[l as SpecialAttackLevel].waveCount *
								SPECIAL_ATTACK_LEVEL_PARAMS[l as SpecialAttackLevel]
									.bulletsPerWave,
						)}
						currentLevel={displayLevel}
						maxLevel={10}
						color="#a78bfa"
						formatValue={(v) => `${v} 発`}
					/>
				</div>
				<div className="mt-6 pt-6 border-t border-white/5">
					<p className="text-white/40 text-xs mb-3 font-dot-gothic-16 font-bold tracking-wider">
						アニメーション デモ (Lv {displayLevel})
					</p>
					<SpecialAttackLoadoutPreview
						specialAttackId={preview.id as SpecialAttackChoice}
						level={displayLevel}
						bulletColor={
							TECHNIQUES[
								(progress?.selectedNormalAttackId as TechniqueId) ?? "red"
							]?.color ?? "#ef4444"
						}
					/>
				</div>
			</div>
		);
	}

	if (preview.kind === "heal") {
		const owned = currentLevel > 0;
		const healVal = owned
			? LEVEL_HEAL_RECOVERY[currentLevel as 1 | 2 | 3 | 4 | 5 | 6]
			: 0;
		const isFullRestore = owned && currentLevel >= 5;
		const barWidth = isFullRestore ? 100 : owned ? healVal * 100 : 0;

		return (
			<div>
				<div className="flex items-center gap-4 mb-6">
					<div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center text-3xl shrink-0 shadow-[0_0_32px_rgba(16,185,129,0.2)]">
						💚
					</div>
					<div>
						<p className="text-white font-bold text-xl font-dot-gothic-16 tracking-wide mb-1">
							ヒール
						</p>
						<span
							className={cn(
								"inline-block px-2.5 py-0.5 rounded text-[11px] font-bold font-dot-gothic-16 tracking-wider border",
								owned
									? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
									: "bg-white/5 text-white/40 border-white/10",
							)}
						>
							{owned
								? `Lv ${currentLevel === 6 ? "max" : currentLevel}`
								: "未所持"}
						</span>
					</div>
				</div>
				<div className="flex flex-col gap-4">
					<div className="p-4 rounded-2xl bg-white/2 border border-white/5">
						<div className="flex items-center justify-between mb-2">
							<p className="text-white text-[13px] font-dot-gothic-16 font-bold">
								回復量
							</p>
							<p className="text-emerald-400 text-[15px] font-bold font-dot-gothic-16">
								{!owned ? "---" : isFullRestore ? "全回復" : `+${healVal} HP`}
							</p>
						</div>
						<div className="h-2.5 rounded-full bg-black/40 border border-white/5 overflow-hidden">
							<div
								className={cn(
									"h-full rounded-full transition-all duration-700 w-(--bar-w)",
									currentLevel === 6
										? "bg-linear-to-r from-amber-600 to-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
										: "bg-linear-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]",
								)}
								style={{ "--bar-w": `${barWidth}%` } as CSSProperties}
							/>
						</div>
					</div>
					{currentLevel === 6 && (
						<div className="rounded-2xl bg-red-500/5 border border-red-500/20 p-4">
							<p className="text-red-400 text-[13px] font-bold mb-1.5 font-dot-gothic-16 flex items-center gap-1.5">
								⚡ all_destruction 付与
							</p>
							<p className="text-white/45 text-xs font-dot-gothic-16 leading-relaxed">
								全回復に加えて、フィールド上の全ての隕石を一撃で破壊する。
							</p>
						</div>
					)}
				</div>
				<div className="mt-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-4 flex justify-center">
					<LevelProgressionBarChart
						values={[1, 2, 3, 4, 5, 6].map((l) => {
							const v = LEVEL_HEAL_RECOVERY[l as 1 | 2 | 3 | 4 | 5 | 6];
							return v >= 100 ? 99 : v * 10;
						})}
						currentLevel={
							currentLevel > 0 ? (currentLevel === 6 ? 6 : currentLevel) : 0
						}
						maxLevel={6}
						color="#10b981"
						formatValue={(_v, level) =>
							level >= 5
								? "全回復"
								: `+${LEVEL_HEAL_RECOVERY[level as 1 | 2 | 3 | 4]} HP`
						}
					/>
				</div>
				{owned && (
					<div className="mt-6 pt-6 border-t border-white/5">
						<p className="text-white/40 text-xs mb-3 font-dot-gothic-16 font-bold tracking-wider">
							ヒール効果イメージ
						</p>
						<HealLoadoutPreview
							healValue={healVal as number}
							isFullRestore={isFullRestore}
							starHpMax={
								LEVEL_STAR_HP[(progress?.starHpLevel ?? 1) as 1 | 2 | 3 | 4 | 5]
							}
							healLevel={progress?.healLevel ?? 1}
						/>
					</div>
				)}
			</div>
		);
	}

	if (preview.kind === "starHp") {
		const displayLevel = Math.max(1, currentLevel) as 1 | 2 | 3 | 4 | 5;
		const hp = LEVEL_STAR_HP[displayLevel];

		return (
			<div>
				<div className="flex items-center gap-4 mb-6">
					<div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center text-3xl shrink-0 shadow-[0_0_32px_rgba(16,185,129,0.2)]">
						⭐
					</div>
					<div>
						<p className="text-white font-bold text-xl font-dot-gothic-16 tracking-wide mb-1">
							星のHP
						</p>
						<span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold font-dot-gothic-16 tracking-wider border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
							Lv {displayLevel}
						</span>
					</div>
				</div>
				<div className="flex flex-col gap-4">
					<div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
						<div className="flex items-center justify-between mb-3">
							<p className="text-emerald-400/70 text-[13px] font-dot-gothic-16 font-bold">
								HP上限
							</p>
							<p className="text-emerald-400 text-3xl font-bold font-cherry-bomb-one leading-none drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]">
								{hp}
							</p>
						</div>
						<div className="h-2.5 rounded-full bg-black/40 border border-emerald-500/20 overflow-hidden">
							<div
								className="h-full rounded-full bg-linear-to-r from-emerald-700 to-emerald-400 transition-all duration-700 shadow-[0_0_10px_rgba(16,185,129,0.5)] w-(--lv-w)"
								style={
									{ "--lv-w": `${(displayLevel / 5) * 100}%` } as CSSProperties
								}
							/>
						</div>
						<div className="mt-2 text-right">
							<p className="text-emerald-500/70 text-[10px] font-dot-gothic-16 font-bold tracking-widest">
								Lv {displayLevel} / 5
							</p>
						</div>
					</div>
					<StatRow
						label="適用ロール"
						value="Typist（守護担当）"
						color="text-emerald-400/80"
					/>
				</div>
				<div className="mt-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-4 flex justify-center">
					<LevelProgressionBarChart
						values={[1, 2, 3, 4, 5].map(
							(l) => LEVEL_STAR_HP[l as 1 | 2 | 3 | 4 | 5],
						)}
						currentLevel={displayLevel}
						maxLevel={5}
						color="#10b981"
						formatValue={(v) => `${v} HP`}
					/>
				</div>
			</div>
		);
	}

	return null;
}
