'use client'
import Sidebar from '@/components/Sidebar'
import KanbanBoard from '@/components/KanbanBoard'

export default function LeadsPage() {
  return (
    <div className="crm-layout">
      <Sidebar />
      <div className="crm-main">
        <header className="crm-header">
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Leads</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Gestión de clientes por etapa</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span className="realtime-dot">En vivo</span>
          </div>
        </header>
        <main className="crm-content" style={{ paddingBottom: 0 }}>
          <KanbanBoard />
        </main>
      </div>
    </div>
  )
}
