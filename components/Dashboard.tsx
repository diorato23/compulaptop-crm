'use client'
import { useEffect, useState } from 'react'
import { supabase, type Lead } from '@/lib/supabase'
import { Users, TrendingUp, CheckCircle, Clock, BarChart2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format, subDays } from 'date-fns'
import { es } from 'date-fns/locale'

interface KPI {
  totalLeads: number
  nuevos: number
  enAtencion: number
  ventasCerradas: number
  perdidos: number
  today: number
}

interface ChartPoint {
  date: string
  leads: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 14px' }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#38bdf8' }}>{payload[0].value} leads</p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [kpi, setKpi] = useState<KPI>({ totalLeads: 0, nuevos: 0, enAtencion: 0, ventasCerradas: 0, perdidos: 0, today: 0 })
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])

  const fetchData = async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [{ data: allLeads }, { data: todayLeads }, { data: recent }] = await Promise.all([
      supabase.from('leads').select('status, created_at'),
      supabase.from('leads').select('id').gte('created_at', today.toISOString()),
      supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(5),
    ])

    if (allLeads) {
      const kpiData: KPI = {
        totalLeads: allLeads.length,
        nuevos: allLeads.filter(l => l.status === 'nuevo').length,
        enAtencion: allLeads.filter(l => l.status === 'en_atencion').length,
        ventasCerradas: allLeads.filter(l => l.status === 'venta_cerrada').length,
        perdidos: allLeads.filter(l => l.status === 'perdido').length,
        today: todayLeads?.length ?? 0,
      }
      setKpi(kpiData)

      // Chart: leads per day (last 14 days)
      const days: ChartPoint[] = []
      for (let i = 13; i >= 0; i--) {
        const d = subDays(new Date(), i)
        const dateStr = format(d, 'yyyy-MM-dd')
        const count = allLeads.filter(l => l.created_at?.startsWith(dateStr)).length
        days.push({ date: format(d, 'd MMM', { locale: es }), leads: count })
      }
      setChartData(days)
    }

    if (recent) setRecentLeads(recent as Lead[])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    // Realtime subscription
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchData)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const displayName = (lead: Lead) => lead.name || lead.push_name || lead.phone.replace('@s.whatsapp.net', '')

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div className="spinner" />
      </div>
    )
  }

  const convRate = kpi.totalLeads > 0 ? Math.round((kpi.ventasCerradas / kpi.totalLeads) * 100) : 0

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vista General</h1>
          <p className="page-sub">{kpi.today} leads nuevos hoy</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card blue">
          <div className="kpi-label">Total Leads</div>
          <div className="kpi-value" style={{ color: 'var(--blue)' }}>{kpi.totalLeads.toLocaleString()}</div>
          <div className="kpi-sub">Todos los contactos</div>
          <div className="kpi-icon"><Users size={40} /></div>
        </div>
        <div className="kpi-card yellow">
          <div className="kpi-label">En Atención</div>
          <div className="kpi-value" style={{ color: 'var(--yellow)' }}>{kpi.enAtencion}</div>
          <div className="kpi-sub">{kpi.nuevos} nuevos sin atender</div>
          <div className="kpi-icon"><Clock size={40} /></div>
        </div>
        <div className="kpi-card green">
          <div className="kpi-label">Ventas Cerradas</div>
          <div className="kpi-value" style={{ color: 'var(--green)' }}>{kpi.ventasCerradas}</div>
          <div className="kpi-sub">Este período</div>
          <div className="kpi-icon"><CheckCircle size={40} /></div>
        </div>
        <div className="kpi-card purple">
          <div className="kpi-label">Tasa Conversión</div>
          <div className="kpi-value" style={{ color: 'var(--purple)' }}>{convRate}%</div>
          <div className="kpi-sub">Leads → Ventas</div>
          <div className="kpi-icon"><TrendingUp size={40} /></div>
        </div>
      </div>

      {/* Chart + Recent */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        <div className="chart-card">
          <div className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={16} color="#38bdf8" /> Leads por Día (últimos 14 días)
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="leads" stroke="#38bdf8" strokeWidth={2} fill="url(#grad)" dot={false} activeDot={{ r: 5, fill: '#38bdf8' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="chart-title">Últimos Leads</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
            {recentLeads.map(lead => (
              <a key={lead.id} href={`/leads/${lead.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', transition: 'all 0.15s', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#38bdf8', flexShrink: 0 }}>
                    {displayName(lead)[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName(lead)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.status.replace('_', ' ')}</div>
                  </div>
                </div>
              </a>
            ))}
            {recentLeads.length === 0 && (
              <div className="empty-state"><p>Sin leads aún</p></div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
