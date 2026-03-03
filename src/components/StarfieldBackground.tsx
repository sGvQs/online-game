'use client'

import { memo, useEffect, useState, useMemo } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { Engine } from '@tsparticles/engine'

const PARTICLES_OPTIONS = {
                background: {
                    color: {
                        value: 'transparent',
                    },
                },
                fpsLimit: 60,
                particles: {
                    color: {
                        value: '#ffffff',
                    },
                    links: {
                        enable: false,
                    },
                    move: {
                        enable: true,
                        speed: 0.3,
                        direction: 'top-right' as const,
                        random: false,
                        straight: true,
                        outModes: {
                            default: 'out' as const,
                        },
                    },
                    number: {
                        value: 1000,
                        density: {
                            enable: true,
                            width: 1920,
                            height: 1080,
                        },
                    },
                    opacity: {
                        value: { min: 0.1, max: 1 },
                        animation: {
                            enable: true,
                            speed: 0.1,
                            startValue: 'random' as const,
                        },
                    },
                    shape: {
                        type: 'circle',
                    },
                    size: {
                        value: { min: 0.1, max: 0.8 },
                    },
                },
                detectRetina: true,
                style: {
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    zIndex: '-1',
                    pointerEvents: 'none',
                },
            }

export const StarfieldBackground = memo(function StarfieldBackground() {
    const [init, setInit] = useState(false)

    // options を安定な参照にすることで再レンダリング時にパーティクルが再初期化されない
    const options = useMemo(() => PARTICLES_OPTIONS, [])

    useEffect(() => {
        initParticlesEngine(async (engine: Engine) => {
            await loadSlim(engine)
        })
            .then(() => setInit(true))
            .catch((err) => {
                console.error('[StarfieldBackground] initParticlesEngine failed:', err)
            })
    }, [])

    if (!init) {
        return null
    }

    return <Particles id="tsparticles" options={options} />
})
