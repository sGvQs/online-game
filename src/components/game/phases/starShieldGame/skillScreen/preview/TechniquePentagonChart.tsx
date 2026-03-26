const PENTAGON_LABELS = [
	"ダメージ",
	"当てやすさ",
	"サポート",
	"必殺技相性",
	"かっこよさ",
] as const;

export function TechniquePentagonChart({
	stats,
	color,
}: {
	stats: {
		damage: number;
		hitEase: number;
		support: number;
		specialCombo: number;
		coolness: number;
	};
	color: string;
}) {
	const size = 200;
	const cx = size / 2;
	const cy = size / 2;
	const maxR = 44;
	const values = [
		stats.damage,
		stats.hitEase,
		stats.support,
		stats.specialCombo,
		stats.coolness,
	];

	const getPoint = (angleDeg: number, r: number) => {
		const rad = ((angleDeg - 90) * Math.PI) / 180;
		return { x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r };
	};

	const dataPoints = values.map((v, i) => {
		const r = 8 + ((Math.max(1, Math.min(5, v)) - 1) / 4) * (maxR - 8);
		return getPoint(i * 72, r);
	});
	const dataPath =
		dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
		" Z";

	const gridPaths = [1, 2, 3, 4, 5].map((level) => {
		const r = 8 + ((level - 1) / 4) * (maxR - 8);
		const pts = [0, 1, 2, 3, 4].map((i) => getPoint(i * 72, r));
		return (
			pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z"
		);
	});

	return (
		<div className="flex flex-col items-center gap-3">
			<p className="text-indigo-400 text-[12px] font-bold font-dot-gothic-16 tracking-wider">
				特性評価
			</p>
			<svg width={size} height={size} className="shrink-0">
				<g fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5">
					{gridPaths.map((d, i) => (
						<path key={i} d={d} />
					))}
				</g>
				<g stroke="rgba(255,255,255,0.12)" strokeWidth="0.5">
					{[0, 1, 2, 3, 4].map((i) => {
						const p = getPoint(i * 72, maxR);
						return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} />;
					})}
				</g>
				<path
					d={dataPath}
					fill={`${color}40`}
					stroke={color}
					strokeWidth="1.5"
					strokeLinejoin="round"
				/>
				<g
					fill="rgba(255,255,255,0.7)"
					fontSize="9"
					fontFamily="var(--font-dot-gothic-16)"
				>
					{PENTAGON_LABELS.map((label, i) => {
						const p = getPoint(i * 72, maxR + 14);
						const anchor =
							i === 0 ? "middle" : i < 3 ? "start" : i === 3 ? "middle" : "end";
						return (
							<text
								key={i}
								x={p.x}
								y={p.y}
								textAnchor={anchor}
								dominantBaseline="middle"
							>
								{label}
							</text>
						);
					})}
				</g>
			</svg>
		</div>
	);
}
