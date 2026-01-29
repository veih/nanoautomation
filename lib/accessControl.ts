// lib/accessControl.ts

/**
 * Simple access control utility for the application
 * In a production environment, this would be replaced with a proper authentication system
 */

export type UserRole = 'admin' | 'lojas' | 'cvf' | 'sdai' | 'corretiva' | 'superuser' | 'guest';

export interface UserAccess {
    role: UserRole;
    permissions: string[];
    lojasAccess: boolean;
    cvfAccess: boolean;
    sdaiAccess: boolean;
    corretivaAccess: boolean;
}

/**
 * Check if user has access to a specific module
 */
export function hasModuleAccess(module: string): boolean {
    if (typeof window === 'undefined') return false;

    try {
        // Check for specific module access
        const moduleAccess = localStorage.getItem(`${module}Access`);
        if (moduleAccess === 'true') return true;

        // Check user role
        const userRole = localStorage.getItem('userRole');
        if (userRole && (userRole === 'admin' || userRole === 'superuser' || userRole === module)) {
            return true;
        }

        return false;
    } catch (error) {
        console.error(`Error checking ${module} access:`, error);
        return false;
    }
}

/**
 * Get current user role
 */
export function getUserRole(): UserRole | null {
    if (typeof window === 'undefined') return null;

    try {
        const role = localStorage.getItem('userRole');
        return role as UserRole | null;
    } catch (error) {
        console.error('Error getting user role:', error);
        return null;
    }
}

/**
 * Set user access for testing purposes
 * In a real application, this would come from a proper authentication system
 */
export function setUserAccess(role: UserRole, modules: string[] = []): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem('userRole', role);

        // Set module access
        const allModules = ['lojas', 'cvf', 'sdai', 'corretiva'];
        allModules.forEach(module => {
            localStorage.setItem(`${module}Access`, modules.includes(module) || role === 'admin' || role === 'superuser' ? 'true' : 'false');
        });
    } catch (error) {
        console.error('Error setting user access:', error);
    }
}

/**
 * Clear user access (logout)
 */
export function clearUserAccess(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem('userRole');
        ['lojas', 'cvf', 'sdai', 'corretiva'].forEach(module => {
            localStorage.removeItem(`${module}Access`);
        });
    } catch (error) {
        console.error('Error clearing user access:', error);
    }
}