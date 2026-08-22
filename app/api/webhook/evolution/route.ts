import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET() {
  return NextResponse.json({
    status: 'online',
    endpoint: '/api/webhook/evolution',
    description: 'Webhook receiver for Evolution API v2 (captures client, bot, and human interactions)'
  })
}

export async function POST(req: Request) {
  try {
    const rawPayload = await req.json().catch(() => ({}))
    if (!rawPayload || Object.keys(rawPayload).length === 0) {
      return NextResponse.json({ error: 'Empty payload' }, { status: 400 })
    }

    // Desembrulhar se vier do nó Webhook do n8n que empacota em { body: ... }
    const root = rawPayload.body || rawPayload
    const data = root.data || root.message || root

    // 1. Extrair informações da mensagem (suporta Evolution v1, v2, n8n payload ou direto)
    const key = data.key || root.key || {}
    const rawJid = (
      key.remoteJid ||
      data.remoteJid ||
      root.remoteJid ||
      data.sender ||
      root.sender ||
      root.telefone ||
      data.telefone ||
      ''
    ).toString()

    // Ignorar mensagens de grupos (@g.us) ou vazias
    if (!rawJid || rawJid.includes('@g.us')) {
      return NextResponse.json({ ignored: true, reason: 'group or empty remoteJid', rawJid })
    }

    const fromMe = Boolean(key.fromMe ?? data.fromMe ?? root.fromMe ?? false)
    const pushName = data.pushName || root.pushName || data.push_name || root.push_name || data.sender_pn || root.sender_pn || ''

    // Normalizar telefone
    const cleanPhone = rawJid.replace('@s.whatsapp.net', '').replace('@lid', '').replace(/[^0-9]/g, '')
    if (!cleanPhone) {
      return NextResponse.json({ ignored: true, reason: 'invalid phone', rawJid })
    }
    const standardJid = `${cleanPhone}@s.whatsapp.net`

    // Extrair conteúdo e tipo da mensagem
    const msg = data.message || root.message || data
    let messageType = data.messageType || root.messageType || 'conversation'
    let content = ''
    let mediaUrl: string | null = null

    if (typeof msg === 'string') {
      content = msg
      messageType = 'text'
    } else if (msg.conversation) {
      content = msg.conversation
      messageType = 'text'
    } else if (msg.extendedTextMessage?.text) {
      content = msg.extendedTextMessage.text
      messageType = 'text'
    } else if (msg.imageMessage) {
      content = msg.imageMessage.caption || '[Imagem]'
      messageType = 'image'
      mediaUrl = msg.imageMessage.url || null
    } else if (msg.audioMessage) {
      content = '[Áudio]'
      messageType = 'audio'
      mediaUrl = msg.audioMessage.url || null
    } else if (msg.documentMessage) {
      content = msg.documentMessage.fileName ? `[Documento: ${msg.documentMessage.fileName}]` : (msg.documentMessage.caption || '[Documento]')
      messageType = 'document'
      mediaUrl = msg.documentMessage.url || null
    } else if (msg.stickerMessage) {
      content = '[Sticker / Figurinha]'
      messageType = 'sticker'
    } else if (msg.videoMessage) {
      content = msg.videoMessage.caption || '[Vídeo]'
      messageType = 'video'
      mediaUrl = msg.videoMessage.url || null
    } else if (root.mensagem) {
      content = String(root.mensagem)
      messageType = 'text'
    } else if (data.text) {
      content = String(data.text)
      messageType = 'text'
    } else if (root.text) {
      content = String(root.text)
      messageType = 'text'
    }

    content = (content || '').trim()
    if (!content && !mediaUrl) {
      return NextResponse.json({ ignored: true, reason: 'empty message content' })
    }

    // Timestamp da mensagem
    const rawTs = data.messageTimestamp || root.messageTimestamp
    const timestamp = rawTs
      ? new Date(Number(rawTs) * 1000).toISOString()
      : new Date().toISOString()

    // 2. Determinar direção e remetente
    let direction: 'incoming' | 'outcoming' | 'bot' = 'incoming'
    let sentBy = 'client'

    if (fromMe) {
      const isExplicitBot = Boolean(data.isBot || root.isBot || root.sender === 'bot' || data.sent_by === 'bot')
      if (isExplicitBot) {
        direction = 'bot'
        sentBy = 'bot'
      } else {
        direction = 'outcoming'
        sentBy = pushName ? pushName : 'Asesor'
      }
    } else {
      direction = 'incoming'
      sentBy = pushName ? `client:${pushName}` : 'client'
    }

    // 3. Buscar ou criar Lead no Supabase
    const { data: existingLead } = await supabase
      .from('leads')
      .select('*')
      .or(`phone.eq.${standardJid},phone.eq.${cleanPhone},phone.eq.${rawJid}`)
      .limit(1)
      .maybeSingle()

    let leadId: number

    if (!existingLead) {
      const { data: newLead, error: insertLeadErr } = await supabase
        .from('leads')
        .insert({
          phone: standardJid,
          push_name: fromMe ? null : (pushName || null),
          source: 'whatsapp',
          status: fromMe ? 'en_atencion' : 'nuevo',
          ai_active: !fromMe,
          last_message_at: timestamp,
          created_at: timestamp
        })
        .select()
        .single()

      if (insertLeadErr || !newLead) {
        console.error('Error creating lead in webhook:', insertLeadErr)
        return NextResponse.json({ error: 'Failed to create lead', details: insertLeadErr }, { status: 500 })
      }
      leadId = newLead.id
    } else {
      leadId = existingLead.id

      const leadUpdate: Record<string, unknown> = {
        last_message_at: timestamp
      }

      if (fromMe && direction === 'outcoming') {
        leadUpdate.ai_active = false
        if (existingLead.status === 'nuevo') {
          leadUpdate.status = 'en_atencion'
        }

        // Pausar IA na tabela chats para o n8n
        await supabase
          .from('chats')
          .update({ ai_service: 'pause' })
          .or(`phone.eq.${standardJid},phone.eq.${cleanPhone},phone.eq.${rawJid}`)

        // Registrar evento de atendimento humano
        await supabase.from('lead_events').insert({
          lead_id: leadId,
          event_type: 'transfer_human',
          description: `Interacción manual del asesor (${sentBy}) en WhatsApp`,
          created_at: timestamp
        })
      }

      if (!existingLead.push_name && !fromMe && pushName) {
        leadUpdate.push_name = pushName
      }

      await supabase.from('leads').update(leadUpdate).eq('id', leadId)
    }

    // 4. Inserir conversa na tabela conversations (com proteção contra duplicidade recente)
    const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString()
    const { data: recentDup } = await supabase
      .from('conversations')
      .select('id')
      .eq('lead_id', leadId)
      .eq('direction', direction)
      .eq('content', content)
      .gte('created_at', fiveSecondsAgo)
      .limit(1)
      .maybeSingle()

    if (!recentDup) {
      const { error: convErr } = await supabase.from('conversations').insert({
        lead_id: leadId,
        phone: standardJid,
        direction: direction,
        content: content,
        content_type: messageType,
        media_url: mediaUrl,
        sent_by: sentBy,
        created_at: timestamp
      })

      if (convErr) {
        console.error('Error inserting conversation in webhook:', convErr)
        return NextResponse.json({ error: 'Failed to insert conversation', details: convErr }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      lead_id: leadId,
      direction,
      sent_by: sentBy,
      message_saved: !recentDup
    })
  } catch (err: any) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
