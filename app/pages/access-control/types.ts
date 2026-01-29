// Shared types for access control components
export type DeviceType = 'controller' | 'button' | 'electromagnet' | 'sensor' | '';

export interface BaseDevice {
    id: string;
    name: string;
    type: DeviceType;
    status: string;
    location?: string;
    description?: string;
    controllerId?: string;
    lastUpdated?: string;
    imagePaths?: string; // JSON array of image paths
    // Index signature to allow additional properties
    [key: string]: string | number | boolean | undefined;
}

export interface FlattenedDevice extends BaseDevice {
    // Specific properties for each device type
    ipAddress?: string;
    buttonType?: string;
    isPressed?: boolean;
    lastPressed?: string;
    isLocked?: boolean;
    lockStatus?: string;
    powerConsumption?: number;
    sensorType?: string;
    isClosed?: boolean;
    lastTriggered?: string;
}

export interface AccessController {
    id: string;
    name: string;
    type: 'controller';
    status: string;
    location?: string;
    ipAddress?: string;
    description?: string;
    lastUpdated?: string;
    imagePaths?: string; // JSON array of image paths
}

export interface RequestButton {
    id: string;
    name: string;
    type: 'button';
    status: string;
    location?: string;
    buttonType?: string;
    isPressed?: boolean;
    lastPressed?: string;
    controllerId?: string;
    description?: string;
    lastUpdated?: string;
    imagePaths?: string; // JSON array of image paths
}

export interface Electromagnet {
    id: string;
    name: string;
    type: 'electromagnet';
    status: string;
    location?: string;
    isLocked?: boolean;
    lockStatus?: string;
    powerConsumption?: number;
    controllerId?: string;
    description?: string;
    lastUpdated?: string;
    imagePaths?: string; // JSON array of image paths
}

export interface MagneticSensor {
    id: string;
    name: string;
    type: 'sensor';
    status: string;
    location?: string;
    sensorType?: string;
    isClosed?: boolean;
    lastTriggered?: string;
    controllerId?: string;
    description?: string;
    lastUpdated?: string;
    imagePaths?: string; // JSON array of image paths
}

export interface AccessControlApiResponse {
    controllers: AccessController[];
    buttons: RequestButton[];
    electromagnets: Electromagnet[];
    sensors: MagneticSensor[];
}