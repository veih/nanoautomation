"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the client component with SSR disabled
const AccessControlDetalhesContent = dynamic(() => import("./AccessControlDetalhesContent"), {
    ssr: false,
    loading: () => <div>Loading...</div>,
});

export default function AccessControlDetalhesPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AccessControlDetalhesContent />
        </Suspense>
    );
}