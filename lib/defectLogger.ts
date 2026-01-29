import fs from 'fs';
import path from 'path';

// Ensure directories exist
const ensureDirectoryExists = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

// Log defect history
export const logDefectHistory = (deviceId: string, deviceName: string, deviceType: string, oldStatus: string, newStatus: string, timestamp: Date) => {
    try {
        // Create log directory
        const logDir = path.join('C:/imagensDefeitos', 'controle de acesso', 'log');
        ensureDirectoryExists(logDir);

        // Create log entry
        const logEntry = {
            deviceId,
            deviceName,
            deviceType,
            oldStatus,
            newStatus,
            timestamp: timestamp.toISOString(),
            message: `Status changed from ${oldStatus} to ${newStatus}`
        };

        // Write to log file
        const logFilePath = path.join(logDir, 'defect_history.log');
        const logLine = JSON.stringify(logEntry) + '\n';
        fs.appendFileSync(logFilePath, logLine);

        return logEntry;
    } catch (error) {
        console.error('Error logging defect history:', error);
        throw error;
    }
};

// Move images from defeitos folder to log folder
export const moveImagesToLog = (deviceId: string, imagePaths: string[]) => {
    try {
        // Create log directory for images
        const logImagesDir = path.join('C:/imagensDefeitos', 'controle de acesso', 'log', 'images');
        ensureDirectoryExists(logImagesDir);

        // First, move images that are explicitly listed in the database
        const movedImages: string[] = [];
        for (const imagePath of imagePaths) {
            const fileName = path.basename(imagePath);
            const sourcePath = path.join('C:/imagensDefeitos', imagePath);
            const destinationPath = path.join(logImagesDir, fileName);

            // Check if source file exists
            if (fs.existsSync(sourcePath)) {
                // Move file
                fs.renameSync(sourcePath, destinationPath);
                // Use forward slashes for URL compatibility
                movedImages.push(path.posix.join('controle de acesso', 'log', 'images', fileName));
            }
        }

        // Then, find and move any other images associated with this device ID
        // that might not be explicitly listed in the database
        const serviceDir = path.join('C:/imagensDefeitos', 'controle de acesso');
        if (fs.existsSync(serviceDir)) {
            const files = fs.readdirSync(serviceDir);

            for (const file of files) {
                // Check if the file name contains the device ID and is an image
                if (file.includes(deviceId) &&
                    (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg'))) {

                    const sourcePath = path.join(serviceDir, file);
                    const destinationPath = path.join(logImagesDir, file);

                    // Check if we haven't already moved this file
                    if (fs.existsSync(sourcePath) && !movedImages.includes(path.join('controle de acesso', 'log', 'images', file))) {
                        // Move file
                        fs.renameSync(sourcePath, destinationPath);
                        // Use forward slashes for URL compatibility
                        movedImages.push(path.posix.join('controle de acesso', 'log', 'images', file));
                    }
                }
            }
        }

        // Return information about the operation
        return {
            movedImages,
            imagesMoved: movedImages.length > 0,
            clearImagePaths: true // Indicate that image paths should be cleared from database
        };
    } catch (error) {
        console.error('Error moving images to log:', error);
        throw error;
    }
};

// Define type for defect history entries
interface DefectHistoryEntry {
    deviceId: string;
    deviceType: string;
    timestamp: string;
    oldStatus: string;
    newStatus: string;
    message: string;
}

// Get defect history for a device
export const getDeviceDefectHistory = (deviceId: string): DefectHistoryEntry[] => {
    try {
        const logFilePath = path.join('C:/imagensDefeitos', 'controle de acesso', 'log', 'defect_history.log');

        if (!fs.existsSync(logFilePath)) {
            return [];
        }

        const logContent = fs.readFileSync(logFilePath, 'utf8');
        const logLines = logContent.split('\n').filter(line => line.trim() !== '');

        const history: DefectHistoryEntry[] = [];
        for (const line of logLines) {
            try {
                const entry: DefectHistoryEntry = JSON.parse(line);
                if (entry.deviceId === deviceId) {
                    history.push(entry);
                }
            } catch (parseError) {
                console.error('Error parsing log entry:', parseError);
            }
        }

        return history;
    } catch (error) {
        console.error('Error reading defect history:', error);
        return [];
    }
};