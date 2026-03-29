// ============================================================
// GET /api/ai/predictions — Stock depletion predictions
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
            predictions: analysis.predictions.filter((p) => p.urgency !== 'ok'),
            allPredictions: analysis.predictions,
            generatedAt: analysis.generatedAt,
        });
    } catch (error) {
        console.error('AI predictions error:', error);
        return errorResponse('Internal server error', 500);
    }
}
