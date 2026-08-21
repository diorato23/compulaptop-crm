'use client'
import Sidebar from '@/components/Sidebar'
import Dashboard from '@/components/Dashboard'

export default function HomePage() {
  return (
    <div className="crm-layout">
      <Sidebar />
      <div className="crm-main">
        <header className="crm-header">
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Dashboard</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Resumen de actividad en tiempo real
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span className="realtime-dot">En vivo</span>
          </div>
        </header>
        <main className="crm-content">
          <Dashboard />
        </main>
      </div>
    </div>
  )
}
