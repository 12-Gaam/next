import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('CountryMaster')
      .select('*')
      .limit(1)
    
    if (error) {
      return NextResponse.json({
        status: 'error',
        message: error.message,
        details: error
      }, { status: 500 })
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Supabase connection working!',
      data: data
    })
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to connect to Supabase',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
