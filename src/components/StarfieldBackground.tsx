'use client'

import { useCallback, useEffect, useState } from 'react'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import type { Engine, Container } from '@tsparticles/engine'

export function StarfieldBackground() {
    const [init, setInit] = useState(false)

    useEffect(() => {
        initParticlesEngine(async (engine: Engine) => {
            await loadSlim(engine)
        }).then(() => {
            setInit(true)
        })
    }, [])

    const particlesLoaded = useCallback(async (container?: Container) => {
        // console.log('Particles loaded', container)
    }, [])

    if (!init) {
        return null
    }

    return (
        <Particles
            id="tsparticles"
            particlesLoaded={particlesLoaded}
            options={{
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
                        direction: 'top-right',
                        random: false,
                        straight: true,
                        outModes: {
                            default: 'out',
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
                            startValue: 'random',
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
            }}
        />
    )
}
