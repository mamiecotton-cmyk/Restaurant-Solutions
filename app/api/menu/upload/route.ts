import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(req: Request) {
  const supabase = getSupabase()

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const itemId = formData.get('itemId') as string | null

  if (!file || !itemId) {
    return NextResponse.json({ error: 'File and itemId are required' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const fileName = `${itemId}-${Date.now()}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { error: uploadError } = await supabase.storage
    .from('menu-images')
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = supabase.storage
    .from('menu-images')
    .getPublicUrl(fileName)

  // Update the menu item with the new image URL
  const { error: updateError } = await supabase
    .from('menu_items')
    .update({ image_url: urlData.publicUrl, updated_at: new Date().toISOString() })
    .eq('id', itemId)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ url: urlData.publicUrl })
}
