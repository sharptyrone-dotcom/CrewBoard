import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// GET /api/health
//
// Lightweight health-check endpoint for uptime monitors (UptimeRobot, etc.).
// Returns a static JSON payload — no database call, no auth required.
// ---------------------------------------------------------------------------

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: Date.now(),
      version: '1.0.0',
    },
    {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
