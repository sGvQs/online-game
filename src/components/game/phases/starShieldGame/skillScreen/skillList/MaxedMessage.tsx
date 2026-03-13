export function MaxedMessage({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 py-2.5">
            <span className="text-amber-400 text-base">🏆</span>
            <span className="text-amber-400/80 text-sm font-dot-gothic-16">{children}</span>
        </div>
    )
}
