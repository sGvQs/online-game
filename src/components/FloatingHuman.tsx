'use client'

import { motion } from 'framer-motion'

const FLOAT_DURATION = 50

export function FloatingHuman() {
    return (
        <div
            className="fixed inset-0 pointer-events-none overflow-visible"
            style={{ zIndex: 0 }}
        >
            <motion.div
                className="absolute"
                style={{
                    left: '2vw',
                    top: '62%',
                    width: 48,
                    height: 48,
                }}
                initial={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                    rotate: 0,
                }}
                animate={{
                    x: ['-6vw', '106vw'],
                    y: ['0vh', '-60vh'],
                    rotate: [0, 260],
                }}
                transition={{
                    duration: FLOAT_DURATION,
                    repeat: Infinity,
                    repeatDelay: 0,
                    delay: 8,
                    ease: 'linear',
                    times: [0, 0.04, 0.96, 1],
                }}
            >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/svg/human.svg"
                        alt=""
                        width={48}
                        height={48}
                        className="w-full h-full object-contain"
                    />
            </motion.div>
        </div>
    )
}
