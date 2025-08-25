import { NextResponse } from 'next/server'
import { getCountries } from '@/lib/supabase-db'

export async function GET() {
  try {
    const countries = await getCountries()
    return NextResponse.json(countries)
  } catch (error) {
    console.error('Error fetching countries:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
