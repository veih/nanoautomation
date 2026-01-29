// Augment Prisma Client to add missing model types
import { Prisma } from '@prisma/client';

// Only augment what's actually missing from the generated client
// Remove the broad overrides that conflict with generated types
declare module '@prisma/client' {
    // Keep only truly missing types or specific extensions
    // The model methods should come from the generated client
}
