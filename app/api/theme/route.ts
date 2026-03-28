import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabase()
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'theme')
      .single()
    return NextResponse.json({ theme: data?.value ?? 'dark' })
  } catch {
    return NextResponse.json({ theme: 'dark' })
  }
}

export async function POST(req: Request) {
  try {
    const { theme } = await req.json()
    if (theme !== 'dark' && theme !== 'light') {
      return NextResponse.json({ error: 'Invalid theme' }, { status: 400 })
    }
    const supabase = getSupabase()
    await supabase
      .from('settings')
      .update({ value: theme, updated_at: new Date().toISOString() })
      .eq('key', 'theme')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
