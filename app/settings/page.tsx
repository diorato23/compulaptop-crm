'use client'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase, type Agent } from '@/lib/supabase'
import { Settings, Users, Clock, ShieldCheck, Plus, Trash2, CheckCircle2 } from 'lucide-react'

export default function SettingsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('vendedor')
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  const fetchAgents = async () => {
    const { data } = await supabase.from('agents').select('*').order('created_at')
    if (data) setAgents(data as Agent[])
    setLoading(false)
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  const addAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    await supabase.from('agents').insert({
      name: name.trim(),
      phone: phone.trim() || null,
      role: role
    })

    setName('')
    setPhone('')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    fetchAgents()
  }

  const deleteAgent = async (id: string) => {
    await supabase.from('agents').delete().eq('id', id)
    fetchAgents()
  }

  return (
    <div className="crm-layout">
      <Sidebar />
      <div className="crm-main">
        <header className="crm-header">
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Configuración</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Gestión del equipo y horarios</div>
          </div>
        </header>

        <main className="crm-content">
          <div className="page-header">
            <div>
              <h1 className="page-title">Configuración del Sistema</h1>
              <p className="page-sub">Administra asesores, horarios y conexiones</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
            {/* Left: Agents Management */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Users size={18} color="var(--accent)" />
                <span style={{ fontSize: 15, fontWeight: 700 }}>Equipo Comercial & Asesores</span>
              </div>

              {/* Add Agent Form */}
              <form onSubmit={addAgent} style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                <input
                  className="input"
                  placeholder="Nombre del asesor..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{ flex: '1 1 180px' }}
                  required
                />
                <input
                  className="input"
                  placeholder="WhatsApp (ej: 57313...)"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{ flex: '1 1 160px' }}
                />
                <select className="select" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="vendedor">Vendedor</option>
                  <option value="soporte">Soporte</option>
                  <option value="admin">Administrador</option>
                </select>
                <button type="submit" className="btn btn-primary btn-sm">
                  <Plus size={14} /> Agregar
                </button>
              </form>

              {saved && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)', fontSize: 12, marginBottom: 12 }}>
                  <CheckCircle2 size={14} /> Asesor agregado correctamente
                </div>
              )}

              {/* Agents List */}
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                  <div className="spinner" />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {agents.map(ag => (
                    <div
                      key={ag.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 8
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{ag.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                          <span>{ag.phone || 'Sin WhatsApp'}</span>
                          <span>•</span>
                          <span style={{ textTransform: 'capitalize' }}>{ag.role}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteAgent(ag.id)}
                        className="btn btn-ghost btn-sm btn-icon"
                        title="Eliminar asesor"
                      >
                        <Trash2 size={13} color="var(--red)" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Business Hours & System Status */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Business Hours Card */}
              <div className="card-sm">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Clock size={16} color="var(--yellow)" />
                  <span style={{ fontSize: 13.5, fontWeight: 700 }}>Horario de Atención</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Lunes a Viernes:</span>
                    <span style={{ fontWeight: 600 }}>09:00 a.m. - 05:00 p.m.</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Sábados:</span>
                    <span style={{ fontWeight: 600 }}>09:00 a.m. - 12:00 m.</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Domingos y Festivos:</span>
                    <span style={{ color: 'var(--red)', fontWeight: 600 }}>Cerrado</span>
                  </div>
                </div>
              </div>

              {/* Webhook Info Card */}
              <div className="card-sm">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <ShieldCheck size={16} color="var(--blue)" />
                  <span style={{ fontSize: 13.5, fontWeight: 700 }}>Webhook Evolution API</span>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.4 }}>
                  Para capturar automáticamente todas las conversaciones (mensajes de clientes, respuestas del bot e interacciones de asesores humanos):
                </p>
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 10px', fontSize: 11.5, fontFamily: 'monospace', wordBreak: 'break-all', color: 'var(--accent)' }}>
                  /api/webhook/evolution
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
                  Configura esta URL en el Evolution Manager en el evento <code>MESSAGES_UPSERT</code>.
                </p>
              </div>

              {/* Status Card */}
              <div className="card-sm">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <ShieldCheck size={16} color="var(--green)" />
                  <span style={{ fontSize: 13.5, fontWeight: 700 }}>Estado de los Servicios</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Evolution API</span>
                    <span className="realtime-dot">Conectado</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Supabase DB & Realtime</span>
                    <span className="realtime-dot">En línea</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Agente IA (Gemini)</span>
                    <span className="realtime-dot">Activo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
