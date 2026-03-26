"use client";

import { glassCard } from "./styles";
import { cn } from "@/lib/utils";

interface GlassCardProps {
	children: React.ReactNode;
	className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
	const styles = glassCard();
	return <div className={cn(styles.root(), className)}>{children}</div>;
}
