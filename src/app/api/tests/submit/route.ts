import { NextResponse } from 'next/server'

/**
 * Legacy module tests trusted a client-supplied score and could award XP more
 * than once. The canonical flow uses server-graded milestone and final tests.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: 'Legacy module test submission is no longer supported',
      canonicalEndpoints: ['/api/milestone-test', '/api/final-test'],
    },
    { status: 410 }
  )
}
