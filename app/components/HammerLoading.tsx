"use client";
import { motion } from "framer-motion";

interface HammerLoadingProps {
    message?: string;
    size?: number;
    fullscreen?: boolean;
    blurBackground?: boolean;
}

export default function HammerLoading({
    message = "Carregando...",
    size = 140,
    fullscreen = false,
    blurBackground = true,
}: HammerLoadingProps) {
    const loaderWidth = size;
    const loaderHeight = size * 0.15;

    return (
        <div
            style={{
                position: fullscreen ? "fixed" : "relative",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                background: fullscreen
                    ? blurBackground
                        ? "rgba(0,0,0,0.5)"
                        : "transparent"
                    : "transparent",
                zIndex: 9999,
            }}
        >
            {/* Barra de animação tipo martelo */}
            <div
                style={{
                    width: loaderWidth,
                    height: loaderHeight,
                    borderRadius: loaderHeight / 2,
                    border: "2px solid #514b82",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <motion.div
                    style={{
                        background: "#514b82",
                        height: "100%",
                        width: "30%",
                        borderRadius: loaderHeight / 2,
                        position: "absolute",
                        left: 0,
                    }}
                    animate={{ left: ["0%", "70%", "0%"] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                />
            </div>

            {/* Texto */}
            {message && (
                <p
                    style={{
                        marginTop: 16,
                        color: "#fff",
                        fontWeight: 600,
                    }}
                >
                    {message}
                </p>
            )}
        </div>
    );
}
