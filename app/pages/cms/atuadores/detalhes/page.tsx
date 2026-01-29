"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the client component with SSR disabled
const AtuadorDetalhesContent = dynamic(() => import("./AtuadorDetalhesContent"), {
    ssr: false,
    loading: () => <div>Loading...</div>,
});

export default function AtuadorDetalhesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AtuadorDetalhesContent />
        </Suspense>
    );
}