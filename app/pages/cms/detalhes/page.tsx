"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the client component with SSR disabled
const CmDetalhesContent = dynamic(() => import("./CmDetalhesContent"), {
    ssr: false,
    loading: () => <div>Loading...</div>,
});

export default function CmDetalhesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CmDetalhesContent />
        </Suspense>
    );
}