// Unified image handling utilities

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configuration
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Ensure upload directory exists
export function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

// Validate file extension
export function isValidExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

// Validate file size
export function isValidFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}

// Generate unique filename
export function generateFilename(originalName: string): string {
  const ext = path.extname(originalName);
  const name = uuidv4();
  return `${name}${ext}`;
}

// Save uploaded file
export async function saveUploadedFile(fileBuffer: Buffer, originalName: string): Promise<string> {
  ensureUploadDir();
  
  if (!isValidExtension(originalName)) {
    throw new Error(`Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }

  const filename = generateFilename(originalName);
  const filePath = path.join(UPLOAD_DIR, filename);
  
  try {
    fs.writeFileSync(filePath, fileBuffer);
    return `/uploads/${filename}`;
  } catch (error: unknown) {
    console.error('File save error:', error);
    throw new Error('Failed to save file');
  }
}

// Delete file
export async function deleteFile(filePath: string): Promise<void> {
  const fullPath = path.join(process.cwd(), 'public', filePath);
  
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

// Get file info
export function getFileInfo(filePath: string): { exists: boolean; size?: number; mime?: string } {
  const fullPath = path.join(process.cwd(), 'public', filePath);
  
  if (!fs.existsSync(fullPath)) {
    return { exists: false };
  }
  
  const stats = fs.statSync(fullPath);
  const ext = path.extname(filePath).toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  };
  
  return {
    exists: true,
    size: stats.size,
    mime: mimeTypes[ext] || 'application/octet-stream',
  };
}

// Process multiple files
export async function processMultipleFiles(files: Array<{ buffer: Buffer; originalname: string }>): Promise<string[]> {
  const savedPaths: string[] = [];
  
  for (const file of files) {
    try {
      const savedPath = await saveUploadedFile(file.buffer, file.originalname);
      savedPaths.push(savedPath);
    } catch (error) {
      // Clean up already saved files if any operation fails
      for (const savedPath of savedPaths) {
        try {
          await deleteFile(savedPath);
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      }
      throw error;
    }
  }
  
  return savedPaths;
}

// Validate and process image upload
export async function processImageUpload(fileBuffer: Buffer, originalName: string, options: {
  maxSize?: number;
} = {}): Promise<{ path: string; size: number }> {
  const { maxSize = MAX_FILE_SIZE } = options;
  
  // Validate file size
  if (fileBuffer.length > maxSize) {
    throw new Error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
  }
  
  // Validate extension
  if (!isValidExtension(originalName)) {
    throw new Error(`Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }
  
  // Save file
  const filePath = await saveUploadedFile(fileBuffer, originalName);
  const fileInfo = getFileInfo(filePath);
  
  return {
    path: filePath,
    size: fileInfo.size || fileBuffer.length,
  };
}

// Cleanup old files (utility for maintenance)
export async function cleanupOldFiles(maxAgeHours: number = 24): Promise<number> {
  ensureUploadDir();
  
  const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
  let deletedCount = 0;
  
  try {
    const files = fs.readdirSync(UPLOAD_DIR);
    
    for (const file of files) {
      const filePath = path.join(UPLOAD_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime.getTime() < cutoffTime) {
        fs.unlinkSync(filePath);
        deletedCount++;
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
  
  return deletedCount;
}