"use client";

import { motion } from "framer-motion";
import { Typography } from "@/components/ui/typography";
import type { GradientColor } from "@/components/ui/typography/styles";

interface PukapukaLogoProps {
    className?: string;
}

export function PukapukaLogo({ className }: PukapukaLogoProps) {
    const renderChars = (text: string, gradient: GradientColor) => {
        return text.split("").map((char, index) => {
            const motionProps = {
                animate: {
                    y: [0, -8, 0],
                    rotate: [0, index % 2 === 0 ? 5 : -5, 0],
                },
                whileHover: {
                    scale: 1.5,
                    y: -15,
                    filter: "brightness(1.2) drop-shadow(0 0 15px rgba(255,255,255,0.4))",
                    zIndex: 20,
                },
                transition: {
                    y: {
                        duration: 3 + (index % 3) * 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.15,
                    },
                    rotate: {
                        duration: 4 + (index % 2) * 1,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.2,
                    },
                    scale: { type: "spring", stiffness: 400, damping: 10 },
                    zIndex: { duration: 0 }
                }
            };

            return (
                <Typography
                    as={motion.span}
                    variant="display"
                    gradientColor={gradient}
                    key={`${text}-${index}`}
                    className="inline-block py-2 px-3 cursor-pointer select-none"
                    {...(motionProps as any)}
                >
                    {char}
                </Typography>
            );
        });
    };

    return (
        <div className={`flex flex-col items-center justify-center pb-4 mb-2 ${className || ""}`}>
            <div className="flex">
                {renderChars("Pukapuka", "whiteToBlue")}
            </div>
            <div className="flex">
                {renderChars("Space", "PurpleToPink")}
            </div>
        </div>
    );
}
