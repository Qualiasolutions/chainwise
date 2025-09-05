import { NextRequest, NextResponse } from 'next/server'

// Temporary stub implementation for alerts API
// TODO: Migrate to Supabase implementation

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Alerts API not yet migrated to Supabase',
    message: 'This endpoint will be available after completing Supabase migration'
  }, { status: 503 })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'Alerts API not yet migrated to Supabase',
    message: 'This endpoint will be available after completing Supabase migration'
  }, { status: 503 })
}