// pages/api/access-control/index.ts
// API route for access control system management

import type { NextApiRequest, NextApiResponse } from 'next';
import { withMethodHandler, sendSuccess, sendError } from '../../../lib/api-utils';
import prisma from '../../../lib/prisma';
import { logDefectHistory, moveImagesToLog } from '../../../lib/defectLogger';
import { AccessController, RequestButton, Electromagnet, MagneticSensor } from '@prisma/client';

// Handler for GET - fetch access control devices
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { deviceId, deviceType, name, status } = req.query;

        // If a specific device ID is provided
        if (deviceId && !Array.isArray(deviceId)) {
            let device = null;

            // Fetch based on device type
            if (deviceType === 'controller') {
                device = await prisma.accessController.findUnique({
                    where: { id: deviceId }
                });
            } else if (deviceType === 'button') {
                device = await prisma.requestButton.findUnique({
                    where: { id: deviceId }
                });
            } else if (deviceType === 'electromagnet') {
                device = await prisma.electromagnet.findUnique({
                    where: { id: deviceId }
                });
            } else if (deviceType === 'sensor') {
                device = await prisma.magneticSensor.findUnique({
                    where: { id: deviceId }
                });
            } else {
                // If no valid deviceType is provided, return an error
                return sendError(res, {
                    message: "Invalid device type provided",
                    statusCode: 400
                });
            }

            if (device) {
                return sendSuccess(res, device);
            } else {
                return sendError(res, {
                    message: "Device not found",
                    statusCode: 404
                });
            }
        }

        // If name and status are provided, fetch all devices with those attributes
        if (name && status && !Array.isArray(name) && !Array.isArray(status)) {
            let devices: (AccessController | RequestButton | Electromagnet | MagneticSensor)[] = [];

            // Fetch devices of all types with the same name and status
            const controllers = await prisma.accessController.findMany({
                where: {
                    name: name,
                    status: status as 'OPERACIONAL' | 'DEFEITO' | 'MANUTENCAO' | 'N_A'
                }
            });

            const buttons = await prisma.requestButton.findMany({
                where: {
                    name: name,
                    status: status as 'OPERACIONAL' | 'DEFEITO' | 'MANUTENCAO' | 'N_A'
                }
            });

            const electromagnets = await prisma.electromagnet.findMany({
                where: {
                    name: name,
                    status: status as 'OPERACIONAL' | 'DEFEITO' | 'MANUTENCAO' | 'N_A'
                }
            });

            const sensors = await prisma.magneticSensor.findMany({
                where: {
                    name: name,
                    status: status as 'OPERACIONAL' | 'DEFEITO' | 'MANUTENCAO' | 'N_A'
                }
            });

            // Combine all devices into a single array
            devices = [...controllers, ...buttons, ...electromagnets, ...sensors];

            return sendSuccess(res, devices);
        }

        // Fetch all devices
        const controllers = await prisma.accessController.findMany();
        const buttons = await prisma.requestButton.findMany();
        const electromagnets = await prisma.electromagnet.findMany();
        const sensors = await prisma.magneticSensor.findMany();

        const allDevices = {
            controllers,
            buttons,
            electromagnets,
            sensors
        };

        sendSuccess(res, allDevices);
    } catch (error) {
        console.error("Error fetching access control devices:", error);
        sendError(res, {
            message: "Failed to fetch access control devices",
            statusCode: 500
        });
    }
}

// Handler for POST - create or update access control device
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    try {
        const deviceData = req.body;
        const { type } = deviceData;

        if (!type) {
            return sendError(res, {
                message: "Device type is required",
                statusCode: 400
            });
        }

        let device = null;

        switch (type) {
            case 'controller':
                device = await prisma.accessController.create({
                    data: {
                        id: deviceData.id || undefined,
                        name: deviceData.name,
                        status: deviceData.status || 'OPERACIONAL',
                        location: deviceData.location,
                        description: deviceData.description,
                        lastUpdated: new Date(),
                        imagePaths: deviceData.imagePaths || null
                    }
                });
                break;

            case 'button':
                device = await prisma.requestButton.create({
                    data: {
                        id: deviceData.id || undefined,
                        name: deviceData.name,
                        status: deviceData.status || 'OPERACIONAL',
                        location: deviceData.location,
                        description: deviceData.description,
                        controllerId: deviceData.controllerId || undefined, // Make it optional
                        buttonType: deviceData.buttonType,
                        isPressed: deviceData.isPressed || false,
                        lastPressed: deviceData.lastPressed ? new Date(deviceData.lastPressed) : undefined,
                        lastUpdated: new Date(),
                        imagePaths: deviceData.imagePaths || null
                    }
                });
                break;

            case 'electromagnet':
                device = await prisma.electromagnet.create({
                    data: {
                        id: deviceData.id || undefined,
                        name: deviceData.name,
                        status: deviceData.status || 'OPERACIONAL',
                        location: deviceData.location,
                        description: deviceData.description,
                        controllerId: deviceData.controllerId || undefined, // Make it optional
                        isLocked: deviceData.isLocked || false,
                        lockStatus: deviceData.lockStatus,
                        powerConsumption: deviceData.powerConsumption,
                        lastUpdated: new Date(),
                        imagePaths: deviceData.imagePaths || null
                    }
                });
                break;

            case 'sensor':
                device = await prisma.magneticSensor.create({
                    data: {
                        id: deviceData.id || undefined,
                        name: deviceData.name,
                        status: deviceData.status || 'OPERACIONAL',
                        location: deviceData.location,
                        description: deviceData.description,
                        controllerId: deviceData.controllerId || undefined, // Make it optional
                        sensorType: deviceData.sensorType,
                        isClosed: deviceData.isClosed !== undefined ? deviceData.isClosed : true,
                        lastTriggered: deviceData.lastTriggered ? new Date(deviceData.lastTriggered) : undefined,
                        lastUpdated: new Date(),
                        imagePaths: deviceData.imagePaths || null
                    }
                });
                break;

            default:
                return sendError(res, {
                    message: "Invalid device type",
                    statusCode: 400
                });
        }

        sendSuccess(res, device);
    } catch (error) {
        console.error("Error creating access control device:", error);
        sendError(res, {
            message: "Failed to create access control device",
            statusCode: 500
        });
    }
}

// Handler for PUT - update access control device
async function handlePut(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { deviceId } = req.query;
        const deviceData = req.body;
        const { type } = deviceData;

        if (!deviceId || Array.isArray(deviceId)) {
            return sendError(res, {
                message: "Valid device ID is required",
                statusCode: 400
            });
        }

        if (!type) {
            return sendError(res, {
                message: "Device type is required",
                statusCode: 400
            });
        }

        // First, get the current device to check its status and existing image paths
        let currentDevice: AccessController | RequestButton | Electromagnet | MagneticSensor | null = null;
        switch (type) {
            case 'controller':
                currentDevice = await prisma.accessController.findUnique({
                    where: { id: deviceId as string }
                });
                break;
            case 'button':
                currentDevice = await prisma.requestButton.findUnique({
                    where: { id: deviceId as string }
                });
                break;
            case 'electromagnet':
                currentDevice = await prisma.electromagnet.findUnique({
                    where: { id: deviceId as string }
                });
                break;
            case 'sensor':
                currentDevice = await prisma.magneticSensor.findUnique({
                    where: { id: deviceId as string }
                });
                break;
        }

        // Merge image paths if new ones are provided
        let mergedImagePaths = deviceData.imagePaths;
        if (deviceData.imagePaths && currentDevice && currentDevice.imagePaths) {
            try {
                const newImagePaths = JSON.parse(deviceData.imagePaths);
                const existingImagePaths = JSON.parse(currentDevice.imagePaths);

                if (Array.isArray(newImagePaths) && Array.isArray(existingImagePaths)) {
                    // Merge the arrays, removing duplicates
                    const allImagePaths = [...existingImagePaths, ...newImagePaths];
                    const uniqueImagePaths = Array.from(new Set(allImagePaths));
                    mergedImagePaths = JSON.stringify(uniqueImagePaths);
                }
            } catch (parseError) {
                console.error('Error merging image paths:', parseError);
                // If there's an error, use the new paths
                mergedImagePaths = deviceData.imagePaths;
            }
        }

        let device = null;

        switch (type) {
            case 'controller':
                device = await prisma.accessController.update({
                    where: { id: deviceId as string },
                    data: {
                        name: deviceData.name,
                        status: deviceData.status,
                        location: deviceData.location,
                        description: deviceData.description,
                        lastUpdated: new Date(),
                        imagePaths: mergedImagePaths || currentDevice?.imagePaths || undefined
                    }
                });
                break;

            case 'button':
                device = await prisma.requestButton.update({
                    where: { id: deviceId as string },
                    data: {
                        name: deviceData.name,
                        status: deviceData.status,
                        location: deviceData.location,
                        description: deviceData.description,
                        controllerId: deviceData.controllerId || undefined, // Make it optional
                        buttonType: deviceData.buttonType,
                        isPressed: deviceData.isPressed,
                        lastPressed: deviceData.lastPressed ? new Date(deviceData.lastPressed) : undefined,
                        lastUpdated: new Date(),
                        imagePaths: mergedImagePaths || currentDevice?.imagePaths || undefined
                    }
                });
                break;

            case 'electromagnet':
                device = await prisma.electromagnet.update({
                    where: { id: deviceId as string },
                    data: {
                        name: deviceData.name,
                        status: deviceData.status,
                        location: deviceData.location,
                        description: deviceData.description,
                        controllerId: deviceData.controllerId || undefined, // Make it optional
                        isLocked: deviceData.isLocked,
                        lockStatus: deviceData.lockStatus,
                        powerConsumption: deviceData.powerConsumption,
                        lastUpdated: new Date(),
                        imagePaths: mergedImagePaths || currentDevice?.imagePaths || undefined
                    }
                });
                break;

            case 'sensor':
                device = await prisma.magneticSensor.update({
                    where: { id: deviceId as string },
                    data: {
                        name: deviceData.name,
                        status: deviceData.status,
                        location: deviceData.location,
                        description: deviceData.description,
                        controllerId: deviceData.controllerId || undefined, // Make it optional
                        sensorType: deviceData.sensorType,
                        isClosed: deviceData.isClosed,
                        lastTriggered: deviceData.lastTriggered ? new Date(deviceData.lastTriggered) : undefined,
                        lastUpdated: new Date(),
                        imagePaths: mergedImagePaths || currentDevice?.imagePaths || undefined
                    }
                });
                break;

            default:
                return sendError(res, {
                    message: "Invalid device type",
                    statusCode: 400
                });
        }

        // Log defect history if status changed from DEFEITO to OPERACIONAL
        if (currentDevice && currentDevice.status === 'DEFEITO' && deviceData.status === 'OPERACIONAL') {
            try {
                // Log the status change
                logDefectHistory(
                    deviceId as string,
                    device.name,
                    type,
                    'DEFEITO',
                    'OPERACIONAL',
                    new Date()
                );

                // Move images if they exist
                let imagesCleared = false;
                if (device.imagePaths) {
                    try {
                        const imagePaths = JSON.parse(device.imagePaths);
                        if (Array.isArray(imagePaths) && imagePaths.length > 0) {
                            const moveResult = moveImagesToLog(deviceId as string, imagePaths);

                            // Clear image paths from database after moving
                            if (moveResult.clearImagePaths) {
                                switch (type) {
                                    case 'controller':
                                        await prisma.accessController.update({
                                            where: { id: deviceId as string },
                                            data: { imagePaths: null }
                                        });
                                        break;
                                    case 'button':
                                        await prisma.requestButton.update({
                                            where: { id: deviceId as string },
                                            data: { imagePaths: null }
                                        });
                                        break;
                                    case 'electromagnet':
                                        await prisma.electromagnet.update({
                                            where: { id: deviceId as string },
                                            data: { imagePaths: null }
                                        });
                                        break;
                                    case 'sensor':
                                        await prisma.magneticSensor.update({
                                            where: { id: deviceId as string },
                                            data: { imagePaths: null }
                                        });
                                        break;
                                }
                                imagesCleared = true;
                            }
                        }
                    } catch (parseError) {
                        console.error('Error parsing image paths for device:', deviceId, parseError);
                        // Even if we can't parse the image paths, try to move any images associated with the device
                        const moveResult = moveImagesToLog(deviceId as string, []);

                        // Clear image paths from database after moving
                        if (moveResult.clearImagePaths) {
                            switch (type) {
                                case 'controller':
                                    await prisma.accessController.update({
                                        where: { id: deviceId as string },
                                        data: { imagePaths: null }
                                    });
                                    break;
                                case 'button':
                                    await prisma.requestButton.update({
                                        where: { id: deviceId as string },
                                        data: { imagePaths: null }
                                    });
                                    break;
                                case 'electromagnet':
                                    await prisma.electromagnet.update({
                                        where: { id: deviceId as string },
                                        data: { imagePaths: null }
                                    });
                                    break;
                                case 'sensor':
                                    await prisma.magneticSensor.update({
                                        where: { id: deviceId as string },
                                        data: { imagePaths: null }
                                    });
                                    break;
                            }
                            imagesCleared = true;
                        }
                    }
                } else {
                    // If no image paths are explicitly stored, still try to find and move images for this device
                    const moveResult = moveImagesToLog(deviceId as string, []);

                    // Clear image paths from database after moving
                    if (moveResult.clearImagePaths) {
                        switch (type) {
                            case 'controller':
                                await prisma.accessController.update({
                                    where: { id: deviceId as string },
                                    data: { imagePaths: null }
                                });
                                break;
                            case 'button':
                                await prisma.requestButton.update({
                                    where: { id: deviceId as string },
                                    data: { imagePaths: null }
                                });
                                break;
                            case 'electromagnet':
                                await prisma.electromagnet.update({
                                    where: { id: deviceId as string },
                                    data: { imagePaths: null }
                                });
                                break;
                            case 'sensor':
                                await prisma.magneticSensor.update({
                                    where: { id: deviceId as string },
                                    data: { imagePaths: null }
                                });
                                break;
                        }
                        imagesCleared = true;
                    }
                }

                console.log(`Images cleared from database for device ${deviceId}: ${imagesCleared}`);
            } catch (logError) {
                console.error('Error logging defect history:', logError);
            }
        }

        sendSuccess(res, device);
    } catch (error) {
        console.error("Error updating access control device:", error);
        sendError(res, {
            message: "Failed to update access control device",
            statusCode: 500
        });
    }
}

// Handler for DELETE - delete access control device
async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { deviceId, deviceType } = req.query;

        if (!deviceId || Array.isArray(deviceId)) {
            return sendError(res, {
                message: "Valid device ID is required",
                statusCode: 400
            });
        }

        if (!deviceType || Array.isArray(deviceType)) {
            return sendError(res, {
                message: "Device type is required",
                statusCode: 400
            });
        }

        switch (deviceType) {
            case 'controller':
                await prisma.accessController.delete({
                    where: { id: deviceId as string }
                });
                break;

            case 'button':
                await prisma.requestButton.delete({
                    where: { id: deviceId as string }
                });
                break;

            case 'electromagnet':
                await prisma.electromagnet.delete({
                    where: { id: deviceId as string }
                });
                break;

            case 'sensor':
                await prisma.magneticSensor.delete({
                    where: { id: deviceId as string }
                });
                break;

            default:
                return sendError(res, {
                    message: "Invalid device type",
                    statusCode: 400
                });
        }

        sendSuccess(res, { message: "Device deleted successfully" });
    } catch (error) {
        console.error("Error deleting access control device:", error);
        sendError(res, {
            message: "Failed to delete access control device",
            statusCode: 500
        });
    }
}

export default withMethodHandler({
    GET: handleGet,
    POST: handlePost,
    PUT: handlePut,
    DELETE: handleDelete
});