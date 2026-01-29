"use client";

import { useState, useRef } from "react";

interface UseNativeCameraReturn {
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    capturedImages: string[];
    previewImages: string[];
    error: string | null;
    isCapturing: boolean;
    triggerCamera: () => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    removeImage: (index: number) => void;
    clearAllImages: () => void;
    setError: (error: string | null) => void;
}

interface UseNativeCameraProps {
    maxImages?: number;
    onImagesCaptured?: (images: string[]) => void;
    autoCompress?: boolean;
    maxWidth?: number;
    quality?: number;
}

/**
 * Hook for native mobile camera capture functionality
 * Uses the device's native camera app through HTML file input
 */
export function useNativeCamera({
    maxImages = 5,
    onImagesCaptured,
    autoCompress = true,
    maxWidth = 1920,
    quality = 0.8
}: UseNativeCameraProps = {}): UseNativeCameraReturn {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    /**
     * Compress image using canvas
     */
    const compressImage = (imageData: string): Promise<string> => {
        return new Promise((resolve) => {
            const img = document.createElement('img');
            img.src = imageData;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const scale = Math.min(1, maxWidth / img.width);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                const compressedData = canvas.toDataURL('image/jpeg', quality);
                resolve(compressedData);
            };
            img.onerror = () => {
                resolve(imageData); // Return original if compression fails
            };
        });
    };

    /**
     * Handle file selection/change from camera
     */
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsCapturing(true);
        setError(null);

        const newFiles = Array.from(files);
        const totalImages = capturedImages.length + newFiles.length;

        if (totalImages > maxImages) {
            setError(`Você pode capturar no máximo ${maxImages} imagens.`);
            setIsCapturing(false);
            return;
        }

        const newPreviewImages: string[] = [];
        const newCapturedImages: string[] = [];

        try {
            for (const file of newFiles) {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();

                    const imageDataPromise = new Promise<string>((resolve, reject) => {
                        reader.onload = (event) => {
                            if (event.target?.result) {
                                resolve(event.target.result as string);
                            } else {
                                reject(new Error('Failed to read file'));
                            }
                        };
                        reader.onerror = () => reject(new Error('File read error'));
                        reader.readAsDataURL(file);
                    });

                    try {
                        let imageData = await imageDataPromise;

                        // Compress image if enabled
                        if (autoCompress) {
                            imageData = await compressImage(imageData);
                        }

                        newPreviewImages.push(imageData);
                        newCapturedImages.push(imageData);
                    } catch (err) {
                        console.error('Error processing image:', err);
                        setError('Erro ao processar imagem');
                    }
                }
            }

            // Update state with new images
            setPreviewImages(prev => [...prev, ...newPreviewImages]);
            setCapturedImages(prev => [...prev, ...newCapturedImages]);

            // Callback with all captured images
            if (onImagesCaptured) {
                onImagesCaptured([...capturedImages, ...newCapturedImages]);
            }

        } catch (err) {
            console.error('Error handling file change:', err);
            setError('Erro ao capturar imagens');
        } finally {
            setIsCapturing(false);
        }
    };

    /**
     * Trigger the native camera
     */
    const triggerCamera = () => {
        fileInputRef.current?.click();
    };

    /**
     * Remove a specific image
     */
    const removeImage = (index: number) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
        setCapturedImages(prev => prev.filter((_, i) => i !== index));
    };

    /**
     * Clear all captured images
     */
    const clearAllImages = () => {
        setPreviewImages([]);
        setCapturedImages([]);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return {
        fileInputRef,
        capturedImages,
        previewImages,
        error,
        isCapturing,
        triggerCamera,
        handleFileChange,
        removeImage,
        clearAllImages,
        setError
    };
}