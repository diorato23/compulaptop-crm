import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export type LeadStatus = 'nuevo' | 'en_atencion' | 'cotizacion_enviada' | 'venta_cerrada' | 'perdido'
export type MessageDirection = 'incoming' | 'outcoming' | 'bot'

export interface Lead {
  id: number
  phone: string
  name: string | null
  push_name: string | null
  city: string | null
  source: string
  status: LeadStatus
  assigned_to: string | null
  interest: string | null
  notes: string | null
  ai_active: boolean
  last_message_at: string | null
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: number
  lead_id: number
  phone: string
  direction: MessageDirection
  content: string | null
  content_type: string
  media_url: string | null
  sent_by: string | null
  created_at: string
}

export interface Agent {
  id: string
  name: string
  phone: string | null
  role: string
  is_active: boolean
}

export interface LeadEvent {
  id: number
  lead_id: number
  event_type: string
  description: string | null
  metadata: Record<string, unknown> | null
  created_by: string | null
  created_at: string
}

export const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  nuevo:               { label: 'Nuevo',            color: '#60a5fa', bg: '#1e3a5f' },
  en_atencion:         { label: 'En Atención',      color: '#fbbf24', bg: '#3d2e0a' },
  cotizacion_enviada:  { label: 'Cotización Enviada', color: '#a78bfa', bg: '#2d1b69' },
  venta_cerrada:       { label: 'Venta Cerrada',    color: '#34d399', bg: '#064e3b' },
  perdido:             { label: 'Perdido',           color: '#f87171', bg: '#3d1515' },
}
