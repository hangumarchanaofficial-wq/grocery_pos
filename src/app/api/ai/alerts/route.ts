// ============================================================
// GET /api/ai/alerts — Smart actionable alerts
// ============================================================

import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';
import { runFullAnalysis } from '@/ai/engine';

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return errorResponse('Unauthorized', 401);

        const analysis = await runFullAnalysis();
        return successResponse({
            alerts: analysis.alerts,
            summary: {
                critical: analysis.alerts.filter((a) => a.severity === 'critical').length,
                warning: analysis.alerts.filter((a) => a.severity === 'warning').length,
                info: analysis.alerts.filter((a) => a.severity === 'info').length,
            },
            generatedAt: analysis.generatedAt,
        });
    } catch (error) {
        console.error('AI alerts error:', error);
        return errorResponse('Internal server error', 500);
    }
}
