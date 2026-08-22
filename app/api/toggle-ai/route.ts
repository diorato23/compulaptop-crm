import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: Request) {
  try {
    const { phone, active, leadId } = await req.json()

    if (!phone || typeof active !== 'boolean') {
      return NextResponse.json({ error: 'Phone and active status are required' }, { status: 400 })
    }

    const aiStatus = active ? 'reativada' : 'pause'

    // 1. Atualizar tabela chats (lida pelo n8n)
    await supabase.from('chats').update({
      ai_service: aiStatus
    }).eq('phone', phone)

    // 2. Atualizar tabela leads (lida pelo CRM)
    if (leadId) {
      await supabase.from('leads').update({
        ai_active: active
      }).eq('id', leadId)

      // Registrar evento
      await supabase.from('lead_events').insert({
        lead_id: leadId,
        event_type: active ? 'ai_reactivated' : 'transfer_human',
        description: active ? 'IA reactivada desde el panel CRM' : 'IA pausada manualmente por el asesor'
      })
    }

    return NextResponse.json({ success: true, ai_service: aiStatus })
  } catch (err: any) {
    console.error('Toggle AI error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
