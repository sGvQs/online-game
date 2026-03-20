import { tv } from "tailwind-variants";

export const roleSelectionScreen = tv({
	slots: {
		sectionTitle: [
			"text-4xl font-black leading-snug",
			"font-cherry-bomb-one",
			"bg-linear-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]",
		],
		difficultyCard:
			"rounded-2xl p-5 flex flex-col gap-3 transition-opacity bg-white/3 border border-white/8",
		difficultyCardTitle:
			"text-[11px] font-cherry-bomb-one text-[rgba(129,140,248,0.6)]",
		difficultyButton: [
			"flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200",
			"font-cherry-bomb-one",
			"[background:var(--diff-bg)] [border:var(--diff-border)] [box-shadow:var(--diff-glow)] [color:var(--diff-color)]",
		],
		hellLockLabel: "text-[9px] shrink-0 font-dot-gothic-16 text-white/15",
		rateLabel:
			"text-[10px] shrink-0 tabular-nums font-dot-gothic-16 [color:var(--diff-rate-color)]",
		successHint:
			"text-[10px] leading-relaxed mt-1 font-cherry-bomb-one [color:var(--diff-hint-color)] opacity-70",
		hostWaiting: "text-[10px] mt-1 font-cherry-bomb-one text-white/15",
		roleButton: [
			"rounded-2xl p-4 text-left transition-all duration-200 flex-1 cursor-pointer hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]",
			"[background:var(--role-bg)] [border:var(--role-border)] [box-shadow:var(--role-glow)]",
		],
		roleIcon: "object-contain [filter:var(--role-icon-filter)]",
		roleTitle:
			"text-base font-bold font-cherry-bomb-one [color:var(--role-title-color)]",
		roleDescription:
			"text-[11px] leading-snug mb-1 font-dot-gothic-16 [color:var(--role-desc-color)]",
		roleDetail:
			"text-[10px] leading-relaxed font-dot-gothic-16 [color:var(--role-detail-color)]",
		statusPanel:
			"rounded-2xl px-5 py-4 [background:var(--status-panel-bg)] [border:var(--status-panel-border)]",
		statusMessage:
			"text-sm mb-3 min-h-5 font-cherry-bomb-one [color:var(--status-message-color)]",
		statusDot:
			"w-2 h-2 rounded-full shrink-0 [background-color:var(--status-dot-color)]",
		playerName:
			"text-sm flex-1 truncate font-dot-gothic-16 [color:var(--player-name-color)]",
		playerNameSuffix: "text-xs ml-1 font-dot-gothic-16 text-brand-500/70",
		roleBadge: [
			"text-xs px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1",
			"font-cherry-bomb-one [color:var(--badge-color)] [background:var(--badge-bg)] [border:var(--badge-border)]",
		],
		selectingLabel: "text-xs shrink-0 font-cherry-bomb-one text-white/20",
	},
});
