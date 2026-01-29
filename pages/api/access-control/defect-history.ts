// pages/api/access-control/defect-history.ts
// API route for retrieving defect history for access control devices

import type { NextApiRequest, NextApiResponse } from 'next';
import { withMethodHandler, sendSuccess, sendError } from '../../../lib/api-utils';
import { getDeviceDefectHistory } from '../../../lib/defectLogger';

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { deviceId } = req.query;

        if (!deviceId || Array.isArray(deviceId)) {
            return sendError(res, {
                message: "Valid device ID is required",
                statusCode: 400
            });
        }

        const history = getDeviceDefectHistory(deviceId as string);

        sendSuccess(res, { history });
    } catch (error) {
        console.error("Error fetching defect history:", error);
        sendError(res, {
            message: "Failed to fetch defect history",
            statusCode: 500
        });
    }
}

export default withMethodHandler({
    GET: handleGet
});