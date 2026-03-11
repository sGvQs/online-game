import { tv } from 'tailwind-variants'
import { type ElementType, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type TypographyVariant = 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'label' | 'caption'
type TypographyFont = 'cherry-bomb-one' | 'dot-gothic-16' | 'rubik-puddles' | 'sans'

interface TypographyProps extends HTMLAttributes<HTMLElement> {
    variant: TypographyVariant
    font?: TypographyFont
    as?: ElementType
    className?: string
    children: ReactNode
}

const typography = tv({
    variants: {
        variant: {
            display: 'text-6xl md:text-8xl font-black tracking-tight leading-none',
            h1: 'text-4xl',
            h2: 'text-2xl',
            h3: 'text-xl',
            h4: 'text-sm font-bold uppercase tracking-wider',
            body: 'text-sm leading-relaxed',
            small: 'text-xs',
            label: 'text-[11px] uppercase tracking-wider',
            caption: 'text-[9px]',
        },
        font: {
            'cherry-bomb-one': 'font-cherry-bomb-one',
            'dot-gothic-16': 'font-dot-gothic-16',
            'rubik-puddles': 'font-rubik-puddles',
            'sans': 'font-sans',
        },
    },
})

const FONT_VARIANTS = {
    'rubik-puddles':   ['display'],
    'cherry-bomb-one': ['h1', 'h2', 'h3'],
    'dot-gothic-16':   ['h4', 'body', 'small', 'label', 'caption'],
    'sans':            [],
} as const satisfies Record<TypographyFont, readonly TypographyVariant[]>

function getDefaultFont(variant: TypographyVariant): TypographyFont {
    for (const [font, variants] of Object.entries(FONT_VARIANTS) as [TypographyFont, readonly TypographyVariant[]][]) {
        if ((variants as readonly string[]).includes(variant)) return font
    }
    return 'dot-gothic-16'
}

const DEFAULT_ELEMENTS: Record<TypographyVariant, ElementType> = {
    display: 'h1',
    h1: 'h1',
    h2: 'h2',
    h3: 'h3',
    h4: 'h4',
    body: 'p',
    small: 'p',
    label: 'span',
    caption: 'span',
}

export function Typography({
    variant,
    font,
    as,
    className,
    children,
    ...props
}: TypographyProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Tag = (as ?? DEFAULT_ELEMENTS[variant]) as any
    const appliedFont = font ?? getDefaultFont(variant)

    return (
        <Tag
            className={cn(typography({ variant, font: appliedFont }), className)}
            {...props}
        >
            {children}
        </Tag>
    )
}
