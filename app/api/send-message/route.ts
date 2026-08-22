import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const EVO_URL = process.env.EVOLUTION_API_URL || 'http://129.121.119.36:8080'
const EVO_KEY = process.env.EVOLUTION_API_KEY || '33E11BDCF1B5-4BB1-8DC5-573B8645F11D'
const EVO_INSTANCE = process.env.EVOLUTION_INSTANCE || 'compulaptop'

export async function POST(req: Request) {
  try {
    const { phone, message, leadId, agentName } = await req.json()

    if (!phone || !message?.trim()) {
      return NextResponse.json({ error: 'Phone and message are required' }, { status: 400 })
    }

    // 1. Enviar mensagem via Evolution API
    const evoRes = await fetch(`${EVO_URL}/message/sendText/${EVO_INSTANCE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: EVO_KEY
      },
      body: JSON.stringify({
        number: phone,
        text: message.trim(),
        delay: 300,
        linkPreview: false
      })
    })

    if (!evoRes.ok) {
      const errData = await evoRes.text()
      console.error('Evolution API Error:', errData)
      return NextResponse.json({ error: 'Failed to send message via WhatsApp', details: errData }, { status: 500 })
    }

    // 2. Salvar na tabela conversations
    if (leadId) {
      await supabase.from('conversations').insert({
        lead_id: leadId,
        phone: phone,
        direction: 'outcoming',
        content: message.trim(),
        content_type: 'text',
        sent_by: agentName ? `agent:${agentName}` : 'agent'
      })

      // 3. Atualizar último contato e pausar IA para este lead (atendente assumiu)
      await supabase.from('leads').update({
        last_message_at: new Date().toISOString(),
        ai_active: false,
        status: 'en_atencion'
      }).eq('id', leadId)

      // 4. Pausar bot na tabela chats para o n8n respeitar
      await supabase.from('chats').update({
        ai_service: 'pause'
      }).eq('phone', phone)
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Send message error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
