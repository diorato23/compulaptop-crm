'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase, type Lead, type LeadStatus, STATUS_CONFIG } from '@/lib/supabase'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Search, Bot, BotOff } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'

const COLUMNS: LeadStatus[] = ['nuevo', 'en_atencion', 'cotizacion_enviada', 'venta_cerrada', 'perdido']

const COL_DOT: Record<LeadStatus, string> = {
  nuevo: 'var(--blue)',
  en_atencion: 'var(--yellow)',
  cotizacion_enviada: 'var(--purple)',
  venta_cerrada: 'var(--green)',
  perdido: 'var(--red)',
}

export default function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchLeads = useCallback(async () => {
    const { data } = await supabase
      .from('leads')
      .select('*')
      .order('last_message_at', { ascending: false, nullsFirst: false })
    if (data) setLeads(data as Lead[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchLeads()
    const ch = supabase.channel('kanban-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchLeads)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [fetchLeads])

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return
    const newStatus = result.destination.droppableId as LeadStatus
    const leadId = parseInt(result.draggableId)
    // Optimistic update
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l))
    await supabase.from('leads').update({ status: newStatus }).eq('id', leadId)
  }

  const filtered = leads.filter(l => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      l.name?.toLowerCase().includes(q) ||
      l.push_name?.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.interest?.toLowerCase().includes(q)
    )
  })

  const byStatus = (status: LeadStatus) => filtered.filter(l => l.status === status)

  const displayName = (lead: Lead) =>
    lead.name || lead.push_name || lead.phone.replace('@s.whatsapp.net', '').replace('@lid', '')

  const timeAgo = (ts: string | null) =>
    ts ? formatDistanceToNow(new Date(ts), { addSuffix: true, locale: es }) : 'Sin actividad'

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
      <div className="spinner" />
    </div>
  )

  return (
    <>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="search-wrap" style={{ maxWidth: 280 }}>
          <Search size={14} />
          <input className="input" placeholder="Buscar lead..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filtered.length} leads</span>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {COLUMNS.map(col => {
            const colLeads = byStatus(col)
            const cfg = STATUS_CONFIG[col]
            return (
              <div key={col} className="kanban-col">
                <div className="kanban-col-header">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COL_DOT[col], flexShrink: 0 }} />
                  <span className="kanban-col-title" style={{ color: cfg.color }}>{cfg.label}</span>
                  <span className="kanban-count" style={{ background: cfg.bg, color: cfg.color }}>{colLeads.length}</span>
                </div>
                <Droppable droppableId={col}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="kanban-cards"
                      style={{ background: snapshot.isDraggingOver ? 'var(--bg-hover)' : undefined, transition: 'background 0.15s' }}
                    >
                      {colLeads.map((lead, idx) => (
                        <Draggable key={lead.id} draggableId={String(lead.id)} index={idx}>
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              className="lead-card"
                              style={{
                                ...prov.draggableProps.style,
                                opacity: snap.isDragging ? 0.85 : 1,
                                boxShadow: snap.isDragging ? 'var(--shadow-lg)' : undefined,
                              }}
                            >
                              <Link href={`/leads/${lead.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="lead-card-name">
                                  {displayName(lead)}
                                  <div className={`ai-dot ${lead.ai_active ? '' : 'paused'}`} title={lead.ai_active ? 'IA activa' : 'IA pausada'} />
                                </div>
                                <div className="lead-card-phone">{lead.phone.replace('@s.whatsapp.net', '')}</div>
                                {lead.interest && <div className="lead-card-interest">{lead.interest}</div>}
                                <div className="lead-card-footer">
                                  <span className="lead-card-time">{timeAgo(lead.last_message_at || lead.created_at)}</span>
                                  {lead.ai_active
                                    ? <Bot size={12} color="var(--green)" />
                                    : <BotOff size={12} color="var(--text-muted)" />}
                                </div>
                              </Link>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {colLeads.length === 0 && (
                        <div className="empty-state" style={{ padding: '24px 16px' }}>
                          <p style={{ fontSize: 12 }}>Sin leads</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>
    </>
  )
}
