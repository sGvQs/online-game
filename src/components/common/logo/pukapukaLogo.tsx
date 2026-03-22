"use client";

import { motion } from "framer-motion";
import { Typography } from "@/components/ui/typography";
import { pukapukaLogoStyles } from "./pukapukaLogo.styles";

interface PukapukaLogoProps {
    className?: string;
}

export function PukapukaLogo({ className }: PukapukaLogoProps) {
    const styles = pukapukaLogoStyles();

    const renderChars = (text: string, className: string) => {
        return text.split("").map((char, index) => (
            <motion.span
                key={`${text}-${index}`}
                className={`inline-block py-4 px-4 cursor-pointer select-none ${className}`}
                animate={{
                    y: [0, -8, 0],
                }}
                whileHover={{
                    scale: 1.5,
                    y: -15,
                    filter: "brightness(1.2) drop-shadow(0 0 15px rgba(255,255,255,0.4))",
                    zIndex: 20,
                }}
                transition={{
                    y: {
                        duration: 3 + (index % 3) * 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.15,
                    },
                    scale: { type: "spring", stiffness: 400, damping: 10 },
                    zIndex: { duration: 0 }
                }}
            >
                {char}
            </motion.span>
        ));
    };

    return (
        <Typography
            variant="display"
            className={styles.titleBlock({ className })}
        >
            <span className="flex flex-col items-center justify-center">
                <span className="flex">
                    {renderChars("Pukapuka", styles.titleSpanWhite())}
                </span>
                <span className="flex">
                    {renderChars("Space", styles.titleSpanPurple())}
                </span>
            </span>
        </Typography>
    );
}
