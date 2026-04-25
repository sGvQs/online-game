"use client";

import { StarVisual } from "@/components/game/common/starShield/starVisual";
import { STAR_POSITION } from "@/components/game/phases/starShieldGame/playing/protectedStar";

export function MeteorOrbitStar() {
	return <StarVisual position={STAR_POSITION} />;
}
