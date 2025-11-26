"use client";

/**
 * @author: @dorian_baffier
 * @description: Hold Button
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "motion/react";
import {
    Trash2Icon,
    XCircleIcon,
    AlertCircleIcon,
    ArchiveXIcon,
    BanIcon,
} from "lucide-react";
import { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";

const holdButtonVariants = cva("min-w-40 relative overflow-hidden touch-none", {
    variants: {
        variant: {
            red: [
                "bg-red-100 dark:bg-red-200",
                "hover:bg-red-100 dark:hover:bg-red-200",
                "text-red-500 dark:text-red-600",
                "border border-red-200 dark:border-red-300",
            ],
            green: [
                "bg-green-100 dark:bg-green-200",
                "hover:bg-green-100 dark:hover:bg-green-200",
                "text-green-500 dark:text-green-600",
                "border border-green-200 dark:border-green-300",
            ],
            blue: [
                "bg-blue-100 dark:bg-blue-200",
                "hover:bg-blue-100 dark:hover:bg-blue-200",
                "text-blue-500 dark:text-blue-600",
                "border border-blue-200 dark:border-blue-300",
            ],
            orange: [
                "bg-orange-100 dark:bg-orange-200",
                "hover:bg-orange-100 dark:hover:bg-orange-200",
                "text-orange-500 dark:text-orange-600",
                "border border-orange-200 dark:border-orange-300",
            ],
            grey: [
                "bg-gray-100 dark:bg-gray-200",
                "hover:bg-gray-100 dark:hover:bg-gray-200",
                "text-gray-500 dark:text-gray-600",
                "border border-gray-200 dark:border-gray-300",
            ],
        },
    },
    defaultVariants: {
        variant: "red",
    },
});

interface HoldButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof holdButtonVariants> {
    holdDuration?: number;
    onHoldComplete?: () => void;
}

export default function HoldButton({
    className,
    variant = "red",
    holdDuration = 3000,
    onHoldComplete,
    ...props
}: HoldButtonProps) {
    const [isHolding, setIsHolding] = useState(false);
    const controls = useAnimation();

    async function handleHoldStart() {
        setIsHolding(true);
        controls.set({ width: "0%" });
        await controls.start({
            width: "100%",
            transition: {
                duration: holdDuration / 1000,
                ease: "linear",
            },
        });
        if (onHoldComplete) {
            onHoldComplete();
        }
    }

    function handleHoldEnd() {
        setIsHolding(false);
        controls.stop();
        controls.start({
            width: "0%",
            transition: { duration: 0.1 },
        });
    }

    return (
        <Button
            className={cn(holdButtonVariants({ variant, className }))}
            onMouseDown={handleHoldStart}
            onMouseUp={handleHoldEnd}
            onMouseLeave={handleHoldEnd}
            onTouchStart={handleHoldStart}
            onTouchEnd={handleHoldEnd}
            onTouchCancel={handleHoldEnd}
            {...props}
        >
            <motion.div
                initial={{ width: "0%" }}
                animate={controls}
                className={cn("absolute left-0 top-0 h-full", {
                    "bg-red-200/30 dark:bg-red-300/30": variant === "red",
                    "bg-green-200/30 dark:bg-green-300/30": variant === "green",
                    "bg-blue-200/30 dark:bg-blue-300/30": variant === "blue",
                    "bg-orange-200/30 dark:bg-orange-300/30":
                        variant === "orange",
                    "bg-gray-200/30 dark:bg-gray-300/30": variant === "grey",
                })}
            />
            <span className="relative z-10 w-full flex items-center justify-center gap-2">
                {(variant === "red" || !variant) && (
                    <Trash2Icon className="w-4 h-4" />
                )}
                {variant === "green" && <ArchiveXIcon className="w-4 h-4" />}
                {variant === "blue" && <XCircleIcon className="w-4 h-4" />}
                {variant === "orange" && (
                    <AlertCircleIcon className="w-4 h-4" />
                )}
                {variant === "grey" && <BanIcon className="w-4 h-4" />}
                {!isHolding ? "Hold me" : "Release"}
            </span>
        </Button>
    );
}
