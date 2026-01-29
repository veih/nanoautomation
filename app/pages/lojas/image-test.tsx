// Simple test component to verify image display
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ImageTest() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Use the known working image URL from our previous test
        setImageUrl('/api/serve-image?module=lojas&imagePath=loja-a16a2b86-aab5-4597-ad23-b482174d8a83-1761578194583.jpg');
        setLoading(false);
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container mt-4">
            <h2>Image Test</h2>
            {imageUrl ? (
                <div>
                    <div style={{ width: '300px', height: '200px', position: 'relative', border: '1px solid #ccc' }}>
                        <Image
                            src={imageUrl}
                            alt="Test image"
                            fill
                            className="object-fit-cover"
                            onError={(e) => {
                                console.error('Image failed to load:', e);
                            }}
                        />
                    </div>
                    <p className="mt-2">Image URL: {imageUrl}</p>
                </div>
            ) : (
                <p>No image URL available</p>
            )}
        </div>
    );
}