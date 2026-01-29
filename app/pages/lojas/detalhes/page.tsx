"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the client component with SSR disabled
const LojaDetalhesContent = dynamic(() => import("./LojaDetalhesContent"), {
    ssr: false,
    loading: () => <div>Loading...</div>,
});

export default function LojaDetalhesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LojaDetalhesContent />
        </Suspense>
    );
}