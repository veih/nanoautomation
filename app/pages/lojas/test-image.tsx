// Test component to check if images are being served correctly
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function TestImage() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [testImageUrl, setTestImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Try to fetch a test image
        const fetchTestImage = async () => {
            try {
                setLoading(true);
                // Try to get images from the API
                const response = await fetch('/api/lojas/get-images');
                if (response.ok) {
                    const data = await response.json();
                    console.log('Test image data:', data);
                    // Use the first available image URL
                    const firstImageKey = Object.keys(data.images)[0];
                    if (firstImageKey) {
                        setImageUrl(data.images[firstImageKey]);
                    }
                } else {
                    setError('Failed to fetch images');
                }

                // Also test a direct image URL
                setTestImageUrl('/api/serve-image?module=lojas&imagePath=test.jpg');
            } catch (err) {
                console.error('Error fetching test image:', err);
                setError('Error fetching images');
            } finally {
                setLoading(false);
            }
        };

        fetchTestImage();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container mt-4">
            <h2>Test Image Display</h2>

            <div className="mb-4">
                <h3>Image from API:</h3>
                {imageUrl ? (
                    <div>
                        <div style={{ width: '300px', height: '200px', position: 'relative' }}>
                            <Image
                                src={imageUrl}
                                alt="Test image from API"
                                fill
                                className="object-fit-cover"
                                onError={(e) => {
                                    console.error('API image failed to load:', e);
                                }}
                            />
                        </div>
                        <p>Image URL: {imageUrl}</p>
                    </div>
                ) : (
                    <p>No images found from API</p>
                )}
            </div>

            <div>
                <h3>Direct test image:</h3>
                {testImageUrl ? (
                    <div>
                        <div style={{ width: '300px', height: '200px', position: 'relative' }}>
                            <Image
                                src={testImageUrl}
                                alt="Direct test image"
                                fill
                                className="object-fit-cover"
                                onError={(e) => {
                                    console.error('Direct test image failed to load:', e);
                                }}
                            />
                        </div>
                        <p>Test URL: {testImageUrl}</p>
                    </div>
                ) : (
                    <p>No test URL available</p>
                )}
            </div>
        </div>
    );
}