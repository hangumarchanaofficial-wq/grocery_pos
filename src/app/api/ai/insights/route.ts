// ============================================================
// GET /api/ai/insights — Sales insights (top/low sellers, trends)
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
            insights: analysis.insights,
            generatedAt: analysis.generatedAt,
        });
    } catch (error) {
        console.error('AI insights error:', error);
        return errorResponse('Internal server error', 500);
    }
}
