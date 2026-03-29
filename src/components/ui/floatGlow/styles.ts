export enum GlowVariant {
	Solid = "solid",
	Primary = "primary",
	Secondary = "secondary",
	Success = "success",
	Danger = "danger",
	Yellow = "yellow",
	Blue = "blue",
}

export const glowColors: Record<GlowVariant, string> = {
	[GlowVariant.Solid]: "rgba(67,56,202,0.5)",
	[GlowVariant.Primary]: "rgba(99,102,241,0.5)",
	[GlowVariant.Secondary]: "rgba(236,72,153,0.5)",
	[GlowVariant.Success]: "rgba(34,197,94,0.5)",
	[GlowVariant.Danger]: "rgba(239,68,68,0.5)",
	[GlowVariant.Yellow]: "rgba(251,191,36,0.5)",
	[GlowVariant.Blue]: "rgba(59,130,246,0.5)",
};
