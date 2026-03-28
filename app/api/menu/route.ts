import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const supabase = getSupabase()
  const body = await req.json()
  const { name, price, price_range, description, image_url } = body

  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

  const { data: existing } = await supabase
    .from('menu_items')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = (existing?.[0]?.sort_order ?? 0) + 1
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const { data, error } = await supabase
    .from('menu_items')
    .insert({
      id,
      name,
      price: price || 0,
      price_range: price_range || '',
      description: description || '',
      image_url: image_url || '',
      available: true,
      sort_order: nextOrder,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: Request) {
  const supabase = getSupabase()
  const body = await req.json()
  const { id, ...updates } = body

  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

  const allowedFields: Record<string, any> = {}
  if ('available' in updates) allowedFields.available = updates.available
  if ('name' in updates) allowedFields.name = updates.name
  if ('price' in updates) allowedFields.price = updates.price
  if ('price_range' in updates) allowedFields.price_range = updates.price_range
  if ('description' in updates) allowedFields.description = updates.description
  if ('image_url' in updates) allowedFields.image_url = updates.image_url
  if ('sort_order' in updates) allowedFields.sort_order = updates.sort_order

  allowedFields.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('menu_items')
    .update(allowedFields)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request) {
  const supabase = getSupabase()
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 })

  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ deleted: true })
}