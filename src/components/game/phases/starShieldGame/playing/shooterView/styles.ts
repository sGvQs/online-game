import { tv } from 'tailwind-variants'

export const shooterView = tv({
    slots: {
        asteroidHpBar: 'h-full rounded-full bg-green-500 transition-[width] duration-150 [width:var(--asteroid-hp-pct)]',
        bulletCircle: 'absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 [width:var(--bullet-size)] [height:var(--bullet-size)]',
        bulletInner: 'w-full h-full rounded-full [background-color:var(--bullet-color,#ef4444)] [box-shadow:0_0_8px_var(--bullet-color,#ef4444cc)]',
        contactExplosion: 'absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 [left:var(--exp-left)] [top:var(--exp-top)]',
        explosionCore: 'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48',
        explosionImage: 'object-contain drop-shadow-[0_0_30px_rgba(255,100,50,0.8)] [filter:brightness(1.2)_saturate(1.3)]',
        explosionFlash: 'absolute rounded-full bg-white w-12 h-12 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_80px_40px_rgba(255,200,150,0.8)]',
        explosionEffect: 'absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none [left:var(--exp-left)] [top:var(--exp-top)]',
        explosionSmall: 'object-contain drop-shadow-[0_0_20px_rgba(255,100,50,0.7)] [filter:brightness(1.2)_saturate(1.3)]',
        dino: 'absolute z-10 pointer-events-none origin-center w-24 h-24 [left:var(--dino-left)] [bottom:var(--dino-bottom)]',
    },
})
