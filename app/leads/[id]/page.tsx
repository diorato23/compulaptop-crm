'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase, type Lead, type Conversation, STATUS_CONFIG, type LeadStatus } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import { ArrowLeft, Bot, BotOff, Phone, Edit2, Save, X, MessageSquare, Send, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const DIR_COLORS: Record<string, { bg: string; border: string; align: string }> = {
  incoming:  { bg: 'var(--bg-elevated)', border: 'var(--border)',           align: 'flex-start' },
  bot:       { bg: '#1a1f3a',            border: '#252d5c',                  align: 'flex-end'   },
  outcoming: { bg: '#1a3a2a',            border: '#1e4d35',                  align: 'flex-end'   },
}

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  const id = params.id
  const [lead, setLead] = useState<Lead | null>(null)
  const [convs, setConvs] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [editNotes, setEditNotes] = useState(false)
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<LeadStatus>('nuevo')
  const [aiActive, setAiActive] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [togglingAi, setTogglingAi] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const fetchAll = useCallback(async () => {
    const [{ data: leadData }, { data: convData }] = await Promise.all([
      supabase.from('leads').select('*').eq('id', id).single(),
      supabase.from('conversations').select('*').eq('lead_id', id).order('created_at', { ascending: true }),
    ])
    if (leadData) {
      setLead(leadData as Lead)
      setNotes(leadData.notes || '')
      setStatus(leadData.status as LeadStatus)
      setAiActive(leadData.ai_active ?? true)
    }
    if (convData) setConvs(convData as Conversation[])
    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchAll()
    const ch = supabase.channel(`lead-${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations', filter: `lead_id=eq.${id}` }, fetchAll)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'leads', filter: `id=eq.${id}` }, fetchAll)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [fetchAll, id])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [convs])

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!messageText.trim() || sending || !lead) return

    setSending(true)
    const textToSend = messageText.trim()
    setMessageText('')

    try {
      const res = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: lead.phone,
          message: textToSend,
          leadId: lead.id,
          agentName: 'Asesor'
        })
      })

      if (!res.ok) {
        alert('Error al enviar el mensaje. Verifica la conexión con Evolution API.')
        setMessageText(textToSend)
      } else {
        setAiActive(false)
        fetchAll()
      }
    } catch (err) {
      console.error(err)
      alert('Error de conexión al enviar el mensaje')
      setMessageText(textToSend)
    } finally {
      setSending(false)
    }
  }

  const toggleAiService = async () => {
    if (!lead || togglingAi) return
    setTogglingAi(true)
    const nextState = !aiActive

    try {
      const res = await fetch('/api/toggle-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: lead.phone,
          active: nextState,
          leadId: lead.id
        })
      })

      if (res.ok) {
        setAiActive(nextState)
      } else {
        alert('Error al cambiar el estado de la IA')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setTogglingAi(false)
    }
  }

  const saveNotes = async () => {
    await supabase.from('leads').update({ notes }).eq('id', id)
    setEditNotes(false)
  }

  const changeStatus = async (s: LeadStatus) => {
    setStatus(s)
    await supabase.from('leads').update({ status: s }).eq('id', id)
  }

  const displayName = (l: Lead) => l.name || l.push_name || l.phone.replace('@s.whatsapp.net', '').replace('@lid', '')

  if (loading) return (
    <div className="crm-layout">
      <Sidebar />
      <div className="crm-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    </div>
  )

  if (!lead) return (
    <div className="crm-layout">
      <Sidebar />
      <div className="crm-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Lead no encontrado</p>
      </div>
    </div>
  )

  const cfg = STATUS_CONFIG[status]

  return (
    <div className="crm-layout">
      <Sidebar />
      <div className="crm-main">
        <header className="crm-header">
          <Link href="/leads" className="btn btn-ghost btn-icon btn-sm"><ArrowLeft size={16} /></Link>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{displayName(lead)}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Phone size={11} />
              {lead.phone.replace('@s.whatsapp.net', '').replace('@lid', '')}
            </div>
          </div>

          <select className="select" value={status} onChange={e => changeStatus(e.target.value as LeadStatus)}>
            {(Object.keys(STATUS_CONFIG) as LeadStatus[]).map(s => (
              <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
            ))}
          </select>

          <div className="status-badge" style={{ background: cfg.bg, color: cfg.color }}>
            {cfg.label}
          </div>

          {/* Toggle AI Button */}
          <button
            onClick={toggleAiService}
            disabled={togglingAi}
            className={`btn btn-sm ${aiActive ? 'btn-secondary' : 'btn-primary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            title={aiActive ? 'Haz clic para pausar el bot y atender tú' : 'Haz clic para reactivar el bot'}
          >
            {aiActive ? <Bot size={14} color="var(--green)" /> : <BotOff size={14} />}
            <span>{aiActive ? 'IA Activa' : 'Reactivar IA'}</span>
          </button>
        </header>

        <main className="crm-content" style={{ padding: 16 }}>
          <div className="lead-detail-layout">
            {/* Chat Area */}
            <div className="chat-window" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <MessageSquare size={14} color="var(--accent)" />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Conversación de WhatsApp</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>{convs.length} mensajes</span>
                <span className="realtime-dot" style={{ marginLeft: 'auto' }}>En vivo</span>
              </div>

              {/* Messages list */}
              <div className="chat-messages" style={{ flex: 1 }}>
                {convs.length === 0 && (
                  <div className="empty-state">
                    <MessageSquare size={32} />
                    <p>Sin mensajes aún</p>
                    <p style={{ fontSize: 11 }}>Escribe abajo para enviar el primer mensaje por WhatsApp</p>
                  </div>
                )}
                {convs.map(msg => {
                  const dir = msg.direction as keyof typeof DIR_COLORS
                  const style = DIR_COLORS[dir] || DIR_COLORS.incoming
                  const isOut = dir === 'outcoming' || dir === 'bot'
                  return (
                    <div key={msg.id} className={`msg-wrap ${isOut ? 'out' : ''}`}>
                      <div className={`msg-bubble ${dir}`} style={{ background: style.bg, border: `1px solid ${style.border}`, alignSelf: style.align }}>
                        {msg.content || '[Multimedia]'}
                        <div className="msg-meta">
                          {msg.sent_by && <span style={{ marginRight: 4, fontWeight: 600 }}>{msg.sent_by === 'bot' ? '🤖 Bot' : msg.sent_by}</span>}
                          {format(new Date(msg.created_at), 'HH:mm', { locale: es })}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: '12px 14px',
                  borderTop: '1px solid var(--border)',
                  background: 'var(--bg-surface)',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center'
                }}
              >
                <input
                  className="input"
                  placeholder="Escribe una respuesta para WhatsApp... (Enter para enviar)"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  disabled={sending}
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {sending ? <Loader2 size={15} className="spinner" /> : <Send size={15} />}
                  <span>Enviar</span>
                </button>
              </form>
            </div>

            {/* Info Panel */}
            <div className="lead-info-panel">
              {/* Lead Data */}
              <div className="card-sm">
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Datos del Lead</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Nombre', value: lead.name || lead.push_name || '—' },
                    { label: 'Teléfono', value: lead.phone.replace('@s.whatsapp.net', '').replace('@lid', '') },
                    { label: 'Ciudad', value: lead.city || '—' },
                    { label: 'Fuente', value: lead.source },
                    { label: 'Interés', value: lead.interest || '—' },
                    { label: 'Primer contacto', value: format(new Date(lead.created_at), 'dd MMM yyyy, HH:mm', { locale: es }) },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)', textAlign: 'right' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="card-sm">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notas Internas</div>
                  {!editNotes
                    ? <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditNotes(true)}><Edit2 size={12} /></button>
                    : <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-primary btn-sm" onClick={saveNotes}><Save size={12} />Guardar</button>
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditNotes(false)}><X size={12} /></button>
                      </div>}
                </div>
                {editNotes
                  ? <textarea className="input" value={notes} onChange={e => setNotes(e.target.value)} rows={5} style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: 13 }} placeholder="Agrega notas sobre este cliente..." />
                  : <p style={{ fontSize: 13, color: notes ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: 1.6, minHeight: 40 }}>{notes || 'Sin notas. Haz clic en editar para agregar.'}</p>}
              </div>

              {/* Quick actions */}
              <div className="card-sm">
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Acciones Rápidas</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <a
                    href={`https://wa.me/${lead.phone.replace('@s.whatsapp.net', '').replace('@lid', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ justifyContent: 'center' }}
                  >
                    <Phone size={13} /> Abrir WhatsApp Web
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
