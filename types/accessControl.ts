// types/accessControl.ts

export interface AccessControlDevice {
    id: string;
    name: string;
    status: 'OPERACIONAL' | 'DEFEITO' | 'MANUTENCAO' | 'N_A';
    location?: string;
    lastUpdated: string;
    description?: string;
    imagePaths?: string; // Add imagePaths field
}

export interface AccessController extends AccessControlDevice {
    ipAddress: string;
    connectedDevices?: string[]; // IDs of connected devices
}

export interface RequestButton extends AccessControlDevice {
    controllerId?: string;
    buttonType?: 'ENTRY' | 'EXIT' | 'EMERGENCY';
    isPressed: boolean;
    lastPressed?: string;
}

export interface Electromagnet extends AccessControlDevice {
    controllerId?: string;
    isLocked: boolean;
    lockStatus?: 'LOCKED' | 'UNLOCKED' | 'LOCKING' | 'UNLOCKING';
    powerConsumption?: number; // in watts
}

export interface MagneticSensor extends AccessControlDevice {
    controllerId?: string;
    sensorType?: 'DOOR' | 'WINDOW' | 'GATE';
    isClosed: boolean;
    lastTriggered?: string;
}