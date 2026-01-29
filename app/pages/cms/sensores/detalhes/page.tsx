"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the client component with SSR disabled
const SensorDetalhesContent = dynamic(() => import("./SensorDetalhesContent"), {
    ssr: false,
    loading: () => <div>Loading...</div>,
});

export default function SensorDetalhesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SensorDetalhesContent />
        </Suspense>
    );
}
