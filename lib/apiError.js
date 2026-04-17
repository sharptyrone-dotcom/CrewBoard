/**
 * Centralised API error handler.
 *
 * Logs the full error server-side but returns a generic message to the client.
 * Prevents leaking database structure, Supabase internals, or stack traces.
 *
 * Usage:
 *   import { handleApiError } from '@/lib/apiError';
 *
 *   try {
 *     // ... route logic
 *   } catch (err) {
 *     return handleApiError(err);
 *   }
 */

import { NextResponse } from 'next/server';

export function handleApiError(error, context = 'API') {
  // Always log full error server-side for debugging
  console.error(`[${context}] Error:`, {
    message: error?.message,
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
    stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
  });

  // Map known database error codes to safe client responses
  if (error?.code === '23505') {
    return NextResponse.json(
      { error: 'A record with these details already exists' },
      { status: 409 },
    );
  }

  if (error?.code === '23503') {
    return NextResponse.json(
      { error: 'Invalid reference — a related record was not found' },
      { status: 400 },
    );
  }

  if (error?.code === '23502') {
    return NextResponse.json(
      { error: 'A required field is missing' },
      { status: 400 },
    );
  }

  if (error?.code === 'PGRST301' || error?.code === '42501') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    );
  }

  if (error?.code === 'PGRST116') {
    return NextResponse.json(
      { error: 'Record not found' },
      { status: 404 },
    );
  }

  // Supabase connection errors
  if (
    error?.message?.includes('fetch failed') ||
    error?.message?.includes('ECONNREFUSED') ||
    error?.message?.includes('ETIMEDOUT')
  ) {
    return NextResponse.json(
      { error: 'Service temporarily unavailable. Please try again.' },
      { status: 503 },
    );
  }

  // Generic fallback — never expose internal details
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 },
  );
}
