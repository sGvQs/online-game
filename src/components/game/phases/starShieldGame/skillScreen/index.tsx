"use client";

import { useState, useEffect, useCallback, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ProtectedStar } from "../playing/protectedStar";
import { AuroraGlow } from "@/components/game/common/starShield/auroraGlow";
import {
	TECHNIQUES,
	type TechniqueId,
} from "@/constants/starShieldGame/techniques";
import { ICONS } from "@/constants/starShieldGame/constants";
import { getMyStarShieldProgress, updateLoadout } from "@/server/actions/game";
import type { StarShieldProgress } from "@/types/starShieldGame";
import { LEVEL_STAR_HP } from "@/constants/starShieldGame/gameConfig";
import { LEVEL_HEAL_RECOVERY } from "@/constants/starShieldGame/skillConfig";
import { cn } from "@/lib/utils";
import {
	getAvailableNormalAttacks,
	getAvailableSpecialAttacks,
} from "@/utils/starShieldGame";
import type { OwnedSkills } from "@/utils/starShieldGame";

// Sub-components
import type { PreviewData } from "./types";
import { SkillCard } from "./skillList/SkillCard";
import { SkillRow } from "./skillList/SkillRow";

import { SectionDivider } from "./skillList/SectionDivider";
import { HealLoadoutPreview } from "./loadout/HealLoadoutPreview";
import { LoadoutAnimPreview } from "./preview/LoadoutAnimPreview";
import { SpecialAttackLoadoutPreview } from "./preview/SpecialAttackLoadoutPreview";
import { SkillPreviewModal } from "./modal/SkillPreviewModal";
import { StarShieldTitle } from "@/components/game/common/starShield/starShieldTitle";
import { Typography } from "@/components/ui/typography";
import { button } from "@/components/ui/button/styles";

// ============================================================
// 定数
// ============================================================
const NORMAL_ATTACK_IDS: TechniqueId[] = [
	"red",
	"blue",
	"yellow_beam",
	"purple",
	"orange",
	"pink",
];
const SPECIAL_ATTACK_IDS = ["spread"] as const;
const SPECIAL_LABELS: Record<string, string> = {
	spread: "広範囲弾（スプレッド）",
	all_destruction: "全破壊",
};

function getTechEffectLabel(techniqueId: TechniqueId): string {
	const effects: Partial<Record<TechniqueId, string>> = {
		red: "スタンダード",
		blue: "スロー効果",
		yellow_beam: "ビーム状",
		purple: "貫通効果",
		orange: "連鎖",
		pink: "追尾ロケット",
	};
	return effects[techniqueId] ?? "";
}

// ============================================================
// Main Component
// ============================================================
export function StarShieldSkill({
	roomId,
	currentUserId: _currentUserId,
}: {
	roomId: string;
	currentUserId: string;
}) {
	const [progress, setProgress] = useState<StarShieldProgress | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [preview, setPreview] = useState<PreviewData | null>(null);

	useEffect(() => {
		getMyStarShieldProgress()
			.then(setProgress)
			.catch(() => setError("データの取得に失敗しました"))
			.finally(() => setLoading(false));
	}, []);

	const refresh = useCallback(() => {
		getMyStarShieldProgress()
			.then(setProgress)
			.catch(() => {});
	}, []);

	// ヒール・必殺技：最大値のものを自動でセット
	useEffect(() => {
		if (!progress || loading) return;
		const updates: Parameters<typeof updateLoadout>[0] = {};

		const healLv = progress.healLevel ?? 0;
		const selHeal = progress.selectedHealLevel ?? null;
		if (healLv > 0 && (selHeal === null || selHeal < healLv)) {
			updates.selectedHealLevel = healLv;
		}

		const ownedSkills: OwnedSkills = {
			normalAttacks: progress.normalAttacks ?? [],
			specialAttacks: progress.specialAttacks ?? [],
			healLevel: progress.healLevel ?? null,
		};
		const availSpecial = getAvailableSpecialAttacks(ownedSkills);
		const selSpecial = progress.selectedSpecialAttackId ?? null;
		const bestSpecial =
			availSpecial.length > 0
				? availSpecial[availSpecial.length - 1]!.specialAttackId
				: null;
		if (bestSpecial && selSpecial !== bestSpecial) {
			updates.selectedSpecialAttackId = bestSpecial;
		}

		if (Object.keys(updates).length > 0) {
			updateLoadout(updates).then((r) => r.ok && refresh());
		}
	}, [progress, loading, refresh]);

	const handlePurchase = useCallback(
		async (
			fn: () => Promise<{ ok: boolean; error?: string }>,
			label: string,
		) => {
			setError(null);
			const result = await fn();
			if (result.ok) refresh();
			else setError(result.error ?? `${label}に失敗しました`);
		},
		[refresh],
	);

	if (loading) {
		return (
			<div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
				<ProtectedStar />
				<AuroraGlow width={800} height={400} opacity={0.2} blur={60} />
				<p className="relative z-10 text-white/60 font-dot-gothic-16">
					読み込み中…
				</p>
			</div>
		);
	}

	const typingCount = progress?.totalTypingCount ?? 0;
	const normalAttacks = progress?.normalAttacks ?? [];
	const specialAttacks = progress?.specialAttacks ?? [];
	const healLevel = progress?.healLevel ?? null;
	const starHpLevel = progress?.starHpLevel ?? 1;

	const ownedSkills: OwnedSkills = { normalAttacks, specialAttacks, healLevel };
	const availableNormal = getAvailableNormalAttacks(ownedSkills);
	const availableSpecial = getAvailableSpecialAttacks(ownedSkills);
	const selNormal = progress?.selectedNormalAttackId ?? "red";
	const selSpecial = progress?.selectedSpecialAttackId ?? null;

	const handleLoadoutUpdate = async (
		updates: Parameters<typeof updateLoadout>[0],
	) => {
		setError(null);
		const result = await updateLoadout(updates);
		if (result.ok) refresh();
		else setError(result.error ?? "スキル設定に失敗しました");
	};

	return (
		<div className="relative min-h-screen overflow-hidden flex flex-col items-center">
			<ProtectedStar />
			<AuroraGlow width={800} height={400} opacity={0.2} blur={60} />


			<div className="relative z-10 w-full max-w-2xl mx-auto px-4 pt-8 pb-20 flex flex-col gap-5">
				<StarShieldTitle size="md" />
				{/* ヘッダー */}
				<motion.div
					initial={{ opacity: 0, y: -16 }}
					animate={{ opacity: 1, y: 0 }}
					className="flex items-center justify-center gap-4 flex-col"
				>
					<Typography variant="h2" font="cherry-bomb-one" className="text-white">
					スキルショップ
					</Typography>
				</motion.div>

				{/* 所持 typing 数 */}
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.05 }}
					className="flex items-center justify-center gap-4"
				>
					<div className="rounded-2xl px-4 py-2 bg-white/3 border border-white/8 w-full">
						<div className="flex items-center gap-4">
							<Image
								src={ICONS.TYPIST}
								alt="Typing"
								width={24}
								height={24}
								className="select-none"
							/>
							<Typography variant="h2" font="dot-gothic-16" className="text-yellow-400 font-bold">
							{typingCount.toLocaleString()}
							</Typography>
						</div>
					</div>
					<Link
						href={`/game/${roomId}/star-shield`}
						className={button({ variant: "success", size: "lg" })}
					>
						<Typography variant="label" font="cherry-bomb-one" className="text-white whitespace-nowrap">
							タイトルにもどる
						</Typography>
					</Link>
				</motion.div>

				{error && (
					<div className="rounded-xl bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 text-sm">
						{error}
					</div>
				)}

				{/* ロードアウト設定（常時表示） */}
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="rounded-2xl p-5 bg-white/3 border border-white/8 flex flex-col gap-5"
				>
					<p className="text-sm font-dot-gothic-16 text-white/80 flex items-center gap-2">
						⚙️ 現在の装備
						<span className="text-[10px] text-white/30 font-normal font-dot-gothic-16">
							ゲームで使用するスキルの状態
						</span>
					</p>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* ===================== ATTACK COLUMN ===================== */}
						<div className="flex flex-col gap-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 overflow-hidden h-full">
							<h3 className="text-indigo-400 text-xs font-bold flex items-center gap-2 font-dot-gothic-16 mb-1">
								<Image
									src={ICONS.SHOOTER}
									alt="Shooter"
									width={16}
									height={16}
									className="opacity-80"
								/>
								ATTACK（Shooter）
							</h3>

							{/* 通常攻撃 */}
							<div>
								<p className="text-[10px] text-indigo-400 font-dot-gothic-16 mb-1.5 flex items-center gap-1.5">
									<span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0 opacity-50" />
									通常攻撃
								</p>
								{(() => {
									const selAttack = availableNormal.find(
										(a) => a.techniqueId === selNormal,
									);
									if (!selAttack) return null;
									return (
										<LoadoutAnimPreview
											techniqueId={selAttack.techniqueId}
											level={selAttack.level}
										/>
									);
								})()}
							</div>

							{/* 必殺技 */}
							{availableSpecial.length > 0 && (
								<div>
									<p className="text-[10px] text-indigo-400 font-dot-gothic-16 mb-1.5 flex items-center gap-1.5">
										<span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0 opacity-50" />
										必殺技
									</p>
									{(() => {
										const selSpec = availableSpecial.find(
											(a) => a.specialAttackId === selSpecial,
										);
										if (!selSpec) return null;
										return (
											<SpecialAttackLoadoutPreview
												specialAttackId={selSpec.specialAttackId}
												level={selSpec.level}
												bulletColor={
													TECHNIQUES[selNormal as TechniqueId]?.color ??
													"#ef4444"
												}
											/>
										);
									})()}
								</div>
							)}
						</div>

						{/* ===================== DEFENCE COLUMN ===================== */}
						<div className="flex flex-col gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 overflow-hidden h-full">
							<h3 className="text-emerald-400 text-xs font-bold flex items-center gap-2 font-dot-gothic-16 mb-1">
								<Image
									src={ICONS.TYPIST}
									alt="Typist"
									width={16}
									height={16}
									className="opacity-80"
								/>
								DEFENCE（Typist）
							</h3>

							{/* 星のHP */}
							<div>
								<p className="text-[10px] text-emerald-400 font-dot-gothic-16 mb-1.5 flex items-center gap-1.5">
									<span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0 opacity-50" />
									星のHP
								</p>
								<div className="flex items-center gap-2">
									<span className="text-white text-lg font-dot-gothic-16">
										HP
									</span>
									<span className="text-xl font-bold text-emerald-400 font-dot-gothic-16 tabular-nums">
										{LEVEL_STAR_HP[starHpLevel as 1 | 2 | 3 | 4 | 5]}
									</span>
								</div>
								<div className="mt-1.5 flex items-center gap-2">
									<div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
										<div
											className="h-full bg-linear-to-r from-emerald-700 to-emerald-400 transition-all duration-500 w-(--hp-w)"
											style={
												{
													"--hp-w": `${(starHpLevel / 5) * 100}%`,
												} as CSSProperties
											}
										/>
									</div>
									<span className="text-[10px] text-white/40 tabular-nums w-8 text-right">
										Lv. {starHpLevel}
									</span>
								</div>
							</div>

							{/* ヒール */}
							{healLevel !== null && (
								<div className="h-full flex flex-col justify-end">
									<p className="text-[10px] text-emerald-400 font-dot-gothic-16 mb-1.5 flex items-center gap-1.5">
										<span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0 opacity-50" />
										ヒール
									</p>
									<div className="flex items-center gap-2 flex-row">
										<span className="text-lg font-bold text-emerald-400 font-dot-gothic-16 tabular-nums">
											+
											{
												LEVEL_HEAL_RECOVERY[
													healLevel as 1 | 2 | 3 | 4 | 5 | 6
												] as number
											}
											HP {healLevel === 6 && "+全破壊"}
										</span>
									</div>
									<div className="mt-2">
										<HealLoadoutPreview
											healValue={
												LEVEL_HEAL_RECOVERY[
													healLevel as 1 | 2 | 3 | 4 | 5 | 6
												] as number
											}
											isFullRestore={healLevel >= 5}
											starHpMax={
												LEVEL_STAR_HP[starHpLevel as 1 | 2 | 3 | 4 | 5]
											}
											healLevel={healLevel}
										/>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* 通常攻撃選択 */}
					{availableNormal.length > 0 && (
						<div className="pt-2 border-t border-white/8">
							<p className="text-[10px] text-indigo-400 font-dot-gothic-16 mb-2 flex items-center gap-1.5">
								<span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0 opacity-50" />
								通常攻撃を選択
							</p>
							<div className="flex flex-wrap justify-between">
								{availableNormal.map(({ techniqueId, level }) => {
									const tech = TECHNIQUES[techniqueId];
									const isActive = selNormal === techniqueId;
									return (
										<button
											key={techniqueId}
											type="button"
											onClick={() =>
												handleLoadoutUpdate({
													selectedNormalAttackId: techniqueId,
												})
											}
											className={cn(
												"flex items-center gap-2 px-5 py-3 rounded-xl border-2 transition-all font-dot-gothic-16 text-sm",
												isActive
													? "shadow-[0_0_12px_rgba(255,255,255,0.2)]"
													: "border-white/15 bg-white/3 hover:bg-white/6",
											)}
											style={
												isActive
													? {
															borderColor: tech.color,
															boxShadow: `0 0 12px ${tech.color}80`,
														}
													: undefined
											}
										>
											<span
												className="w-3 h-3 rounded-full shrink-0"
												style={{ backgroundColor: tech.color }}
											/>
											<span className="text-white text-xs">Lv.{level}</span>
										</button>
									);
								})}
							</div>
						</div>
					)}
				</motion.div>

				{/* スキル一覧：ATTACK / DEFENCE */}
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.15 }}
					className="flex flex-col gap-4"
				>
					{/* ATTACK セクション */}
					<SectionDivider
						icon={ICONS.SHOOTER}
						label="ATTACK"
						color="indigo"
						desc="Shooter・攻撃担当"
					/>

					{/* 通常攻撃 */}
					<SkillCard title="通常攻撃" jurisdiction="attack">
						<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
							{NORMAL_ATTACK_IDS.map((techniqueId) => {
								const tech = TECHNIQUES[techniqueId];
								const ownedAttack = normalAttacks.find(
									(a) => a.techniqueId === techniqueId,
								);
								const currentLevel = ownedAttack ? ownedAttack.level : 0;

								return (
									<SkillRow
										key={techniqueId}
										label={
											<div className="flex items-center gap-2">
												<span
													className="w-3 h-3 rounded-full shrink-0"
													style={{ backgroundColor: tech.color }}
												/>
												<span className="font-dot-gothic-16 font-bold">
													{tech.label}
												</span>
											</div>
										}
										detail={getTechEffectLabel(techniqueId)}
										currentLevel={currentLevel}
										maxLevel={5}
										onClick={() =>
											setPreview({ kind: "normalAttack", techniqueId })
										}
										progressBarColor={tech.color}
									/>
								);
							})}
						</div>
					</SkillCard>

					{/* 必殺技 */}
					<SkillCard title="必殺技" jurisdiction="attack">
						{SPECIAL_ATTACK_IDS.map((id) => {
							const ownedSA = specialAttacks.find(
								(a) => a.specialAttackId === id,
							);
							const currentLevel = ownedSA ? ownedSA.level : 0;

							return (
								<SkillRow
									key={id}
									label={
										<span className="font-dot-gothic-16 font-bold">
											{SPECIAL_LABELS[id] ?? id}
										</span>
									}
									detail="単語を打ち切ったとき、強攻撃を発生させる"
									currentLevel={currentLevel}
									maxLevel={10}
									onClick={() => setPreview({ kind: "specialAttack", id })}
									progressBarColor="#818cf8"
								/>
							);
						})}
					</SkillCard>

					{/* DEFENCE セクション */}
					<SectionDivider
						icon={ICONS.TYPIST}
						label="DEFENCE"
						color="emerald"
						desc="Typist・守護担当"
					/>

					{/* 星のHP */}
					<SkillCard title="星のHP強化" jurisdiction="defence">
						{starHpLevel < 5 ? (
							(() => {
								const nextLevel = (starHpLevel + 1) as 2 | 3 | 4 | 5;
								return (
									<SkillRow
										label={
											<span>
												HP上限{" "}
												<span className="text-emerald-400 font-bold">
													{LEVEL_STAR_HP[starHpLevel as 1 | 2 | 3 | 4 | 5]}
												</span>{" "}
												→ {LEVEL_STAR_HP[nextLevel]}（Lv. {starHpLevel} → Lv.{" "}
												{nextLevel}）
											</span>
										}
										currentLevel={starHpLevel}
										maxLevel={5}
										onClick={() => setPreview({ kind: "starHp" })}
										progressBarColor="#34d399"
									/>
								);
							})()
						) : (
							<SkillRow
								label={
									<span>
										HP上限{" "}
										<span className="text-emerald-400 font-bold">
											{LEVEL_STAR_HP[5]}
										</span>
										（MAX）
									</span>
								}
								currentLevel={5}
								maxLevel={5}
								onClick={() => setPreview({ kind: "starHp" })}
								progressBarColor="#34d399"
							/>
						)}
					</SkillCard>

					{/* ヒール */}
					<SkillCard title="ヒール" jurisdiction="defence">
						{!healLevel ? (
							<>
								<p className="text-white/40 text-xs mb-3 font-dot-gothic-16">
									単語を打ち切ったとき、星のHPを回復します
								</p>
								<SkillRow
									label={<span>ヒール解放</span>}
									currentLevel={0}
									maxLevel={6}
									onClick={() => setPreview({ kind: "heal" })}
									progressBarColor="#34d399"
								/>
							</>
						) : healLevel < 6 ? (
							(() => {
								const nextLevel = (healLevel + 1) as 2 | 3 | 4 | 5 | 6;
								return (
									<SkillRow
										label={
											<span>
												回復量{" "}
												<span className="text-emerald-400 font-bold">
													{healLevel >= 5
														? "全回復"
														: `+${LEVEL_HEAL_RECOVERY[healLevel as 1 | 2 | 3 | 4 | 5 | 6]} HP`}
												</span>{" "}
												→ Lv. {nextLevel === 6 ? "max" : nextLevel}
											</span>
										}
										currentLevel={healLevel}
										maxLevel={6}
										onClick={() => setPreview({ kind: "heal" })}
										progressBarColor="#34d399"
									/>
								);
							})()
						) : (
							<SkillRow
								label={
									<span>
										全回復{" "}
										<span className="text-emerald-400 font-bold">
											+ 全破壊ボーナス
										</span>
										（MAX）
									</span>
								}
								currentLevel={6}
								maxLevel={6}
								onClick={() => setPreview({ kind: "heal" })}
								progressBarColor="#34d399"
							/>
						)}
					</SkillCard>
				</motion.div>
			</div>

			{/* プレビューモーダル */}
			<AnimatePresence>
				{preview && (
					<SkillPreviewModal
						preview={preview}
						progress={progress}
						typingCount={typingCount}
						handlePurchase={handlePurchase}
						onClose={() => setPreview(null)}
					/>
				)}
			</AnimatePresence>
		</div>
	);
}
